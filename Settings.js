const fs = require('fs')
const path = require('path')

class Settings {
  constructor(file) {
    this.path = path.join(__dirname, file)
    this.reload()
    fs.watch(this.path, () => this.reload())
  }

  reload() {
    const file = fs.readFileSync(this.path, 'utf-8')
    this.setting = JSON.parse(file)
  }

  get settings() {
    return this.setting
  }

  /**
   * 設定ファイルを更新する
   */
  set settings(json) {
    const data = JSON.stringify(json, '', 2)
    fs.writeFileSync(this.path, data)
  }

  /**
   * 設定ファイルを部分的に取得する
   * @param  {String} location 書き換えるパス
   * @type {*}
   */
  getSetting(location) {
    console.log(this.setting)
    console.log('location', location)
    const keys = this.location(location)
    let setting = this.setting
    for (const key of keys) setting = setting[key]
    return setting
  }

  /**
   * 設定ファイルを部分的に書き換える
   * @param  {String} location 書き換えるパス
   * @param  {[type]} item     書き換える内容
   */
  updateSetting(location, item) {
    const settings = this.setting
    eval(`settings${location} = ${item}`)
    this.settings = settings
  }

  location(location) {
    return location.match(/[^.]+/g)
  }
}

module.exports = Settings
