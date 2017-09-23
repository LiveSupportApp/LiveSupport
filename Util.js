const {
  app,
  dialog,
  shell,
} = require('electron')
const prompt = require('electron-prompt')

class Util {
  /**
   * メッセージボックスの設定
   * @typedef {Object} MsgBoxParas
   * @property {String} type メッセージボックスの種類
   * @property {Array} buttons メッセージボックスに表示するボタン
   * @property {Number} id デフォルトID
   * @property {String} message メッセージ
   * @property {String} detail 詳細
   */

  /**
   * メッセージボックスを表示する
   * @param {MsgBoxParas} params メッセージボックスの設定
   * @returns {Promise}
   */
  static msgbox(params) {
    return new Promise(resolve => {
      dialog.showMessageBox({
        type: params.type,
        buttons: params.buttons,
        defaultId: params.id || 0,
        title: 'LiveSupport',
        message: params.message,
        detail: params.detail || '',
        cancelId: -1,
      }, res => {
        resolve(res)
      })
    })
  }

  /**
   * プロンプトを表示する
   * @param {String} message メッセージ
   * @returns {Promise}
   */
  static prompt(message) {
    return new Promise(resolve => {
      prompt({ title: 'LiveSupport', label: message })
        .then(resolve)
        .catch(this.showError)
    })
  }

  /**
   * エラーボックスを表示する
   * @param {String} [err] エラーメッセージ
   */
  static showError(err) {
    if (err) {
      console.log(err)
      dialog.showErrorBox('LiveSupport', err)
      app.quit()
    }
  }

  /**
   * URLを開く
   * @param  {String} url 開くURL
   */
  static open(url) {
    shell.openExternal(url)
  }
}

module.exports = Util
