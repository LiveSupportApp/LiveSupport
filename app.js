const app = require('electron').app;
const path = require('path');
const util = request('./util.js')
const appPath = path.join(app.getPath('home'), '.ls');

if (app.makeSingleInstance((argv, workingDirectory) => {})) {
	util.showError('すでに起動してるっぽいdёsц☆');
	app.quit();
}

class App {
	static get path() {
		return appPath;
	}
}

module.exports = App;
