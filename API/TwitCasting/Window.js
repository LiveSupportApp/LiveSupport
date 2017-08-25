const credential = require('./credential/window.json');
const request = require('request');
const {BrowserWindow} = require('electron');
const url = require('url');
const Util = require('../Util');

class Window {
	constructor() {
		this.win = new BrowserWindow({show:false});
		this.win.loadURL(`https://ssl.twitcasting.tv/oauth_confirm.php?client_id=${credential.client_id}&response_type=code`);
		this.win.on('closed', () => { this.win = null; });
	}

	getNewToken(callback) {
		this.win.show();
		this.win.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
			let code = url.parse(newUrl, true).query.code;
			if (code) {
				this.win.close();
				request.post({
					uri: 'https://apiv2.twitcasting.tv/oauth2/access_token',
					headers: { 'Content-type': 'application/x-www-form-urlencoded' },
					form: {
						code: code,
						grant_type: 'authorization_code',
						client_id: credential.client_id,
						client_secret: credential.client_secret,
						redirect_uri: credential.redirect_uri,
					},
					json: true
				}, (err, res, data) => {
          callback(data);
				});
			}
		});
	}
}

module.exports = Window;
