const {
				remote,
				ipcRenderer
			}      = require('electron'),
			config = require('./config.json')
			NicoJS = require('nicoJS'),
			nico   = new NicoJS({
				app: document.getElementById('render'),
				width: window.innerWidth,
				height: window.innerHeight,
				font_size: config.size,
				color: '#'+config.color
			});

{
	const win = remote.getCurrentWindow();
	win.maximize();
	win.setIgnoreMouseEvents(true);
	win.show();
}

nico.listen();

ipcRenderer.on('chat', (event, data) => {
	nico.send(data.msg);
});
