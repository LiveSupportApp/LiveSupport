const {EventEmitter} = require('events');
const path = require('path');
const {BrowserWindow} = require('electron');


class Main extends EventEmitter {
  constructor() {
    this.on('message', item => {
      this.win.webContents.send('message', item);
    });
  }

  read(text) {

  }
}

module.exports = Main;
