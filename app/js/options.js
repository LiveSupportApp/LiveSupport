var remote = require('electron').remote,
		fs     = require('fs'),
		path   = require('path'),
		$      = require("jquery");

var json = {};

fs.readFile(path.join(__dirname, '../../settings/settings.json'), (err,data) => {
	json = JSON.parse(data);
	$('#channelId')  .val(json.channelId);
	$('#APIkey')     .val(json.APIkey);
	$('#timeout')    .val(json.timeout);
	$('#bcpath')     .val(json.path);
	$('#reading')    .prop('checked', json.reading);
	$('#whatReading').val(json.whatReading);
	if (json.reading) {$('.bc').show()} else {$('.bc').hide()}
	$('#niconico')   .prop('checked', json.niconico);
});

$('#barrage').on('change', () => {
	var is = $(this).prop('checked');
	$("#bcpath").prop('required', is);
	if (is) {$('.bc').show()} else {$('.bc').hide()}
});

$('form').submit(() => {
	var bcPath = bcpath.value.replace('"','');
	if (path.basename(bcPath)!='BouyomiChan.exe') return showMsg('棒読みちゃんのパスが間違っています。');
	var rtPath = path.join(path.dirname(bcPath),'RemoteTalk/RemoteTalk.exe');
	if (!isFile(rtPath)) return showMsg('棒読みちゃんを再インストールしてください。');

	json.first       = false;
	json.channelId   = $('#channelId').val();
	json.APIkey      = $('#APIkey').val();
	json.timeout     = Number($('#timeout').val());
	json.reading     = Boolean($('#reading').prop('checked'));
	json.path        = rtPath;
	json.whatReading = $('#whatReading').val();
	json.niconico    = Boolean($('#niconico').prop('checked'));

	fs.writeFile(path.join(__dirname,'../../settings/settings.json'), JSON.stringify(json,undefined,'	'), (err) => {
		if (!err) {showMsg('保存しました。');} else {showMsg(err);}
	});
	return false;
});

function showMsg(msg) {msg.textContent(msg);}
function isFile(file) {try{fs.statSync(file);return true}catch(err){if(err.code==='ENOENT')return false}}
