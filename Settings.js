const fs = require('fs-extra');
const path = require('path');
const App = require('./App');
const Package = require('./Package');

class Settings {
  static init(callback) {
    if (!fs.existsSync(this.path)) fs.mkdirSync(this.path);
    fs.copySync(path.join(Package.path, 'config.json'), path.join(this.path, 'config.json'));
    let packs = fs.readdirSync(Package.path);
    for (let pack of packs) {
      let settings = path.join(Package.path, pack, 'settings.json');
      if (fs.existsSync(settings) && fs.statSync(settings).isFile()) {
        let name = fs.readJsonSync(path.join(Package.path, pack, 'package.json')).name;
        fs.copySync(settings, path.join(this.path, name+'.json'));
      }
    }
    callback();
  }

  static get path() {
    return path.join(App.path, 'settings');
  }
}

module.exports = Settings;
