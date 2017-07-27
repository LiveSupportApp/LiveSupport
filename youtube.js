const get = require('request').get;

class YouTube {
	constructor(apikey, channelId) {
		this.key    = apikey;
		this.id     = channelId;
	}
	getLiveId(callback) {
		get({url: `https://www.googleapis.com/youtube/v3/search?eventType=live&part=id&channelId=${this.id}&type=video&key=${this.key}`, json: true}, (err, res, json) => {
			if (err || res.statusCode != 200) return callback(err||true);
			if (!json.items.length) return callback(null, false)
			this.liveId = json.items[0].id.videoId;callback();
		});
	}
	getChatId(callback) {
		get({url: `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${this.liveId}&key=${this.key}`, json: true}, (err, res, json) => {
			if (err || res.statusCode != 200) return callback(err||true);
			if (!json.items.length) return callback(null, false)
			this.chatId = json.items[0].liveStreamingDetails.activeLiveChatId;callback();
		});
	}
	getMsg(callback) {
		get({url: `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${this.chatId}&part=authorDetails,snippet&hl=ja&maxResults=2000&key=${this.key}`, json: true}, (err, res, json) => {
			if (err || res.statusCode != 200) return callback(err||true);
			callback(null, json);callback();
		});
	}
}

module.exports = YouTube;

// exports.getLive = (id, key, callback) => {
// 	get({url: `https://www.googleapis.com/youtube/v3/search?eventType=live&part=id&channelId=${id}&type=video&key=${key}`, json: true}, (err, res, json) => {
// 		if (err || res.statusCode != 200) return callback(err||true);
// 		if (!json.items[0]) return callback(null, false)
// 		callback(null, true, json.items[0].id.videoId);
// 	});
// }

// exports.getChatId = (apikey, liveId, callback) => {
// 	get({url: `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${liveId}&key=${apikey}`, json: true}, (err, res, json) => {
// 		if (err || res.statusCode != 200 || !json.items.length) return callback(err||true);
// 		callback(null, json.items[0].liveStreamingDetails.activeLiveChatId);
// 	});
// }

// exports.getMsg = (apikey, liveChatId, callback) => {
// 	get({url: `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=authorDetails,snippet&hl=ja&maxResults=2000&key=${apikey}`, json: true}, (err, res, json) => {
// 		if (res && json.items.length) {
// 			callback(json);
// 		}
// 	});
// }
