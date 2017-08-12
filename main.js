'use strict';

const {
				app,
				Menu,
				Tray,
				shell,
				dialog,
				ipcMain,
				nativeImage,
				BrowserWindow,
				globalShortcut
			}          = require('electron'),
			path       = require('path'),
			fs         = require('fs-extra'),
			proc       = require('child_process'),
			YouTube    = require('./youtube.js'),
			storage    = require('electron-json-storage'),
			prompt     = require('electron-prompt'),
			credential = require('./client_secret.json'),
			googleAuth = require('google-auth-library');


let mainWindow = null, optWindow = null, config = null, liveChatId = '', tray = null, yt = null;

if (app.makeSingleInstance((argv, workingDirectory) => {})) app.quit();

app.on('ready', () => {
	storage.get('config', (err, data) => {
		showError(err);

		if (Object.keys(data).length === 0) {
			// デフォルト値のセット
		} else {
			config = data;
			appInit();
		}
	});
});

function appInit() {
	if (config.nico.is) {
		var setting = false;
		mainWindow = new BrowserWindow({ x: 0, y: 0, resizable : false, movable: false, minimizable: false, maximizable: false, focusable: true, alwaysOnTop: !config.nico.chromakey.is, fullscreen: true, skipTaskbar: true, transparent: true, frame: false });
		mainWindow.setIgnoreMouseEvents(true);
		// mainWindow.openDevTools();
		mainWindow.maximize();
		mainWindow.loadURL(path.join(__dirname, 'app/nico.html'));
		mainWindow.on('closed', () => { mainWindow = null; });
		globalShortcut.register('F8', () => {
			setting = !setting;
			mainWindow.webContents.send('set', setting);
			mainWindow.setIgnoreMouseEvents(!setting);
		});
	} else {
		mainWindow = new BrowserWindow({ transparent: true, frame: false, skipTaskbar: true, alwaysOnTop: true, show: false });
		mainWindow.loadURL(path.join(__dirname, 'app/index.html'));
		mainWindow.on('closed', () => { mainWindow = null; });
	}

	tray = new Tray(nativeImage.createFromPath(path.join(__dirname, '/icon/icon.png')));
	tray.setContextMenu(Menu.buildFromTemplate([{
		label: 'ライブを取得する',
		click: () => { main(); }
	}, {
		label: 'オプション',
		click: () => { showOptionPage(); }
	}, {
		label: '終了',
		click: () => { app.quit(); }
	}]));
	tray.setToolTip('YouTubeLiveSupport');
	authorize();
}

function authorize() {
	const auth = new googleAuth();
	const oauth2Client = new auth.OAuth2(credential.installed.client_id, credential.installed.client_secret, credential.installed.redirect_uris[0]);

	storage.get('token', (err, data) => {
		if (err) throw err;

		if (Object.keys(data).length === 0) {
			msgbox({
				type: 'info',
				btns: ['OK'],
				msg: 'OAuth認証を行います。',
				detail: '次のページから認証を行いコードを入力してください。'
			}, id => {
				getNewToken(oauth2Client);
			});
		} else {
			oauth2Client.credentials = data;
			main(oauth2Client);
		}
	});
}

function getNewToken(oauth2Client) {
	var authUrl = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: 'https://www.googleapis.com/auth/youtube'
	});

	shell.openExternal(authUrl);

	prompt({ title: 'YouTubeLiveSupport', label: 'コードを入力してください' }).then(res => {
		oauth2Client.getToken(res, (err, token) => {
			if (err) return console.log('Error while trying to retrieve access token', err);
			oauth2Client.credentials = token;
			storage.set('token', token, console.error);
			main(oauth2Client);
		});
	}).catch(console.error);
}

function main(auth) {
	yt = new YouTube(auth);

	yt.on('ready', () => {
		yt.listen(config.timeout);
		globalShortcut.register('ALT+/', () => {
			prompt({ title: 'YouTubeLiveSupport', label: 'メッセージを入力してください' }).then(res => {
				if (res) yt.send(res);
			});
		});
	});

	yt.on('error', err => {
		if (err.message=='Can not find live') {
			msgbox({
				type: 'warning',
				btns: ['OK', '再取得'],
				msg: '配信が見つかりませんでした。',
				detail: '配信している場合は暫く待って取得してください。'
			}, id => {if (id==1) main()});return
		} else if (err.message=='Can not find chat') {
			msgbox({
				type: 'warning',
				btns: ['OK', '再取得'],
				msg: 'チャットが取得できませんでした。',
				detail: '配信している場合は暫く待って取得してください。'
			}, id => {if (id==1) main()});return
		} else {
			showError(err);
		}
	});

	yt.on('chat', item => {
		let msg, name, author, type;
		msg    = item.snippet.displayMessage;
		author = item.authorDetails;
		name   = item.authorDetails.displayName;
		type   = {
			verified:  author.isVerified,
			owner:     author.isChatOwner,
			sponsor:   author.isChatSponsor,
			moderator: author.isChatModerator
		};
		// font size 40 #30 20 px
		mainWindow.webContents.send('chat', {
			msg:  msg,
			name: name,
			url:  author.profileImageUrl,
			type: type
		});
		if (config.reading) read(msg, name, type);
	});
}

function showOptionPage(callback) {
	optWindow = new BrowserWindow({ width: 500, titleBarStyle: 'hidden' });
	optWindow.loadURL(path.join(__dirname, 'app/options.html'));
	optWindow.on('closed', () => { optWindow = null; });

	ipcMain.on('data', (event, data) => {
		config = data;
		storage.set('config', config, err => {
			showError(err);
			event.sender.send('reply');
		});
	});

	optWindow.on('close', () => { if (callback) callback(); });
}

function msgbox(params, callback) {
	dialog.showMessageBox({
		type: params.type,
		buttons: params.btns,
		defaultId: 0,
		title: 'YouTubeLiveSupport',
		message: params.msg,
		detail: params.detail || '',
		cancelId: -1,
		noLink: true
	}, (res) => {
		callback(res);
	});
}

function read(msg, name, type) {
	let readingText = '';
	switch (config.whatReading) {
		case 'msg': readingText = msg;
		case 'all': default: readingText = name+' '+msg;
	}
	proc.exec(config.path+' /t "'+(msg.replace('"','').replace('\n',''))+'"');
}

function showError(err) {
	if (err) dialog.showErrorBox('YouTubeLiveSupport', err);
}
