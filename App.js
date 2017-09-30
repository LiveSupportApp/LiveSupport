const {
  Menu,
  Tray,
  app,
  nativeImage,
} = require('electron')
const Util = require('Util')

let tray

class App {
  /**
   * Init app
   * @return {Promise}
   */
  static init() {
    return new Promise((resolve, reject) => {
      this.initEvents().then(() => {
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  }

  /**
   * Init task tray icon
   */
  static trayInit() {
    return new Promise(resolve => {
      const iconPath = Util.join(__dirname, '/icon/icon.png')
      const icon = nativeImage.createFromPath(iconPath)
      const menu = Menu.buildFromTemplate([{
        label: Util._('quit'),
        click: app.quit,
      }])
      tray = new Tray(icon)
      tray.setContextMenu(menu)
      tray.setToolTip('LiveSupport')
      resolve()
    })
  }
}

module.exports = App
