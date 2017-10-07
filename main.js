const API = require('./API')
const App = require('./App')
const Package = require('./Package')
const Util = require('./Util')

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
      for (const pack of Util.settings.package)
        this.packages.push(Package.getPackage(pack))

      this.api.listen()
    })

    this.api.on('error', err => {
      if (err.message === 'No live was found') {
        Util.msgbox({
          type: 'warning',
          message: Util._('canNotFindLive') + Util._('doAgain'),
          detail: Util._('wait'),
          buttons: [Util._('yes'), Util._('cancel')],
          only: 0,
        }).then(() => this.api.reacquire())
      } else if (err.message === 'Can not find chat') {
        Util.msgbox({
          type: 'warning',
          message: Util._('canNotFindChat') + Util._('doAgain'),
          detail: Util._('wait'),
          buttons: [Util._('yes'), Util._('cancel')],
          only: 0,
        }).then(() => this.api.reacquire())
      } else
        Util.showError(err)
    })

    this.api.on('message', data => {
      for (const pack of this.packages)
        pack.message(data)
    })
  }
}

module.exports = Main
