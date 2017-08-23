const fs = require('fs-extra');
const path = require('path');
const App = require('./App');
const Util = require('./Util');
const {BrowserWindow} = require('electron');

class Package {
	/**
	 * パッケージを初期化する
	 */
	static init() {
		let PackagePath = path.join(__dirname, 'package');
		if (fs.existsSync(this.path)) {
			let files = fs.readdirSync(PackagePath);
			for (let file of files) {
				let filePath = path.join(this.path, file);
				if (!fs.existsSync(filePath)) {
					fs.copySync(path.join(PackagePath, file), filePath);
				}
			}
		} else {
			fs.copySync(PackagePath, this.path);
		}
	}

	/**
	 * パッケージのパスを取得する
	 * @param  {string} name パッケージ名
	 * @return {string}
	 */
	static getPath(name) {
		return path.join(this.path, name, 'index.html');
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
	 * コンフィグを取得する
	 * @return {Object}
	 * @readonly
	 */
	static get config() {
		return require(path.join(App.path, 'package', 'config.json'));
	}

	/**
	 * パッケージを読み込む
	 * @param  {string} name パッケージ名
	 * @return {BrowserWindow}
	 */
	static getPackage(name) {
		if (!this.isExtra(name)) Util.showError('指定したパッケージが存在しません！');
		let win = new BrowserWindow({ transparent: true, frame: false, skipTaskbar: true, show: false });
		win.loadURL(this.getPath(name));
		win.on('closed', () => { console.log(1, this);win = null; });
		return win;
	}

	/**
	 * パッケージフォルダのパスを取得する
	 * @return {string}
	 * @readonly
	 */
	static get path() {
		return path.join(App.path, 'package');
	}
}

module.exports = Package;
