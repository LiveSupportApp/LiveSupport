const {
				remote,
				ipcRenderer,
				screen,
			} = require('electron'),
			config = require('./config.json')
			NicoJS = require('nicoJS');

let nico;

{
	const win = remote.getCurrentWindow();
	win.maximize();
	win.setIgnoreMouseEvents(true);
	win.show();
	win.toggleDevTools();
	const size = win.getSize();
	nico = new NicoJS({
		app: document.getElementById('render'),
		width: size[0],
		height: size[1],
		font_size: config.size,
		color: '#'+config.color
	});
}

nico.listen();

ipcRenderer.on('chat', (event, data) => {
	nico.send(data.msg);
});
