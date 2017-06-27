var NicoJS = require('nicoJS'),
		yt = require('./youtube');

var nico = new NicoJS({
	app    : document.getElementById('render'),
	width  : window.parent.screen.width,
	height : window.parent.screen.height
});

ipc.on('chat', (name,msg,url) => {
	nico.send(msg);
});
