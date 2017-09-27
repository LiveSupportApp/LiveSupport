const API = require('./API')
const App = require('./App')
const Package = require('./Package')
const Util = require('./Util')

const settings = Util.settings
const packages = []

class Main {
  constructor() {
    App.init().then(() => {
      this.api = new API()
      return this.api.authorize()
    }).then(() => {
      this.initEvents()
    })
  }

  initEvents() {
    this.api.on('ready', () => {
      for (const name of settings.package)
        packages.push(Package.getPackage(name))

      this.api.listen()
    })

    this.api.on('error', err => {
      if (err.message==='No live was found') {
        Util.msgbox({
          type: 'warning',
          message: Util._.canNotFindLive + Util._.doAgain,
          detail: Util._.wait,
          buttons: [Util._.yes, Util._.cancel],
          only: 0,
        }).then(() => this.api.reacquire())
      } else if (err.message==='Can not find chat') {
        Util.msgbox({
          type: 'warning',
          message: Util._.canNotFindChat + Util._.doAgain,
          detail: Util._.wait,
          buttons: [Util._.yes, Util._.cancel],
          only: 0,
        }).then(() => this.api.reacquire())
      } else {
        Util.showError(err)
      }
    })

    this.api.on('message', item => {
      for (const pack of packages) {
        pack.message(item)
      }
    })
  }
}

module.exports = Main
