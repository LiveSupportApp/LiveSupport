const fs = require('fs-extra');
const path = require('path');
const App = require('./App');

class Package {
	/**
	 * パッケージを初期化する
	 */
	static init() {
		if (!fs.existsSync(App.path)) fs.mkdirSync(App.path);
		let files = fs.readdirSync(path.join(__dirname, 'package'));
		for (let file of files) {
			if (!fs.existsSync(this.getPath(file))) {
				fs.copySync(path.join(__dirname, 'package', file), this.getPath(file));
			}
		}
	}

	/**
	 * パッケージを表す情報
	 * @typedef {Object} Package
	 * @property {string} name パッケージ名
	 * @property {boolean} internal 内部パッケージか
	 */

	/**
	 * パッケージが存在するか確認する
	 * @param  {Package}  data パッケージ情報
	 * @return {Boolean}
	 */
	static isExtra(data) {
		return fs.existsSync(this.getPath(data));
	}

	/**
	 * パッケージのパスを取得する
	 * @param  {string|Package} data パッケージ情報
	 * @return {string}
	 */
	static getPath(data) {
		if (typeof data == 'string') {
			return path.join(App.path, data);
		} else if (typeof data == 'object') {
			return path.join((data.internal)?path.join(__dirname, 'package'):App.path, data.name, 'index.html');
		}
	}

	/**
	 * コンフィグを取得する
	 * @return {Config}
	 * @readonly
	 */
	static get config() {
		return require(this.getPath('config.json'));
	}

	/**
	 * パッケージを読み込む
	 * @param  {*} win  パッケージを入れる変数
	 * @param  {Package} data 読み込むパッケージの情報
	 */
	static load(win, data) {
		if (!this.isExtra(data)) showError('指定したパッケージが存在しません！');
		win = new BrowserWindow({ transparent: true, frame: false, skipTaskbar: true, show: false });
		win.loadURL(this.getPath(data));
		win.on('closed', () => { win = null; });
	}
}

module.exports = Package;
