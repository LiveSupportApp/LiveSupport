const {
  app,
  globalShortcut,
} = require('electron')

const API = require('./API')
const App = require('./App')
const Package = require('./Package')
const Util = require('./Util')

const settings = require('./settings')

let api
let packages = []

if (app.makeSingleInstance(() => {})) app.quit()

app.on('window-all-closed', () => {})

app.on('ready', () => {
  App.trayInit()

  api = new API()
  api.authorize()

  main()
})

function main() {
  api.on('ready', () => {
    for (let name of settings.package) {
      packages.push(Package.getPackage(name))
    }

    api.listen()

    globalShortcut.register('ALT+/', () => {
      Util.prompt('メッセージを入力してください', res => {
        if (res) api.send(res)
      })
    })
  })

  api.on('error', err => {
    if (err.message=='No live was found') {
      Util.msgbox({
        type: 'warning',
        btns: ['OK', '再取得'],
        msg: '配信が見つかりませんでした。',
        detail: '配信している場合は暫く待って取得してください。',
      }, id => { if (id==1) api.reacquire() })
    } else if (err.message=='Can not find chat') {
      Util.msgbox({
        type: 'warning',
        btns: ['OK', '再取得'],
        msg: 'チャットが取得できませんでした。',
        detail: '配信している場合は暫く待って取得してください。',
      }, id => { if (id==1) api.reacquire() })
    } else {
      Util.showError(err)
    }
  })

  api.on('message', item => {
    for (let pack of packages) {
      pack.message(item)
    }
  })
}
