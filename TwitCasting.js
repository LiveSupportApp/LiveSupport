const EventEmitter  = require('events').EventEmitter;
const credential    = require('./credential/twitcasting.json');
const request       = require('request');
const BrowserWindow = require('electron').BrowserWindow;
const url           = require('url');
const Util          = require('./Util');
const storage       = require('electron-json-storage');

class TwitCasting extends EventEmitter {
	constructor() {
		super();
	}

	authorize(data) {
		storage.get('twitcasting', (err, data) => {
			Util.showError(err);
			if (Object.keys(data).length === 0) {
				this.getNewToken();
			} else {
				this.token = data;
				this.getUser();
			}
		});
	}

	getNewToken() {
		this.win = new BrowserWindow();
		this.win.loadURL(`https://ssl.twitcasting.tv/oauth_confirm.php?client_id=${credential.client_id}&response_type=code`);
		this.win.on('closed', () => { this.win = null; });
		this.win.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
			let code = url.parse(newUrl, true).query.code;
			if (code) {
				this.win.close();
				request.post({
					uri: 'https://apiv2.twitcasting.tv/oauth2/access_token',
					headers: { 'Content-type': 'application/x-www-form-urlencoded' },
					form: {
						code         : code,
						grant_type   : 'authorization_code',
						client_id    : credential.client_id,
						client_secret: credential.client_secret,
						redirect_uri : credential.redirect_uri
					},
					json: true
				}, (err, res, data) => {
					storage.set('twitcasting', data.access_token, Util.showError);
					this.token = data.access_token;
					this.getUser();
				});
			}
		});
	}

	getUser() {
		request.get({
			uri: 'https://apiv2.twitcasting.tv/verify_credentials',
			headers: {
				'Accept': 'application/json',
				'X-Api-Version': '2.0',
				'Authorization': 'Bearer '+this.token
			},
			json: true
		}, (err, res, data) => {
			if (err) {
				this.emit('error', err);
			} else if (res.statusCode != 200) {
				this.emit('error', data);
			} else if (!data.user.is_live) {
				this.emit('error', new Error('No live was found'));
			} else {
				this.userId = data.user.id;
				this.getLive();
			}
		});
	}

	getLive() {
		request.get({
			uri: `https://apiv2.twitcasting.tv/users/${this.userId}/current_live`,
			headers: {
				'Accept': 'application/json',
				'X-Api-Version': '2.0',
				'Authorization': 'Bearer '+this.token
			},
			json: true
		}, (err, res, data) => {
			if (err) {
				this.emit('error', err);
			} else if (res.statusCode != 200) {
				this.emit('error', data);
			} else {
				this.movieId = data.movie.id;
				this.emit('ready');
			}
		});
	}

	getChat() {
		request.get({
			uri: `https://apiv2.twitcasting.tv/movies/${this.movieId}/comments`,
			headers: {
				'Accept': 'application/json',
				'X-Api-Version': '2.0',
				'Authorization': 'Bearer '+this.token
			},
			form: {
				limit: 50,
			},
			json: true
		}, (err, res, data) => {
			if (err) {
				this.emit('error', err);
			} else if (res.statusCode != 200) {
				this.emit('error', data);
			} else {
				this.emit('json', data);
			}
		});
	}

	listen(timeout) {
		setInterval(()=>{this.getChat()}, timeout);
		let lastRead = 0;
		this.on('json', data => {
			for (let comment of data.comments.reverse()) {
				if (lastRead < comment.created) {
					lastRead = comment.created;
					this.emit('chat', comment);
				}
			}
		});
	}

	send(message) {
		request.post({
			uri: `https://apiv2.twitcasting.tv/movies/${this.movieId}/comments`,
			headers: {
				'Accept': 'application/json',
				'X-Api-Version': '2.0',
				'Authorization': 'Bearer '+this.token
			},
			form: { comment: message }
		}, (err, res, data) => {
			if (err) {
				this.emit('error', err);
			} else if (res.statusCode != 200) {
				this.emit('error', data);
			}
		});
	}
}

module.exports = TwitCasting;
