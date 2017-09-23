const fs = require('fs')

class Settings {
  constructor(path) {
    this.path = path
    fs.watch(this.path, () => {
      this.settings = JSON.parse(fs.readFileSync(this.path))
    })
  }

  /**
   * 設定ファイルを更新する
   */
  set settings(json) {
    const data = JSON.stringify(json)
    fs.writeFileSync(this.path, data)
  }

  /**
   * 設定ファイルを部分的に取得する
   * @param  {String} location 書き換えるパス
   * @type {*}
   */
  getSettings(location) {
    eval(`return this.settings${location}`)
  }

  /**
   * 設定ファイルを部分的に書き換える
   * @param  {String} location 書き換えるパス
   * @param  {[type]} item     書き換える内容
   */
  updateSettings(location, item) {
    if (!item) return
    const settings = this.settings
    eval(`settings${location} = item`)
    this.settings = settings
  }
}

module.exports = Settings
