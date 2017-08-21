const fs = require('fs-extra');
const path = require('path');
const app = require('./app.js');

class Package {
	static init() {
		if (!fs.existsSync(app.path)) fs.mkdirSync(app.path);
		let files = fs.readdirSync(path.join(__dirname, 'package'));
		for (let file of files) {
			if (!fs.existsSync(path.join(app.path, file))) {
				fs.copySync(path.join(__dirname, 'package', file), path.join(app.path, file));
			}
		}
	}

	static isExtra(data) {
		return fs.existsSync(this.getPath(data));
	}

	static getPath(data) {
		if (typeof data == 'string') {
			return path.join(app.path, data);
		} else if (typeof data == 'object') {
			return path.join((data.internal)?path.join(__dirname, 'package'):app.path, data.name, 'index.html');
		}
	}

	static get config() {
		return require(package.getPath('config.json'));
	}
}

module.exports = Package;
