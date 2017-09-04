const exec = require('child_process').exec;
const {dialog} = require('electron');
const prompt = require('electron-prompt');

class Util {
  /**
   * メッセージボックスの設定
   * @typedef {Object} MsgBoxParas
   * @property {string} type メッセージボックスの種類
   * @property {Array} btns メッセージボックスに表示するボタン
   */

  /**
   * メッセージボックスを表示する
   * @param {MsgBoxParas} params メッセージボックスの設定
   * @param {Function} callback メッセージボックスが閉じられたときに実行する関数
   */
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

  /**
   * プロンプトを表示する
   * @param {string} message メッセージ
   * @param {Function} callback コールバック
   */
  static prompt(message, callback) {
    prompt({ title: 'LiveSupport', label: message })
      .then(callback)
      .catch(this.showError);
  }

  /**
   * エラーボックスを表示する
   * @param {string} [err] エラーメッセージ
   */
  static showError(err) {
    if (err) {
      console.log(err);
      dialog.showErrorBox('LiveSupport', err);
    }
  }
}

module.exports = Util;
