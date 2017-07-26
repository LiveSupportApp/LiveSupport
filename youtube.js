const get = require('request').get;

exports.isLive = function(id, callback) {
	get({url: `https://www.youtube.com/channel/${id}/videos?flow=list&live_view=501&view=2`}, (err, res, body) => {
		if (err || res.statusCode != 200) return callback(err);
		var videoIds = body.match(/href="\/watch\?v=(.+?)"/);
		if (videoIds.length) {callback(null,true,videoIds[1])}else{callback(null,false)}
	});
}

exports.getChatId = function(apikey, liveId, callback) {
	get({url:`https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${liveId}&key=${apikey}`,json:true}, (err, res, json) => {
		if (err || res.statusCode != 200 || !json.items.length) return callback(err||true);
		callback(null, json.items[0].liveStreamingDetails.activeLiveChatId);
	});
}

exports.getMsg = function(apikey, liveChatId, callback) {
	get({url:`https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=authorDetails,snippet&hl=ja&maxResults=2000&key=${apikey}`,json:true}, (err, res, json) => {
		if (res && json.items.length) {
			callback(json);
		}
	});
}
