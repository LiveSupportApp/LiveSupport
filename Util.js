const exec = require('child_process').exec;
const dialog = require('electron').dialog;

class Util {
	static msgbox(params, callback) {
		dialog.showMessageBox({
			type: params.type,
			buttons: params.btns,
			defaultId: 0,
			title: 'LiveSupport',
			message: params.msg,
			detail: params.detail || '',
			cancelId: -1,
			noLink: true
		}, (res) => {
			callback(res);
		});
	}

	static showError(err) {
		if (err) dialog.showErrorBox('LiveSupport', err);
	}

	static read(msg, name) {
		exec(`${config.reading.path} /t "${((config.reading.name)?name+' さん '+text:text).replace('"','\'').replace('\n',' ')}"`);
	}
}

module.exports = Util;
