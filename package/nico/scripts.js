const {
  remote,
  ipcRenderer,
  screen,
} = require('electron');
const config = require('./config.json');
const NicoJS = require('nicoJS');

let nico;

{
  const win = remote.getCurrentWindow();
  win.maximize();
  win.setIgnoreMouseEvents(true);
  win.show();
  win.toggleDevTools();
  const size = win.getSize();
  nico = new NicoJS({
    app: document.getElementById('render'),
    width: size[0],
    height: size[1],
    font_size: config.size,
    color: `#${config.color}`
  });
}

nico.listen();

ipcRenderer.on('chat', (event, data) => {
  let params = {
    text: data.message,
    font_size: config.size,
    color: `#${config.color}`,
    layout: 'naka',
  };
  let command = data.msg.match(/[[{].+[\]}]/);
  if (config.command && command) {
    for (let key in opt) {
      for (let cmd in config.command[key]) {
        let item = config.command[key][cmd];
        if (data.msg.match(new RegExp(item, 'i'))) size = cmd;
      }
    }
  }
  nico.send(params);
});
