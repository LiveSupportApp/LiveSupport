var fs     = require('fs'),
		path   = require('path'),
		$      = require('jquery');

var json = {};

fs.readFile(path.join(__dirname, '../settings/settings.json'), (err,data) => {
	if (err) return console.log(err);
	json = JSON.parse(data);
	$('#channelId')  .val(json.channelId);
	$('#APIkey')     .val(json.APIkey);
	$('#timeout')    .val(json.timeout);
	$('#bcpath')     .val(json.path);
	$('#reading')    .prop('checked', json.reading);
	$('#whatReading').val(json.whatReading);
	if (json.reading) {$('.bc').show()} else {$('.bc').hide()}
	$('#niconico')   .prop('checked', json.nico.is);
	$('#color')      .val(json.nico.color).css('background-color', '#'+json.nico.color);
	$('#fontsize')   .val(json.nico.size);
	$('#chromakey')  .prop('checked', json.chromakey.is);
	$('#keycolor')   .val(json.chromakey.color).css('background-color', '#'+json.nico.color);
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
	json.first                = false;
	json.channelId            = $('#channelId').val();
	json.APIkey               = $('#APIkey').val();
	json.timeout              = Number($('#timeout').val());
	json.reading              = Boolean($('#reading').prop('checked'));
	json.path                 = rtPath;
	json.whatReading          = $('#whatReading').val();
	json.nico.is              = Boolean($('#niconico').prop('checked'));
	json.nico.color           = $('#color').val();
	json.nico.size            = $('#fontsize').val();
	json.nico.chromakey.is    = Boolean($('#chromakey').prop('checked'));
	json.nico.chromakey.color = $('#keycolor').val();
	fs.writeFile(path.join(__dirname,'../settings/settings.json'), JSON.stringify(json,undefined,'	'), (err) => {
		if (err) console.log(err);
		if (!err) {showMsg('保存しました。');} else {showMsg(err);}
	});
});

function showMsg(msg) {$('#msg').text(msg);}
function isFile(file) {try{fs.statSync(file);return true}catch(err){if(err.code==='ENOENT')return false}}
