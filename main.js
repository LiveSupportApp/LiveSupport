'use strict';

const {app,Menu,Tray,nativeImage,BrowserWindow} = require('electron'),
	path = require('path'),
	fs = require('fs');

var mainWindow = null, optWindow = null, settings = {};

app.on('ready', () => {
	settings = require(path.join(__dirname, 'settings/settings.json'));
	if (settings.first) {showOptionPage(init)} else {init()}
});

function init() {
	setWin = require(path.join(__dirname, 'settings/setWin.json'));
	mainWindow = new BrowserWindow({ "width": 300, "height": 100, "transparent": true, "frame": false, "skip-taskbar": true });
	mainWindow.loadURL(path.join(__dirname, 'app/index.html'));
	mainWindow.on('closed', () => { mainWindow = null; });
  mainWindow.setPosition(setWin.x, setWin.y);
  mainWindow.setSize(setWin.width, setWin.height);
	mainWindow.on('close', () => {
		fs.writeFile(path.join(__dirname, 'settings/setWin.json'), JSON.stringify(mainWindow.getBounds()), (err) => {});
		fs.writeFile(path.join(__dirname, 'settings/settings.json'), JSON.stringify(settings,undefined,'	'), (err) => {});
	});

	var tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'icon/icon.png')));
	var contextMenu = Menu.buildFromTemplate([{
		label: '表示',
		click: () => { mainWindow.focus(); }
	}, {
		label: '右下に移動',
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
	}]);
	tray.setContextMenu(contextMenu);
	tray.setToolTip('YouTubeLive補助ツール');
	tray.on('click', () => { mainWindow.focus(); });
}

function showOptionPage(callback) {
	optWindow = new BrowserWindow({ frame: false, width: 500, height: 500 });
	optWindow.loadURL(path.join(__dirname, 'app/options.html'));
	optWindow.on('closed', () => { optWindow = null;callback(); });
}
