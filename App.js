const {
				app,
				Menu,
				Tray,
				nativeImage,
			} = require('electron');
const path = require('path');
const Util = require('./Util');

let tray;

class App {
	/**
	 * アプリ用ディレクトリのパスを取得する
	 * @return {string}
	 */
	static get path() {
		return path.join(app.getPath('home'), '.ls');
	}

	/**
	 * タスクトレイアイコンを初期化する
	 */
	static trayInit() {
		tray = new Tray(nativeImage.createFromPath(path.join(__dirname, '/icon/icon.png')));
		tray.setContextMenu(Menu.buildFromTemplate([{
			label: '終了',
			click: () => { app.quit(); }
		}]));
		tray.setToolTip('LiveSupport');
	}
}

module.exports = App;
