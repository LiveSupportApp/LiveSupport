const {
				remote,
				ipcRenderer
			}    = require('electron'),
			$    = require('jquery'),
			path = require('path');

{
	const win = remote.getCurrentWindow();

	if (localStorage.getItem('bounds')) {
		const bounds = JSON.parse(localStorage.getItem('bounds'));
		win.setBounds(bounds);
	} else {
		win.setSize(600, 200);
	}

	win.on('move', () => {
		localStorage.setItem('bounds', JSON.stringify(win.getBounds()));
	});

	win.show();
}

ipcRenderer.on('chat', (event, data) => {
	$('#chat_container').prepend(`
			<div class="chat">
				<div class="icon">
					<img src="${data.url}">
				</div>
				<div class="content">
					<div class="author">${data.name}</div>
					&#8203;
					<div class="message">${data.msg}</div>
				</div>
			</div>`);
});
