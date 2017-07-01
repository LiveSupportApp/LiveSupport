var NicoJS = require('nicoJS'),
<<<<<<< HEAD
		// yt = require('../../youtube.js'),
		ipc = require('electron').ipcRenderer,
		$ = require('jquery'),
		pos = window.parent.screen;

var set = {'top': 0,'left': 0,'width': pos.width,'height': pos.height},
		nico = new NicoJS({app:$('#render')[0],width:set.width,height:set.height});
=======
		ipc    = require('electron').ipcRenderer,
		$      = require('jquery'),
		pos    = window.parent.screen,
		settings= require('../settings/settings.json')
		set    = {'top': 0,'left': 0,'width': pos.width,'height': pos.height},
		nico   = new NicoJS({
			app: $('#render')[0],
			width: set.width,
			height: set.height,
			font_size: settings.nico.size,
			color: '#'+settings.nico.color
		});

nico.listen();

ipc.on('chat', (event, data) => { nico.send(name); });
>>>>>>> 簡略化

ipc.on('set', (event, is) => {
	if (is) {
		console.log(is);
		$('#render').css('border', '4px solid red');
		$('canvas').show().attr({'width':pos.width,'height':pos.height});
		drag();
	} else {
		$('#render').css('border', 'none');
		$('canvas').off().hide();
		$('#container').css(set);
	}
});

<<<<<<< HEAD
nico.loop(["あーーー","あーーー","あーーー","あーーー","あーーー"]);

// ipc.on('set', (event) => {
// 	// nico.send(msg);,msg,url
// 	console.log(name);
// });

=======
>>>>>>> 簡略化
function drag() {
	var x = 0, y = 0, w, h;
	var ctx = $('canvas')[0].getContext("2d");

	$('canvas').on('mousedown', (e)=>{
		var railhead = e.target.getBoundingClientRect();
		x = e.clientX; y = e.clientY;

		$('canvas').on('mousemove', (e)=>{
			var railhead = e.target.getBoundingClientRect();
			w = e.clientX-x; h = e.clientY-y;

			ctx.clearRect(0,0,pos.width,pos.height);
			ctx.strokeRect(x,y,w,h);
		});
	});

	$('canvas').on('mouseup',()=>{
		$('canvas').off('mousemove');
		set = {top: x,left: y,width: w,height: h};
	});
}
