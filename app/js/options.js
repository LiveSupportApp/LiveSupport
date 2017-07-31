const {
				remote,
				ipcRenderer,
			}       = require('electron'),
			$       = require('jquery'),
			fs      = require('fs'),
			path    = require('path'),
			storage = remote.require('electron-json-storage');

var json = {};

storage.get('config', (err, data) => {
	if (err) return console.log(err);
	if (Object.keys(data).length == 0) return;
	$('#channelId')  .val(data.channelId);
	$('#APIkey')     .val(data.APIkey);
	$('#timeout')    .val(data.timeout);
	$('#bcpath')     .val(data.path);
	$('#reading')    .prop('checked', data.reading);
	$('#whatReading').val(data.whatReading);
	if (data.reading) {$('.bc').show()} else {$('.bc').hide()}
	$('#niconico')   .prop('checked', data.nico.is);
	$('#color')      .val(data.nico.color).css('background-color', '#'+data.nico.color);
	$('#fontsize')   .val(data.nico.size);
	$('#chromakey')  .prop('checked', data.chromakey.is);
	$('#keycolor')   .val(data.chromakey.color).css('background-color', '#'+data.nico.color);
	$('.is').parents('fieldset').children('p').not($('.is').parents('p')).toggle($(this).prop('checked'));
});

$('#barrage').on('change', () => {
	var is = $(this).prop('checked');
	$('#bcpath').prop('required', is);
	if (is) {$('.bc').show()} else {$('.bc').hide()}
});

$('.is').click((e) => {
	var target = $(e.target);
	target.parents('fieldset').children('p').not($('.is').parents('p')).toggle(target.prop('checked'));
});

$('form').submit((e) => {
	e.preventDefault();
	if ($('#reading').prop('checked')) {
		var bcPath = bcpath.value.replace('"','');
		if (path.basename(bcPath)!='BouyomiChan.exe') return showMsg('棒読みちゃんのパスが間違っています。');
		var rtPath = path.join(path.dirname(bcPath),'RemoteTalk/RemoteTalk.exe');
		if (!isFile(rtPath)) return showMsg('棒読みちゃんを再インストールしてください。');
	}

	json = {
		channelId  : $('#channelId').val(),
		APIkey     : $('#APIkey').val(),
		timeout    : Number($('#timeout').val()),
		reading    : $('#reading').prop('checked'),
		path       : rtPath,
		whatReading: $('#whatReading').val(),
		nico       : {
			is       : $('#niconico').prop('checked'),
			color    : $('#color').val(),
			size     : $('#fontsize').val(),
			chromakey: {
				is   : $('#chromakey').prop('checked'),
				color: $('#keycolor').val(),
			}
		}
	};

	ipcRenderer.send('data', json);
	ipcRenderer.on('reply', () => {
		showMsg('保存しました。');
	});
});

function showMsg(msg) {$('#msg').text(msg);}
function isFile(file) {try{fs.statSync(file);return true}catch(err){if(err.code==='ENOENT')return false}}
