const google       = require('googleapis');
const EventEmitter = require('events').EventEmitter;
const googleAuth   = require('google-auth-library');
const credential   = require('./credential/youtube.json');
const shell        = require('electron').shell;
const prompt       = require('electron-prompt');
const util         = require('../Util');
const storage      = require('electron-json-storage');
const auth         = new googleAuth();
const oauth2Client = new auth.OAuth2(credential.installed.client_id, credential.installed.client_secret, credential.installed.redirect_uris[0]);

class YouTube extends EventEmitter {
	constructor() {
		super();
		this.youtube = google.youtube('v3')
	}

	authorize() {
		storage.get('youtube', (err, data) => {
			if (err) throw err;
			if (Object.keys(data).length === 0) {
				util.msgbox({
					type: 'info',
					btns: ['OK'],
					msg: 'OAuth認証を行います。',
					detail: '次のページから認証を行いコードを入力してください。'
				}, id => {
					this.getNewToken();
				});
			} else {
				oauth2Client.credentials = data;
				this.auth = oauth2Client;
				this.getLive();
			}
		});
	}

	getNewToken() {
		let authUrl = oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: 'https://www.googleapis.com/auth/youtube'
		});

		shell.openExternal(authUrl);

		prompt({ title: 'LiveSupport', label: 'コードを入力してください' }).then(res => {
			oauth2Client.getToken(res, (err, token) => {
				if (err) {
					util.msgbox({
						type: 'warning',
						btns: ['再認証'],
						msg: '認証できませんでした。',
						detail: err.toString()
					}, id => { this.getNewToken(); });
				} else {
					oauth2Client.credentials = token;
					this.auth = oauth2Client;
					storage.set('youtube', token, util.showError);
					this.getLive();
				}
			});
		}).catch(util.showError);
	}

	getLive() {
		this.youtube.liveBroadcasts.list({
			auth: this.auth,
			part: 'id,status',
			mine: true,
			broadcastType: 'all',
			maxResults: 1,
		}, (err, res) => {
			if (err) {
				this.emit('error', err);
			} else if (!res.items[0]||res.items[0].status.recordingStatus!=='recording') {
				this.emit('error', new Error('No live was found'));
			} else {
				this.liveId = res.items[0].id;
				this.getChatId();
			}
		});
	}

	getChatId() {
		this.youtube.videos.list({
			auth: this.auth,
			part: 'liveStreamingDetails',
			id: this.liveId,
		}, (err, res) => {
			if (err) {
				this.emit('error', err);
			} else if (!res.items.length) {
				this.emit('error', new Error('Can not find chat'));
			} else {
				this.chatId = res.items[0].liveStreamingDetails.activeLiveChatId;
				this.emit('ready', null);
			}
		});
	}

	getChat() {
		this.youtube.liveChatMessages.list({
			auth: this.auth,
			liveChatId: this.chatId,
			part: 'snippet,authorDetails',
			hl: 'ja',
			maxResults: 2000,
		}, (err, res) => {
			if (err) {
				this.emit('error', err);
			} else {
				this.emit('json', res);
			}
		});
	}

	listen(timeout) {
		setInterval(()=>{this.getChat()}, timeout);
		let lastRead = 0, item = {}, time = 0;
		this.on('json', json => {
			for (let item of json.items) {
				time = new Date(item.snippet.publishedAt).getTime();
				if (lastRead < time) {
					lastRead = time;
					this.emit('chat', {
						message: item.snippet.textMessageDetails.messageText,
						name: item.authorDetails.displayName,
						url: item.author.profileImageUrl
					});
				}
			}
		});
	}

	send(message) {
		this.youtube.liveChatMessages.insert({
			auth: this.auth,
			part: 'snippet',
			resource: {
				snippet: {
					liveChatId: this.chatId,
					type: 'textMessageEvent',
					textMessageDetails: {
						messageText: message
					}
				}
			}
		})
	}
}

module.exports = YouTube;
