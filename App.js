const {
  Menu,
  Tray,
  app,
  nativeImage,
} = require('electron')
const path = require('path')
const Util = require('./Util')
const Settings = require('./Settings')

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
      let settings = Settings.settings
      let oauthes = require('./oauthes')
      let service = settings.app.service
      let oauth = settings.services[service].oauth
      if (!service) {
        service = this.selectService(Object.keys(oauthes))
        settings.app.service = service
      }
      if (!oauthes[service].includes(oauth)) {
        oauth = this.selectOAuth(oauthes[service])
        settings.services[service].oauth = oauth
      }
      Util.settings = settings
      resolve(settings)
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
