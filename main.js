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
			fs       = require('fs'),
			proc     = require('child_process'),
			notifier = require('node-notifier'),
			yt       = require('./youtube');

var mainWindow = null, optWindow = null, settings = {};

app.on('ready', () => {
	settings = require(path.join(__dirname, 'settings/settings.json'));
	// if (settings.first) {showOptionPage(init)} else {init()}
	init()
});

function init() {
	var setWin = require(path.join(__dirname, 'settings/setWin.json'));

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
		label: 'オプション',
		click: () => { showOptionPage(); }
	}, {
		label: '終了',
		click: () => { app.quit(); }
	}];
	if (settings.niconico) {menuData.splice(0,2)}
	tray.setContextMenu(Menu.buildFromTemplate(menuData));
	tray.setToolTip('YouTubeLive補助ツール');
	tray.on('click', () => { mainWindow.focus(); });
	// main();
}

function showOptionPage(callback) {
	optWindow = new BrowserWindow({ width: 500, titleBarStyle: 'hidden' });
	optWindow.loadURL(path.join(__dirname, 'app/options.html'));
	optWindow.on('closed', () => { optWindow = null;if(callback) callback(); });
}

// function main() {
// 	var lastRead = Date.now(),liveChatId='',readingText;

// 	if (!settings.channelId||!settings.APIkey) {
// 		notifi('チャンネルIDとAPIキーを設定してください。');
// 	} else {
// 		yt.isLive(settings.channelId,(is,id)=>{
// 			if (!is) return;
// 			liveChatId = yt.getChatId(settings.apikey,id);
// 			if(liveChatId) {
// 				setInterval(() => {
// 					yt.getMsg(settings.apikey,(msg,id) => {
// 						yt.getName(id,(name,url)=>{
// 							mainWindow.webContents.send('chat', {msg:msg,name:name,url:url});
// 							if (settings.reading) {
// 								switch (settings.whatReading) {
// 									case 'msg': readingText = msg;
// 									case 'all': default: readingText = name+' '+msg;
// 								}
// 								proc.exec(settings.path+' /t "'+(msg.replace('"','').replace('\n',''))+'"');
// 							}
// 						});
// 					});
// 				}, settings.timeout);
// 			}
// 			notifi('配信URLが見つかりません。配信している場合は暫く待って再起動してください');
// 		});
// 	}
// }

// function notifi(msg) {new Notification('YouTubeLive補助ツール' {body: msg})}
