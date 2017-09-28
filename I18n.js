const electron = require('electron')
const app = electron.app | electron.remote.app
const Util = require('Util')

class I18n {
  constructor() {
    this.main = Util.join(this.path, 'en.json')
    this.path = Util.join(this.path, app.getLocale() + '.json')
    const filePath = (Util.isExist(this.path)) ? this.path : this.main
    this.language = Util.readJSON(filePath)
  }

  _(id) {
    return this.language[id].message
  }

  get path() {
    return Util.join(__dirname, '_locales/')
  }
}

module.exports = I18n
