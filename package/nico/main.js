const {
  remote,
  ipcRenderer,
} = require('electron')
const config = require('./config.json')
const NicoJS = require('nicoJS')
const command = config.command

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
    font_size: config.size,
    color: `#${config.color}`
  })
}

nico.listen()

ipcRenderer.on('message', (event, data) => {
  let params = {
    text: data.message,
    font_size: config.size,
    color: `#${config.color}`,
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
