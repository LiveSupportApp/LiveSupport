const {
  Menu,
  Tray,
  app,
  nativeImage,
} = require('electron');
const path = require('path');
const Util = require('./Util');

let tray;

class App {
  /**
   * タスクトレイアイコンを初期化する
   */
  static trayInit() {
    tray = new Tray(nativeImage.createFromPath(path.join(__dirname, '/icon/icon.png')));
    tray.setContextMenu(Menu.buildFromTemplate([{
      label: '終了',
      click: () => { app.quit(); }
    }]));
    tray.setToolTip('LiveSupport');
  }
}

module.exports = App;
