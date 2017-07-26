const get = require('request').get;

exports.isLive = (id, key, callback) => {
	get({url: `https://www.googleapis.com/youtube/v3/search?eventType=live&part=id&channelId=${id}&type=video&key=${key}`, json: true}, (err, res, json) => {
		if (err || res.statusCode != 200) return callback(err||true);
		if (!json.items[0]) return callback(null, false)
		callback(null, null, json.items[0].videoId);
	});
}

exports.getChatId = (apikey, liveId, callback) => {
	get({url: `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${liveId}&key=${apikey}`, json: true}, (err, res, json) => {
		if (err || res.statusCode != 200 || !json.items.length) return callback(err||true);
		callback(null, json.items[0].liveStreamingDetails.activeLiveChatId);
	});
}

exports.getMsg = (apikey, liveChatId, callback) => {
	get({url: `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=authorDetails,snippet&hl=ja&maxResults=2000&key=${apikey}`, json: true}, (err, res, json) => {
		if (err || res.statusCode != 200 || !json.items.length) return callback(err||true);
		callback(json);
	});
}
