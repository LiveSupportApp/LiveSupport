const google = require('googleapis');
const EventEmitter = require('events').EventEmitter;

class YouTube extends EventEmitter {
	constructor(auth) {
		super();
		this.auth = auth;
		this.youtube = google.youtube('v3')
		this.getLive();
	}

	getLive() {
		this.youtube.liveBroadcasts.list({
			auth: this.auth,
			part: 'id',
			mine: true,
			broadcastType: 'all',
			maxResults: 1,
		}, (err, res) => {
			if (err) {
				this.emit('error', err);
			} else if (!res.items.length) {
				this.emit('error', new Error('Can not find live'));
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

	listen(timeout=1000) {
		setInterval(()=>{this.getChat()}, timeout);
		let lastRead = 0, item = {}, time = 0;
		this.on('json', json => {
			for (let i=0; i<json.items.length; i++) {
				item = json.items[i];
				time = new Date(item.snippet.publishedAt).getTime();
				if (lastRead < time) {
					lastRead = time;
					this.emit('chat', item);
				}
			}
		});
	}

}

module.exports = YouTube;
