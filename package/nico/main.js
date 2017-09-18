const {
  remote,
  ipcRenderer,
} = require('electron')
const settings = require('./settings.json')
const NicoJS = require('nicoJS')
const command = settings.command

let nico

{
  const win = remote.getCurrentWindow()
  win.maximize()
  win.setIgnoreMouseEvents(true)
  win.show()

  const size = win.getSize()
  nico = new NicoJS({
    app: document.getElementById('render'),
    width: size[0],
    height: size[1],
    font_size: settings.size,
    color: `#${settings.color}`
  })
}

nico.listen()

ipcRenderer.on('message', (event, data) => {
  let params = {
    text: data.message,
    font_size: settings.size,
    color: `#${settings.color}`,
    layout: 'naka',
  }
  if (command.is) {
    let cmds = data.message.match(new RegExp(command.regExp)).split(command.delimiter)
    if (cmds) {
      for (let cmd in command.content) {
        for (let key in command.content[cmd]) {
          if (cmd.includes(cmd)) params[cmd] = key
        }
      }
    }
  }
  nico.send(params)
})
