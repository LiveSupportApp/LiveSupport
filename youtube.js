const request = require('request');

exports.isLive = function(id,callback) {
	request.get({url: 'https://www.youtube.com/channel/'+id+'/videos?flow=list&live_view=501&view=2'}, (err, res, body) => {
		if (err || res.statusCode != 200) return callback(err);
		var videoIds = body.match(/href="\/watch\?v=(.+?)"/);
		if (videoIds.length) {callback(null,true,videoIds[1])}else{callback(null,false)}
	});
}

exports.getChatId = function(apikey,liveId,callback) {
	request.get({url:'https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id='+liveId+'&key='+apikey,json:true}, (err, res, json) => {
		if (err || res.statusCode != 200 || !json.items.length) return callback(err||true);
		callback(null, json.items[0].liveStreamingDetails.activeLiveChatId);
	});
}

exports.getMsg = function(apikey,liveChatId,callback) {
	request.get({url:'https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId='+liveChatId+'&part=snippet&hl=ja&maxResults=2000&key='+apikey,json:true}, (err, res, json) => {
		if (res && json.items.length) {
			callback(json);
		}
	});
}

exports.getName = function(id,callback) {
	request.get({url: 'https://www.youtube.com/channel/'+id}, (err, res, body) => {
		if (!err && res.statusCode == 200) {
			let iconU = body.match(/<img class="channel-header-profile-image" src="(.*)" title=".*" alt=".*">/)
			let names = body.match(/<a dir="ltr" href="\/channel\/.*" class="spf-link branded-page-header-title-link yt-uix-sessionlink" title=".*" .*>(.*)<\/a>/);
			if (names.length) {callback(names[1],iconU[1])} else {callback('名無しさん',iconU[1])}
		} else {callback('名無しさん')}
	});
}
