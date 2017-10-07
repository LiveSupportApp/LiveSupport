class I18n {
  constructor(util, locale) {
    this.util = util
    const path = this.getPath(locale)
    this.language = this.util.readJSON(path)
  }

  _(id) {
    return this.language[id].message
  }

  getPath(locale) {
    let path = this.util.join(__dirname, '_locales/', locale, 'messages.json')
    if (!this.util.isExist(path)) path = this.getPath('en')
    return path
  }
}

module.exports = I18n
