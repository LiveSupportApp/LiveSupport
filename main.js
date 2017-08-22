const {
				app,
				BrowserWindow,
				globalShortcut,
			}       = require('electron');
const path    = require('path');
const prompt  = require('electron-prompt');

const API     = require('./API');
const Util    = require('./Util');
const Package = require('./Package');
const App     = require('./App');

let windows = {};
let api;
let config;

app.on('ready', () => {
	if (app.makeSingleInstance((argv, workingDirectory) => {})) {
		Util.showError('すでに起動してるっぽいdёsц☆');
		app.quit();
	}

	init();
	main();
});

function init() {
	Package.init();
	config = Package.config;
	App.trayInit();

	if (Array.isArray(config.package)) {
		for (let pack of config.package) {
			windows[pack.name] = Package.getPackage(pack);
		}
	} else if (typeof config.package == 'object' ) {
		windows[config.package.name] = Package.getPackage(config.package);
	}
}

function main() {
	api = new API(config.type);
	api.authorize();

	api.on('ready', () => {
		api.listen(config.timeout||1000);
		globalShortcut.register('ALT+/', () => {
			prompt({
				title: 'LiveSupport',
				label: 'メッセージを入力してください'
			}).then(res => {
				if (res) api.send(res);
			});
		});
	});

	api.on('error', err => {
		if (err.message=='No live was found') {
			Util.msgbox({
				type: 'warning',
				btns: ['OK', '再取得'],
				msg: '配信が見つかりませんでした。',
				detail: '配信している場合は暫く待って取得してください。'
			}, id => {if (id==1) main()});
		} else if (err.message=='Can not find chat') {
			Util.msgbox({
				type: 'warning',
				btns: ['OK', '再取得'],
				msg: 'チャットが取得できませんでした。',
				detail: '配信している場合は暫く待って取得してください。'
			}, id => {if (id==1) main()});
		} else {
			Util.showError(err);
		}
	});

	api.on('chat', item => {
		console.log(item.message);
		if (config.reading.is) read(`${msg} さん ${name}`);
		// font size 40 #30 20 px
		for (let key in windows) {
			windows[key].webContents.send('chat', item);
		}
	});
}
