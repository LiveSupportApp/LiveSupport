const fs = require('fs-extra');
const path = require('path');
const App = require('./App');
const Util = require('./Util');
const {BrowserWindow} = require('electron');
const install = require('exec-npm-install');

class Package {
  /**
   * パッケージを初期化する
   * @param  {Function} callback コールバック関数
   */
  static init(callback) {
    if (!fs.existsSync(this.path)) {
      fs.copySync(path.join(__dirname, 'package'), this.path);
      let packs = fs.readdirSync(this.path);
      for (let pack of packs) {
        let packpath = path.join(this.path, pack);
        if (!fs.existsSync(packpath)||!fs.statSync(packpath).isDirectory()) continue;
        let modules = Object.keys(fs.readJsonSync(path.join(packpath, 'package.json')).dependencies);
        console.log(pack, modules, packpath);
        install({
          modules: modules,
          prefix: packpath,
        }, err => {
          if (err) Util.showError(err);
        });
      }
      // callback();
    }
  }

  /**
   * パッケージのパスを取得する
   * @param {string} name パッケージ名
   * @return {string}
   */
  static getPath(name) {
    return path.join(this.path, name, 'index.html');
  }

  /**
   * パッケージが存在するか確認する
   * @param {string} name パッケージ名
   * @return {Boolean}
   */
  static isExtra(name) {
    return fs.existsSync(this.getPath(name));
  }

  /**
   * コンフィグを取得する
   * @return {Object}
   * @readonly
   */
  static get config() {
    return require(path.join(App.path, 'package', 'config.json'));
  }

  /**
   * パッケージを読み込む
   * @param {string} name パッケージ名
   * @return {BrowserWindow}
   */
  static getPackage(name) {
    if (!this.isExtra(name)) Util.showError('指定したパッケージが存在しません！');
    let win = new BrowserWindow({ transparent: true, frame: false, skipTaskbar: true, show: false });
    win.loadURL(this.getPath(name));
    win.on('closed', () => { win = null; });
    return win;
  }

  /**
   * パッケージフォルダのパスを取得する
   * @return {string}
   * @readonly
   */
  static get path() {
    return path.join(App.path, 'package');
  }
}

module.exports = Package;
