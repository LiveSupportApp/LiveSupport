const {
  app,
  globalShortcut,
} = require('electron')

const API = require('./API')
const App = require('./App')
const Package = require('./Package')
const Util = require('./Util')

const settings = Util.settings
const packages = []

let api

if (app.makeSingleInstance(() => {})) app.quit()

app.on('window-all-closed', () => {})

app.on('ready', () => {
  console.log('ready')
  App.trayInit()

  api = new API()
  api.authorize()

  main()
})

function main() {
  console.log('main')
  api.on('ready', () => {
    console.log('Api ready')
    for (const name of settings.package) {
      packages.push(Package.getPackage(name))
    }

    api.listen()

    globalShortcut.register('ALT+/', () => {
      Util.prompt(Util._.inputMessage, res => {
        if (res) api.send(res)
      })
    })
  })

  api.on('error', err => {
    if (err.message==='No live was found') {
      Util.msgbox({
        type: 'warning',
        message: Util._.canNotFindLive + Util._.doAgain,
        detail: Util._.wait,
        buttons: [Util._.yes, Util._.cancel],
        only: 0,
      }).then(() => api.reacquire())
    } else if (err.message==='Can not find chat') {
      Util.msgbox({
        type: 'warning',
        message: Util._.canNotFindChat + Util._.doAgain,
        detail: Util._.wait,
        buttons: [Util._.yes, Util._.cancel],
        only: 0,
      }).then(() => api.reacquire())
    } else {
      Util.showError(err)
    }
  })

  api.on('message', item => {
    for (const pack of packages) {
      pack.message(item)
    }
  })
}

process.on('unhandledRejection', Util.showError)
