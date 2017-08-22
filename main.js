const {
				app,
				BrowserWindow,
				globalShortcut
			}       = require('electron'),
			path    = require('path'),
			prompt  = require('electron-prompt');

const API     = require('./api.js'),
const API     = require('./API'),
			util    = require('./Util'),
			package = require('./Package'),
			App     = require('./App');

let mainWindow, api, config;

app.on('ready', () => {
	init();
	main();
});

function init() {
	package.init();
	config = package.config;
	app.trayInit();

	if (!package.isExtra(config.package)) showError('指定したパッケージが存在しません！');
	mainWindow = new BrowserWindow({ transparent: true, frame: false, skipTaskbar: true, alwaysOnTop: true, show: false });
	mainWindow.loadURL(package.getPath(config.package));
	mainWindow.on('closed', () => { mainWindow = null; });
}

function main() {
	api = new API(config.type);
	api.authorize();

	api.on('ready', () => {
		api.listen(config.timeout||1000);
		globalShortcut.register('ALT+/', () => {
			prompt({ title: 'LiveSupport', label: 'メッセージを入力してください' }).then(res => {
				if (res) api.send(res);
			});
		});
	});

	api.on('error', err => {
		if (err.message=='No live was found') {
			util.msgbox({
				type: 'warning',
				btns: ['OK', '再取得'],
				msg: '配信が見つかりませんでした。',
				detail: '配信している場合は暫く待って取得してください。'
			}, id => {if (id==1) main()});return;
		} else if (err.message=='Can not find chat') {
			util.msgbox({
				type: 'warning',
				btns: ['OK', '再取得'],
				msg: 'チャットが取得できませんでした。',
				detail: '配信している場合は暫く待って取得してください。'
			}, id => {if (id==1) main()});return;
		} else {
			util.showError(err);
		}
	});

	api.on('chat', item => {
		console.log(item.message);
		let msg, name, author, type;
		// msg    = item.snippet.displayMessage;
		// author = item.authorDetails;
		// name   = item.authorDetails.displayName;
		// type   = {
		// 	verified:  author.isVerified,
		// 	owner:     author.isChatOwner,
		// 	sponsor:   author.isChatSponsor,
		// 	moderator: author.isChatModerator
		// };
		// if (config.reading.is) read(msg, name);
		// font size 40 #30 20 px
		mainWindow.webContents.send('chat', {
			msg:  item.message,
			// name: name,
			// url:  author.profileImageUrl,
			// type: type
		});
	});
}
