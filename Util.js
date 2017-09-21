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

  /**
   * 実行しているプロセスのディレクトリを取得する
   * @param  {String} name プロセス名
   * @returns {String}
   */
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
        message: `${name}.exeが見つかりません`,
        detail: error.toString(),
      }).then(id => { if (id == 0) this.getPath(name) })
    })
  }

  /**
   * 設定ファイルを取得する
   * @returns {Object}
   */
  static get settings() {
    let json = fs.readFileSync(path.join(__dirname, 'settings.json'))
    return JSON.parse(json)
  }

  /**
   * 設定ファイルを更新する
   */
  static set settings(json) {
    let data = JSON.stringify(json)
    fs.writeFileSync(path.join(__dirname, 'settings.json'), data)
  }
}

module.exports = Util
