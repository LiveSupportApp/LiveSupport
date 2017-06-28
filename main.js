'use strict';

const {app,Menu,Tray,nativeImage,BrowserWindow,globalShortcut} = require('electron'),
			path = require('path'),
			fs = require('fs');

var mainWindow = null, optWindow = null, settings = {};

app.on('ready', () => {
	settings = require(path.join(__dirname, 'settings/settings.json'));
	// if (settings.first) {showOptionPage(init)} else {init()}
	init()
});

function init() {
	var setWin = require(path.join(__dirname, 'settings/setWin.json'));

	if (settings.niconico) {
		var size = require('electron').screen.getPrimaryDisplay().size, setting = false;
		mainWindow = new BrowserWindow({ width: size.width, height: size.width, x: 0, y: 0, resizable : false, movable: false, minimizable: false, maximizable: false, focusable: true, alwaysOnTop: true, fullscreen: true, skipTaskbar: true, transparent: true, frame: false });
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
		mainWindow = new BrowserWindow({ width: 300, height: 100, transparent: true, frame: false, skipTaskbar: true });
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
		click: (e) => {
			mainWindow.setAlwaysOnTop(e.checked);
			settings.onTop = e.checked;
		}
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
}

function showOptionPage(callback) {
	optWindow = new BrowserWindow({ frame: false, width: 500, height: 500 });
	optWindow.loadURL(path.join(__dirname, 'app/options.html'));
	optWindow.on('closed', () => { optWindow = null;callback(); });
}
