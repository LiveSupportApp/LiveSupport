var fs       = require('fs'),
		proc     = require('child_process'),
		notifier = require('node-notifier'),
		path     = require('path'),
		$        = require("jquery"),
		settings = fs.readFileSync(path.join(__dirname, '../settings/settings.json')),
		yt       = require('../../youtube.js');

var lastRead = Date.now(),liveChatId='',readingText;

if (!settings.channelId||!settings.APIkey) {
	notifi('チャンネルIDとAPIキーを設定してください。');
} else {
	yt.isLive(settings.channelId,(is,id)=>{
		if (!is) return;
		liveChatId = yt.getChatId(settings.apikey,id);
		if(liveChatId) {
			setInterval(() => {
				yt.getMsg(settings.apikey,(msg,id) => {
					yt.getName(id,(name,url)=>{
						addChat(name,msg,url);
						switch (settings.whatReading) {
							case 'msg': readingText = msg;
							case 'all': default: readingText = name+' '+msg;
						}
						if (settings.reading) proc.exec(settings.path+' /t "'+(msg.replace('"','').replace('\n',''))+'"');
					});
				});
			}, settings.timeout);
		}
		notifi('配信URLが見つかりません。配信している場合は暫く待って再起動してください');
	});
}

function notifi(msg) {new Notification('YouTubeLive補助ツール' {body: msg})}
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
