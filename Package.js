const fs = require('fs-extra')
const path = require('path')
const Util = require('./Util')

class Package {
  /**
   * Get package path
   * @param {String} name package name
   * @return {String}
   */
  static getPath(name) {
    const packpath = path.join(this.path, name)
    const mainpath = fs.readJsonSync(path.join(packpath, 'package.json')).main
    return path.join(packpath, mainpath)
  }

  /**
   * Return whether existing package
   * @param {String} name package name
   * @return {Boolean}
   */
  static isExtra(name) {
    return fs.existsSync(this.getPath(name))
  }

  /**
   * Return package
   * @param {String} name package name
   * @return {BrowserWindow}
   */
  static getPackage(name) {
    if (!this.isExtra(name)) {
      Util.showError(Util._.notExistPackage)
    } else {
      const Pack = require(this.getPath(name))
      return new Pack()
    }
  }

  /**
   * Get packages folder path
   * @return {String}
   * @readonly
   */
  static get path() {
    return path.join(__dirname, 'packages')
  }
}

module.exports = Package
