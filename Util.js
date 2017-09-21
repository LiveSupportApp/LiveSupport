const {
  app,
  dialog,
  shell,
} = require('electron')
const prompt = require('electron-prompt')
const path = require('path')
const PowerShell = require('node-powershell')
const fs = require('fs')

class Util {
  /**
   * メッセージボックスの設定
   * @typedef {Object} MsgBoxParas
   * @property {String} type メッセージボックスの種類
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
      defaultId: params.id || 0,
      title: 'LiveSupport',
      message: params.msg,
      detail: params.detail || '',
      cancelId: -1,
      noLink: true,
    }, res => {
      callback(res)
    })
  }

  /**
   * プロンプトを表示する
   * @param {String} message メッセージ
   * @param {Function} callback コールバック
   */
  static prompt(message, callback) {
    prompt({ title: 'LiveSupport', label: message })
      .then(callback)
      .catch(this.showError)
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

  static open(url) {
    shell.openExternal(url)
  }

  static getPath(name) {
    let ps = new PowerShell({ debugMsg: false })
    ps.addCommand(`Get-Process ${name} | Select-Object path`)
    ps.invoke().then(output => {
      ps.dispose()
      return output.split('\r\n').filter(v => path.isAbsolute(v))[0]
    }).catch(error => {
      ps.dispose()
      console.log('getPath Error', error)
      this.msgbox({
        type: 'warning',
        buttons: ['再試行'],
        msg: 'ソフトークが見つかりません',
        detail: error.toString(),
      }, id => { if (id == 0) this.getPath(name) })
    })
  }

  static get settings() {
    let json = fs.readFileSync(path.join(__dirname, 'settings.json'))
    return JSON.parse(json)
  }

  static set settings(json) {
    let data = JSON.stringify(json)
    fs.writeFileSync(path.join(__dirname, 'settings.json'), data)
  }
}

module.exports = Util
