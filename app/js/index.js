const path     = require('path'),
			$        = require("jquery"),
			ipc      = require('electron').ipcRenderer,
			settings = require(path.join(__dirname, '../settings/settings.json'));

var lastRead = Date.now(),liveChatId='',readingText;

ipc.on('chat', (event, data) => {
	addChat(data.name,data.msg,data.url)
})

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
