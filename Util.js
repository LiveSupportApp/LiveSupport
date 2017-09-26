const {
  app,
  dialog,
  shell,
} = require('electron')
const prompt = require('electron-prompt')
const fs = require('fs')
const path = require('path')

class Util {
  /**
   * Message box options
   * @typedef {Object} MsgBoxParas
   * @property {String} type type
   * @property {Array} buttons buttons
   * @property {Number} id default id
   * @property {String} message message
   * @property {String} detail detail
   */

  /**
   * Show message box
   * @param {MsgBoxParas} params Options
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
   * Show prompt
   * @param {String} message message
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
   * Show error box
   * @param {String} [err] message
   */
  static showError(err) {
    if (err) {
      console.log(err)
      dialog.showErrorBox('LiveSupport', err)
      app.quit()
    }
  }

  /**
   * Open URL
   * @param  {String} url URL
   */
  static open(url) {
    shell.openExternal(url)
  }
  static get settings() {
    if (!this.setting) {
      const filepath = path.join(__dirname, 'settings.json')
      const file = fs.readFileSync(filepath, 'utf8')
      this.setting = JSON.stringify(file)
    }
    return this.setting
  }
}

module.exports = Util
