var request  = require('request'),
		fs       = require('fs'),
		proc     = require('child_process')
		path     = require('path'),
		$        = require("jquery"),
		settings = fs.readFileSync(path.join(__dirname, '../settings/settings.json'));
var lastRead = new Date().getTime(),liveChatId='',readingText;

if (!settings.channelId||!settings.APIkey) {
	notifi('チャンネルIDとAPIキーを設定してください。');
} else {
	isLive((is,id)=>{
		if (is) {
			liveChatId = getChatId(id);
			if(liveChatId) {return getMsg()}
		}
		notifi('配信URLが見つかりません。配信している場合は暫く待って再起動してください');
	});
}

function isLive(callback) {
	request.get({url: 'https://www.youtube.com/channel/'+settings.channelId+'/videos?flow=list&live_view=501&view=2'}, (err, res, body) => {
		if (err || res.statusCode != 200) return notifi(err);
		var videoIds = body.match(/href="\/watch\?v=(.+?)"/);
		if (videoIds.length) {callback(true,videoIds[1])}else{callback(false)}
	});
}

function getChatId(videoId) {
	request.get({url:'https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id='+videoId+'&key='+settings.APIkey,json:true}, function (err, res, json) {
		if (err || res.statusCode != 200 || !json.items.length) return false;
		return json.items[0].liveStreamingDetails.activeLiveChatId;
	});
}

function getMsg() {
	request.get({url:'https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId='+liveChatId+'&part=snippet&hl=ja&maxResults=2000&key='+settings.APIkey,json:true}, (err, res, json) => {
		if (res && json.items.length) {
			for (var i=0;i<json.items.length;i++) {
				var snippet = json.items[i].snippet;
				var t = new Date(snippet.publishedAt).getTime();
				if (lastRead < t) {
					lastRead = t;
					var msg = snippet.displayMessage;
					getName(snippet.authorChannelId,(name,url)=>{
						addChat(name,msg,url);
						switch (settings.whatReading) {
							case 'msg': readingText = msg;
							case 'all': default: readingText = name+' '+msg;
						}
						if (settings.reading) proc.exec(settings.path+' /t "'+(msg.replace('"','').replace('\n',''))+'"');
					});
				}
			}
		}
		setTimeout(() => {getMsg()}, settings.timeout);
	});
}

function getName(id,callback) {
	request.get({url: 'https://www.youtube.com/channel/'+id}, (err, res, body) => {
		if (!err && res.statusCode == 200) {
			let iconU = body.match(/<img class="channel-header-profile-image" src="(.*)" title=".*" alt=".*">/)
			let names = body.match(/<a dir="ltr" href="\/channel\/.*" class="spf-link branded-page-header-title-link yt-uix-sessionlink" title=".*" .*>(.*)<\/a>/);
			if (names.length) {callback(names[1],iconU[1])} else {callback('名無しさん',iconU[1])}
		} else {callback('名無しさん')}
	});
}

function notifi(msg) {
  new Notification('YouTubeLive補助ツール', {body: msg});
}

function addChat(name,msg,url) {
	$('#chat_container').prepend(`
			<div class="chat">
				<div class="icon">
					<img src="${url}">
				</div>
				<div class="content">
					<div class="author">${name}</div>
					&#8203;
					<div class="message">${msg}</div>
				</div>
			</div>`);
}
