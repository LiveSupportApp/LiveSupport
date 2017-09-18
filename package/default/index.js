const {EventEmitter} = require('events');
const path = require('path');
const {BrowserWindow} = require('electron');

class Main extends EventEmitter {
  constructor() {
    super();
    this.win = new BrowserWindow({
      width: 600,
      height: 200,
      alwaysOnTop: true,
      show: false,
    });
    this.win.loadURL(path.join(__dirname, 'index.html'));
    this.on('message', item => {
      this.win.webContents.send('message', item);
    });
  }
}

module.exports = Main;
