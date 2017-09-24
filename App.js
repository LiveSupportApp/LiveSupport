const {
  Menu,
  Tray,
  app,
  nativeImage,
} = require('electron')
const path = require('path')
const Util = require('./Util')
const Settings = require('./Settings')
const settings = new Settings('./settings.json')

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
    const oauthes = require('./oauthes')
    return new Promise(resolve => {
      let service = settings.getSetting('.app.service')
      this.selectService(service, Object.keys(oauthes))
        .then(_service => {
          service = _service
          settings.updateSetting('.app.service', service)
          console.log(service)
          const oauth = settings.getSetting(`.${service}.oauth`)
          console.log(service, oauth)
          return this.selectOAuth(oauth, oauthes[service])
        }).then(oauth => {
          settings.updateSetting(`.${service}.oauth`, oauth)
          resolve(settings.settings)
        }).catch(err => Util.showError(err))
    })
  }

  static selectService(service, services) {
    return new Promise((resolve, reject) => {
      if (service && services.includes(service)) resolve(service)
      else {
        Util.msgbox({
          type: 'question',
          buttons: services,
          message: '使用するサービスを選択してください',
        }).then(res => {
          if (res === -1) reject('canceled')
          else resolve(services[res])
        })
      }
    })
  }

  static selectOAuth(oauth, oauthes) {
    return new Promise((resolve, reject) => {
      if (oauth && oauthes.includes(oauth)) resolve(oauth)
      else {
        Util.msgbox({
          type: 'question',
          buttons: oauthes,
          message: '使用する認証方法を選択してください',
        }).then(res => {
          if (res === -1) reject('canceled')
          else resolve(oauthes[res])
        })
      }
    })
  }
}

module.exports = App
