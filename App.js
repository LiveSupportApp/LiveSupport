const {
  Menu,
  Tray,
  app,
  nativeImage,
} = require('electron')
const path = require('path')
const Util = require('./Util')
const Settings = require('./Settings')
const settings = new Settings('./settings')

let tray

class App {
  /**
   * タスクトレイアイコンを初期化する
   */
  static trayInit() {
    tray = new Tray(nativeImage.createFromPath(path.join(__dirname, '/icon/icon.png')))
    tray.setContextMenu(Menu.buildFromTemplate([{
      label: '終了',
      click: app.quit,
    }]))
    tray.setToolTip('LiveSupport')
  }

  static init() {
    return new Promise(resolve => {
      const oauthes = require('./oauthes')
      let service = settings.getSettings('.app.service')
      let oauth = settings.getSettings('.services[service].oauth')
      if (!service) {
        service = this.selectService(Object.keys(oauthes))
        settings.updateSettings('.app.service', service)
      }
      if (!oauthes[service].includes(oauth)) {
        oauth = this.selectOAuth(oauthes[service])
        settings.updateSettings('.services[service].oauth', oauth)
      }
      resolve(settings.settings)
    })
  }

  static selectService(services) {
    Util.msgbox({
      type: 'question',
      buttons: services,
      message: '使用するサービスを選択してください',
    }).then(res => {
      return services[res]
    })
  }

  static selectOAuth(oauthes) {
    Util.msgbox({
      type: 'question',
      buttons: oauthes,
      message: '使用するサービスを選択してください',
    }).then(res => {
      return oauthes[res]
    })
  }
}

module.exports = App
