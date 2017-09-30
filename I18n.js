const locale = require('electron').app.getLocale()

let Util

class I18n {
  constructor(util) {
    Util = util
    const path = this.getPath(locale)
    this.language = Util.readJSON(path)
  }

  _(id) {
    return this.language[id].message
  }

  getPath(locale) {
    let path = Util.join(__dirname, '_locales/', locale, 'messages.json')
    if (!Util.isExist(path)) path = this.getPath('en')
    return path
  }
}

module.exports = I18n
