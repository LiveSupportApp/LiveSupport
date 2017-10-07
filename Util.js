const {
  app,
  dialog,
  shell,
} = require('electron')
const prompt = require('electron-prompt')
const I18n = require('./I18n')
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
   * @property {Number} only Only execute callback when this and res are the same
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
        if (params.only | res === res) resolve(res)
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

  static _(id) {
    if (!this.i18n) this.i18n = new I18n(this, app.getLocale())
    return this.i18n._(id)
  }

  static get settings() {
    if (!this.setting) {
      const filepath = this.join(__dirname, 'settings.json')
      this.setting = this.readJSON(filepath)
    }
    return this.setting
  }

  /**
   * Read JSON file
   * @param  {String} path
   * @return {Object}
   */
  static readJSON(path) {
    const file = fs.readFileSync(path)
    const json = JSON.parse(file)
    return json
  }

  static isExist(file) {
    try {
      fs.statSync(file)
      return true
    } catch (err) {
      if (err.code === 'ENOENT') return false
    }
  }

  /**
   * Return path.join
   * @return {String}
   */
  static join() {
    return path.join(...arguments)
  }
}

module.exports = Util
