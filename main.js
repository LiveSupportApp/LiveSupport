'use strict';

const {
				app,
				Menu,
				Tray,
				dialog,
				nativeImage,
				BrowserWindow,
				globalShortcut
			}       = require('electron'),
			path    = require('path'),
			fs      = require('fs-extra'),
			proc    = require('child_process'),
			YouTube = require('youtube-live-chat');

let mainWindow = null, optWindow = null, settings = {}, liveChatId = '', tray = null, yt = null;

if (app.makeSingleInstance((argv, workingDirectory) => {})) app.quit();

app.on('ready', () => {
	initFile('setWin.json');
	initFile('settings.json', is => {
		if (is) {
			msgbox({
				type: 'warning',
				btns: ['OK'],
				msg: '初回起動のため設定ウィンドウを起動します。'
			}, id => {
				showOptionPage(()=>{
					settings = require(path.join(__dirname, 'settings/settings.json'));
					appInit();
				});
			});
		} else {
			settings = require(path.join(__dirname, 'settings/settings.json'));
			appInit();
		}
	});
});

function appInit() {
	if (settings.nico.is) {
		var setting = false;
		mainWindow = new BrowserWindow({ x: 0, y: 0, resizable : false, movable: false, minimizable: false, maximizable: false, focusable: true, alwaysOnTop: !settings.nico.chromakey.is, fullscreen: true, skipTaskbar: true, transparent: true, frame: false });
		mainWindow.setIgnoreMouseEvents(true);
		// mainWindow.openDevTools();
		mainWindow.maximize();
		mainWindow.loadURL(path.join(__dirname, 'app/nico.html'));
		mainWindow.on('closed', () => { mainWindow = null; });
		globalShortcut.register('F8', () => {
			setting = !setting;
			mainWindow.webContents.send('set', setting);
			mainWindow.setIgnoreMouseEvents(!setting);
		});
	} else {
		var setWin = require(path.join(__dirname, 'settings/setWin.json'));
		mainWindow = new BrowserWindow({ width: 300, height: 100, transparent: true, frame: false, skipTaskbar: true, alwaysOnTop: true });
		mainWindow.loadURL(path.join(__dirname, 'app/index.html'));
		mainWindow.on('closed', () => { mainWindow = null; });
		mainWindow.setPosition(setWin.x, setWin.y);
		mainWindow.setSize(setWin.width, setWin.height);
		mainWindow.on('close', () => {
			fs.writeFile(path.join(__dirname, 'settings/setWin.json'), JSON.stringify(mainWindow.getBounds()), (err) => {});
			fs.writeFile(path.join(__dirname, 'settings/settings.json'), JSON.stringify(settings,undefined,'	'), (err) => {});
		});
	}

	tray = new Tray(nativeImage.createFromPath(path.join(__dirname, '/icon/icon.png')));
	var menuData = [{
		label: 'ライブを取得する',
		click: () => { init(); }
	}, {
		label: 'オプション',
		click: () => { showOptionPage(); }
	}, {
		label: '終了',
		click: () => { app.quit(); }
	}];
	tray.setContextMenu(Menu.buildFromTemplate(menuData));
	tray.setToolTip('YouTubeLiveSupport');
	init();
}

function showOptionPage(callback) {
	optWindow = new BrowserWindow({ width: 500, titleBarStyle: 'hidden' });
	optWindow.loadURL(path.join(__dirname, 'app/options.html'));
	optWindow.on('closed', () => { optWindow = null;if(callback) callback(); });
}

function init() {
	if (!(settings.channelId&&settings.APIkey)) {
		msgbox({
			type: 'error',
			btns: ['はい','キャンセル'],
			msg: 'チャンネルIDとAPIキーを設定してください。',
			detail: '今すぐ設定しますか？'
		}, (id) => {
			if (id==0) showOptionPage();
		});return
	}

	yt = new YouTube(settings.channelId, settings.APIkey);

	yt.on('ready', () => {
		yt.listen(settings.timeout);
	});

	yt.on('error', err => {
		if (err=='Can not find live') {
			msgbox({
				type: 'warning',
				btns: ['OK', '再取得'],
				msg: '配信が見つかりませんでした。',
				detail: '配信している場合は暫く待って取得してください。'
			},(id) => {if (id==1) init();});return
		} else if (err=='Can not find chat') {
			msgbox({
				type: 'warning',
				btns: ['OK', '再取得'],
				msg: 'チャットの取得に失敗しました。',
				detail: '配信している場合は暫く待って取得してください。'
			}, id => {if (id==1) init();});return
		} else {
			console.log(err);
		}
	});

	yt.on('chat', item => {
		let msg, name, author, type;
		msg    = item.snippet.displayMessage;
		author = item.authorDetails;
		name   = item.authorDetails.displayName;
		type   = {
			verified:  author.isVerified,
			owner:     author.isChatOwner,
			sponsor:   author.isChatSponsor,
			moderator: author.isChatModerator
		};
		// font size 40 #30 20 px
		mainWindow.webContents.send('chat', {
			msg:  msg,
			name: name,
			url:  author.profileImageUrl,
			type: type
		});
		if (settings.reading) read(msg, name, type);
	});
}

function initFile(file, callback) {
	try {
		fs.statSync(path.join(__dirname, 'settings/', file));
		if (callback) callback(false);
	} catch(err) {
		if(err.code!=='ENOENT') return dialog.showErrorBox('YouTubeLiveSupport', err);
		fs.copySync(path.join(__dirname, 'settings/default/', file), path.join(__dirname, 'settings/', file));
		if (callback) callback(true);
	}
}

function msgbox(params, callback) {
	dialog.showMessageBox({
		type: params.type,
		buttons: params.btns,
		defaultId: 0,
		title: 'YouTubeLiveSupport',
		message: params.msg,
		detail: params.detail || '',
		cancelId: -1,
		noLink: true
	}, (res) => {
		callback(res);
	});
}

function read(msg, name, type) {
	let readingText = '';
	switch (settings.whatReading) {
		case 'msg': readingText = msg;
		case 'all': default: readingText = name+' '+msg;
	}
	proc.exec(settings.path+' /t "'+(msg.replace('"','').replace('\n',''))+'"');
}
