const request = require('request');

exports.isLive = function isLive(id,callback) {
	request.get({url: 'https://www.youtube.com/channel/'+id+'/videos?flow=list&live_view=501&view=2'}, (err, res, body) => {
		if (err || res.statusCode != 200) return callback(err);
		var videoIds = body.match(/href="\/watch\?v=(.+?)"/);
		if (videoIds.length) {callback(null,true,videoIds[1])}else{callback(null,false)}
	});
}

exports.getChatId = function getChatId(apikey,videoId) {
	request.get({url:'https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id='+videoId+'&key='+apikey,json:true}, (err, res, json) => {
		if (err || res.statusCode != 200 || !json.items.length) return false;
		return json.items[0].liveStreamingDetails.activeLiveChatId;
	});
}

exports.getMsg = function getMsg(apikey,callback) {
	request.get({url:'https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId='+liveChatId+'&part=snippet&hl=ja&maxResults=2000&key='+apikey,json:true}, (err, res, json) => {
		if (res && json.items.length) {
			for (var i=0;i<json.items.length;i++) {
				var snippet = json.items[i].snippet;
				var t = new Date(snippet.publishedAt).getTime();
				if (lastRead < t) {lastRead = t;callback(snippet.displayMessage,snippet.authorChannelId);}
			}
		}
	});
}

exports.getName = function getName(id,callback) {
	request.get({url: 'https://www.youtube.com/channel/'+id}, (err, res, body) => {
		if (!err && res.statusCode == 200) {
			let iconU = body.match(/<img class="channel-header-profile-image" src="(.*)" title=".*" alt=".*">/)
			let names = body.match(/<a dir="ltr" href="\/channel\/.*" class="spf-link branded-page-header-title-link yt-uix-sessionlink" title=".*" .*>(.*)<\/a>/);
			if (names.length) {callback(names[1],iconU[1])} else {callback('名無しさん',iconU[1])}
		} else {callback('名無しさん')}
	});
}
