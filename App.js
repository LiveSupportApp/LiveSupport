const {
  Menu,
  Tray,
  app,
  nativeImage,
} = require('electron')
const path = require('path')

let tray

class App {
  /**
   * Init task tray icon
   */
  static trayInit() {
    tray = new Tray(nativeImage.createFromPath(path.join(__dirname, '/icon/icon.png')))
    tray.setContextMenu(Menu.buildFromTemplate([{
      label: '終了',
      click: app.quit,
    }]))
    tray.setToolTip('LiveSupport')
  }
}

module.exports = App
