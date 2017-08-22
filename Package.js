const fs = require('fs-extra');
const path = require('path');
const App = require('./App');

class Package {
	static init() {
		if (!fs.existsSync(App.path)) fs.mkdirSync(App.path);
		let files = fs.readdirSync(path.join(__dirname, 'package'));
		for (let file of files) {
			if (!fs.existsSync(this.getPath(file))) {
				fs.copySync(path.join(__dirname, 'package', file), this.getPath(file));
			}
		}
	}

	static isExtra(data) {
		return fs.existsSync(this.getPath(data));
	}

	static getPath(data) {
		if (typeof data == 'string') {
			return path.join(App.path, data);
		} else if (typeof data == 'object') {
			return path.join((data.internal)?path.join(__dirname, 'package'):App.path, data.name, 'index.html');
		}
	}

	static get config() {
		return require(package.getPath('config.json'));
	}

	static load(win, data) {
		if (!this.isExtra(data)) showError('指定したパッケージが存在しません！');
		win = new BrowserWindow({ transparent: true, frame: false, skipTaskbar: true, show: false });
		win.loadURL(this.getPath(data));
		win.on('closed', () => { win = null; });
	}
}

module.exports = Package;
