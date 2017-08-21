const YouTube      = require('./youtube.js'),
			TwitCasting  = require('./twitcasting.js'),
			EventEmitter = require('events').EventEmitter,
			util         = require('./util.js');

class API extends EventEmitter {
	constructor(type) {
		super();
		switch (type) {
			case 'youtube':     this.api = new YouTube();     break;
			case 'twitcasting': this.api = new TwitCasting(); break;
			default: throw new Error('Type is not appropriate');
		}
		this.api.on('error', data => { this.emit('error', data) });
		this.api.on('ready', data => { this.emit('ready', data) });
		this.api.on('json',  data => { this.emit('json',  data) });
		this.api.on('chat',  data => { this.emit('chat',  data) });
	}

	authorize() {
		this.api.authorize();
	}

	listen(timeout) {
		this.api.listen(timeout);
	}
}

module.exports = API;
