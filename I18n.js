const electron = require('electron')
const app = electron.app | electron.remote.app
const Util = require('Util')

class I18n {
  constructor() {
    this.main = Util.join(__dirname, '_locales/', 'en.json')
    this.path = Util.join(__dirname, '_locales/', app.getLocale() + '.json')
    const filePath = (Util.isExist(this.path)) ? this.path : this.main
    this.language = Util.readJSON(filePath)
  }

  get __() {
    return this.language
  }
}

module.exports = I18n
