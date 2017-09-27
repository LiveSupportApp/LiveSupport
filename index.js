const Main = require('Main')
const {
  app,
} = require('electron')

function isStart() {
  if (app.makeSingleInstance(() => {})) return false

  return true
}

app.on('window-all-closed', () => {})

if (isStart()) {
  app.on('ready', () => {
    new Main()
  })
}

process.on('unhandledRejection', console.log)
