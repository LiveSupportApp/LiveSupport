const locale = require('electron').app.getLocale()
const Util = require('./Util')

class I18n {
  constructor() {
    const path = this.getPath(locale)
    this.language = Util.readJSON(path)
  }

  _(id) {
    return this.language[id].message
  }

  getPath(locale) {
    let path = Util.join(this.path, locale, 'messages.json')
    if (!Util.isExist(path)) path = this.getPath('en')
    return path
  }
}

module.exports = I18n
