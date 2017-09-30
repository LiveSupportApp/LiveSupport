const Util = require('./Util')

class Package {
  /**
   * Get package path
   * @param {String} name package name
   * @return {String}
   */
  static getPath(name) {
    const packpath = Util.join(this.path, name)
    const mainpath = Util.readJSON(Util.join(packpath, 'package.json')).main
    return Util.join(packpath, mainpath)
  }

  /**
   * Return package
   * @param {String} name package name
   * @return {BrowserWindow|Null}
   */
  static getPackage(name) {
    if (Util.isExist(this.getPath(name))) {
      const Pack = require(this.getPath(name))
      return new Pack()
    } else
      Util.showError(Util._('notExistPackage'))
  }

  /**
   * Get packages folder path
   * @return {String}
   * @readonly
   */
  static get path() {
    return Util.join(__dirname, 'packages')
  }
}

module.exports = Package
