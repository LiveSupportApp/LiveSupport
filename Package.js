const fs = require('fs-extra');
const path = require('path');
const App = require('./App');
const {BrowserWindow} = require('electron');

class Package {
	/**
	 * パッケージを初期化する
	 */
	static init() {
		if (!fs.existsSync(App.path)) fs.mkdirSync(App.path);
		let files = fs.readdirSync(this.path);
		for (let file of files) {
			let filePath = path.join(App.path, file);
			if (!fs.existsSync(filePath)) {
				fs.copySync(path.join(this.path, file), filePath);
			}
		}
	}

	/**
	 * パッケージが存在するか確認する
	 * @param  {string}  name パッケージ名
	 * @return {Boolean}
	 */
	static isExtra(name) {
		return fs.existsSync(this.getPath(name));
	}

	/**
	 * パッケージのパスを取得する
	 * @param  {string} name パッケージ名
	 * @return {string}
	 */
	static getPath(name) {
		return path.join(App.path, name, 'index.html');
	}

	/**
	 * コンフィグを取得する
	 * @return {Object}
	 * @readonly
	 */
	static get config() {
		return require(path.join(App.path, 'config.json'));
	}

	/**
	 * パッケージを読み込む
	 * @param  {string} name パッケージ名
	 * @return {BrowserWindow}
	 */
	static getPackage(name) {
		if (!this.isExtra(name)) showError('指定したパッケージが存在しません！');
		let win = new BrowserWindow({ transparent: true, frame: false, skipTaskbar: true, show: false });
		win.loadURL(this.getPath(name));
		win.on('closed', () => { win = null; });
		return win;
	}

	/**
	 * パッケージフォルダのパスを取得する
	 * @return {string}
	 * @readonly
	 */
	static get path() {
		return path.join(__dirname, 'package');
	}
}

module.exports = Package;
