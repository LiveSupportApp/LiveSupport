const electron = require('electron')
const app = electron.app | electron.remote.app
const path = require('path')
const fs = require('fs')

class I18n {
  constructor() {
    this.main = path.join(__dirname, '_locales/', 'en.js')
    this.path = path.join(__dirname, '_locales/', app.getLocale() + '.js')
    const isExists = fs.existsSync(this.path)
    const file = fs.readFileSync((isExists) ? this.path : this.main , 'utf8')
    this.language = JSON.parse(file)
  }

  get __() {
    return this.language
  }
}

module.exports = I18n
