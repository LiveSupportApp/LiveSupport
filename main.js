'use strict';

const {
				app,
				Menu,
				Tray,
				dialog,
				nativeImage,
				BrowserWindow,
				globalShortcut
			}        = require('electron'),
			path     = require('path'),
			fs       = require('fs-extra'),
			proc     = require('child_process'),
			yt       = require('./youtube'),
			request  = require('request');

var mainWindow = null, optWindow = null, settings = {};

app.on('ready', () => {
	initFile(['settings.json', 'setWin.json']);
	settings = require(path.join(__dirname, 'settings/settings.json'));
	// if (!(settings.channelId&&settings.APIkey)) {showOptionPage(init)} else {init()}
	init()
});

function init() {

	if (settings.nico.is) {
		var size = require('electron').screen.getPrimaryDisplay().size, setting = false;
		mainWindow = new BrowserWindow({ width: size.width, height: size.width, x: 0, y: 0, resizable : false, movable: false, minimizable: false, maximizable: false, focusable: true, alwaysOnTop: !settings.nico.chromakey.is, fullscreen: true, skipTaskbar: true, transparent: true, frame: false });
		mainWindow.setIgnoreMouseEvents(true);
		mainWindow.openDevTools();
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

	var tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'icon/icon.png')));
	var menuData = [{
		label: '表示',
		click: () => { mainWindow.focus(); }
	}, {
		label: '常に手前に表示',
		type: 'checkbox',
		checked: settings.onTop,
		click: (e) => { settings.onTop = e.checked; }
	}, {
		label: 'ライブを取得する',
		click: () => { main(); }
	}, {
		label: 'オプション',
		click: () => { showOptionPage(); }
	}, {
		label: '終了',
		click: () => { app.quit(); }
	}];
	if (settings.niconico) {menuData.splice(0,2)}
	tray.setContextMenu(Menu.buildFromTemplate(menuData));
	tray.setToolTip('YouTubeLiveSupport');
	main();
}

function showOptionPage(callback) {
	optWindow = new BrowserWindow({ width: 500, titleBarStyle: 'hidden' });
	optWindow.loadURL(path.join(__dirname, 'app/options.html'));
	optWindow.on('closed', () => { optWindow = null;if(callback) callback(); });
}

function main() {
	var lastRead = Date.now(),liveChatId='',readingText;

	if (!(settings.channelId&&settings.APIkey)) {
		msgbox({
			type: 'error',
			btns: ['はい','キャンセル'],
			msg: 'チャンネルIDとAPIキーを設定してください。',
			detail: '今すぐ設定しますか？'
		}, (id) => {
			console.log(id);
			if (id==0) showOptionPage();
		});return
	}

	yt.isLive(settings.channelId,(err,is,id)=>{
		if (err) return dialog.showErrorBox('YouTubeLiveSupport', err);
		if (!is) {
			msgbox({
				type: 'warning',
				btns: ['OK', '再取得'],
				msg: '配信URLが見つかりません。',
				detail: '配信している場合は暫く待って取得してください。'
			},(id) => {if (id==1) main();});return
		}
		yt.getChatId(settings.APIkey, id, (err,id) => {
			if (err||!id) {
				msgbox({
					type: 'warning',
					btns: ['OK', '再取得'],
					msg: 'チャットの取得に失敗しました。',
					detail: '配信している場合は暫く待って取得してください。'
				},(id) => {if (id==1) main();});return
			}
			liveChatId = id;
			setInterval(() => {
				yt.getMsg(settings.APIkey,liveChatId,(json) => {
					for (var i=0;i<json.items.length;i++) {
						var snippet = json.items[i].snippet;
						var t = new Date(snippet.publishedAt).getTime();
						if (lastRead < t) {
							lastRead = t;var msg = snippet.displayMessage;
							yt.getName(id,(name,url)=>{
								mainWindow.webContents.send('chat', {msg:msg,name:name,url:url});
								if (settings.reading) {
									switch (settings.whatReading) {
										case 'msg': readingText = msg;
										case 'all': default: readingText = name+' '+msg;
									}
									proc.exec(settings.path+' /t "'+(msg.replace('"','').replace('\n',''))+'"');
								}
							});
						}
					}
				});
			}, settings.timeout);
		});
	});
}

function initFile(files) {
	for (var i=0;i<files.length;i++) {
		var file = files[i];
		try {
			fs.statSync(path.join(__dirname, 'settings/', file));
		} catch(err) {
			if(err.code!=='ENOENT') {dialog.showErrorBox('YouTubeLiveSupport', err);continue}
			fs.copySync(path.join(__dirname, 'settings/default/', file), path.join(__dirname, 'settings/', files[i]));
		}
	}
}

function msgbox(params,callback) {
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
