'use strict';

const {
				app,
				Menu,
				Tray,
				dialog,
				BrowserWindow,
				globalShortcut
			}    = require('electron'),
			path = require('path'),
			fs   = require('fs-extra'),
			proc = require('child_process'),
			YouTube = require('./youtube.js');

let mainWindow = null, optWindow = null, settings = {}, tray = null;

app.on('ready', () => {
	// タスクトレイアイコン
	tray = new Tray(path.join(__dirname, '/icon/icon.png'));
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
	tray.setToolTip('YouTubeLiveSupport');
	tray.setContextMenu(Menu.buildFromTemplate(menuData));
	// fileInit();
});

function appInit() {
	if (settings.nico.is) {
		var sizing = false;
		mainWindow = new BrowserWindow({ x: 0, y: 0, resizable : false, movable: false, minimizable: false, maximizable: false, focusable: true, alwaysOnTop: !settings.nico.chromakey.is, fullscreen: true, skipTaskbar: true, transparent: true, frame: false });
		mainWindow.setIgnoreMouseEvents(true);
		// mainWindow.openDevTools();
		mainWindow.maximize();
		mainWindow.loadURL(path.join(__dirname, 'app/nico.html'));
		mainWindow.on('closed', () => { mainWindow = null; });
		globalShortcut.register('F8', () => {
			sizing = !sizing;
			mainWindow.webContents.send('set', sizing);
			mainWindow.setIgnoreMouseEvents(!sizing);
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
	fileInit();
}

function init() {
	// 未設定の場合
	if (!(settings.channelId&&settings.APIkey)) {
		msgbox({
			type: 'error',
			btns: ['はい','キャンセル'],
			msg: 'チャンネルIDとAPIキーを設定してください。',
			detail: '今すぐ設定しますか？'
		}, (id) => {
			if (id==0) {
				showOptionPage(() => {
					settings = require(path.join(__dirname, 'settings/settings.json'));
					appInit();
				});
			}
		});return
	}

	// 初期設定
	var yt = new YouTube(settings.APIkey, settings.channelId);
	yt.getLive((err, is) => {
		if (err) return dialog.showErrorBox('YouTubeLiveSupport', err);
		if (!is) {
			msgbox({
				type: 'warning',
				btns: ['OK', '再取得'],
				msg: '配信URLが見つかりません。',
				detail: '配信している場合は暫く待って取得してください。'
			}, (id) => {if (id==1) init();});return
		}
		yt.getChatId((err) => {
			if (err) {
				msgbox({
					type: 'warning',
					btns: ['OK', '再取得'],
					msg: 'チャットの取得に失敗しました。',
					detail: '配信している場合は暫く待って取得してください。'
				}, id => {if (id==1) init();});return
			}
			setInterval(main, settings.timeout);
		});
	});
}

function main() {
	let lastRead = Date.now();

	yt.getMsg((json) => {
		for (let i=0,item,t,msg,name,author; i<json.items.length; i++) {
			item = json.items[i];
			t = new Date(item.snippet.publishedAt).getTime();
			if (lastRead < t) {
				lastRead = t;
				msg  = item.snippet.displayMessage;
				author = item.authorDetails;
				name = item.authorDetails.displayName;
				let type = {
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
			}
		}
	});
}

function fileInit() {
	initFile('setWin.json');
	initFile('settings.json', is => {
		if (is) {
			msgbox({
				type: 'warning',
				btns: ['OK'],
				msg: '初回起動のため設定ウィンドウを表示します。'
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
}

function initFile(file, callback) {
	try {
		fs.statSync(path.join(__dirname, 'settings/', file));
		if (callback) callback(false);
	} catch(err) {
		console.log(err);
		if(err.code!=='ENOENT') return dialog.showErrorBox('YouTubeLiveSupport', err);
		fs.copySync(path.join(__dirname, 'settings/default/', file), path.join(__dirname, 'settings/', file));
		if (callback) callback(true);
	}
}

function showOptionPage(callback) {
	optWindow = new BrowserWindow({ width: 500, titleBarStyle: 'hidden' });
	optWindow.loadURL(path.join(__dirname, 'app/options.html'));
	optWindow.on('closed', () => { optWindow = null;if(callback) callback(); });
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

function read() {
	let readingText = '';
	switch (settings.whatReading) {
		case 'msg': readingText = msg;
		case 'all': default: readingText = name+' '+msg;
	}
	proc.exec(settings.path+' /t "'+(msg.replace('"','').replace('\n',''))+'"');
}
