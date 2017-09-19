const fs = require('fs-extra')
const path = require('path')
const Util = require('./Util')

class Package {
  /**
   * パッケージのパスを取得する
   * @param {String} name パッケージ名
   * @return {String}
   */
  static getPath(name) {
    let packpath = path.join(this.path, name)
    let mainpath = fs.readJsonSync(path.join(packpath, 'package.json')).main
    return path.join(packpath, mainpath)
  }

  /**
   * パッケージが存在するか確認する
   * @param {String} name パッケージ名
   * @return {Boolean}
   */
  static isExtra(name) {
    return fs.existsSync(this.getPath(name))
  }

  /**
   * パッケージを読み込む
   * @param {String} name パッケージ名
   * @return {BrowserWindow}
   */
  static getPackage(name) {
    if (!this.isExtra(name)) {
      Util.showError('指定したパッケージが存在しません！')
    } else {
      let Pack = require(this.getPath(name))
      return new Pack()
    }
  }

  /**
   * パッケージフォルダのパスを取得する
   * @return {String}
   * @readonly
   */
  static get path() {
    return path.join(__dirname, 'package')
  }
}

module.exports = Package
