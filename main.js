const {
  BrowserWindow,
  app,
  globalShortcut,
} = require('electron');
const path = require('path');
const prompt = require('electron-prompt');

const API = require('./API');
const App = require('./App');
const Package = require('./Package');
const Util = require('./Util');

let api;
let config;
let windows = [];

app.setPath('userData', App.path);

if (app.makeSingleInstance((argv, workingDirectory) => {})) {
  Util.showError('すでに起動してるっぽいdёsц☆');
  app.quit();
}

app.on('ready', init);

function init() {
  Package.init();
  config = Package.config;
  App.trayInit();

  for (let name of config.package) {
    windows.push(Package.getPackage(name));
  }

  api = new API(config.type, config.auth);
  api.authorize();

  main();
}

function main() {
  api.on('ready', () => {
    api.listen(config.timeout);
    globalShortcut.register('ALT+/', () => {
      Util.prompt('メッセージを入力してください', res => {
        if (res) api.send(res);
      });
    });
  });

  api.on('error', err => {
    if (err.message=='No live was found') {
      Util.msgbox({
        type: 'warning',
        btns: ['OK', '再取得'],
        msg: '配信が見つかりませんでした。',
        detail: '配信している場合は暫く待って取得してください。'
      }, id => { if (id==1) api.reacquire(); });
    } else if (err.message=='Can not find chat') {
      Util.msgbox({
        type: 'warning',
        btns: ['OK', '再取得'],
        msg: 'チャットが取得できませんでした。',
        detail: '配信している場合は暫く待って取得してください。'
      }, id => { if (id==1) api.reacquire(); });
    } else {
      Util.showError(err);
    }
  });

  api.on('chat', item => {
    console.log(item.message);
    // if (config.reading.is) read(`${msg} さん ${name}`);
    for (let win of windows) {
      win.webContents.send('chat', item);
    }
  });
}
