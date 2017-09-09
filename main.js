const {
  BrowserWindow,
  app,
  globalShortcut,
} = require('electron');

const API = require('./API');
const App = require('./App');
const Package = require('./Package');
const Settings = require('./Settings');
const Util = require('./Util');

let api;
let config;
let packages = [];

app.setPath('userData', App.path);

if (app.makeSingleInstance((argv, workingDirectory) => {})) {
  Util.showError('すでに起動してるっぽいdёsц☆');
  app.quit();
}

app.on('ready', () => {
  Settings.init(() => {
    config = Package.config;
    App.trayInit();

    api = new API(config.type, config.auth);
    api.authorize();

    main();
  });
});

app.on('window-all-closed', () => {});

function main() {
  api.on('ready', () => {
    for (let name of config.package) {
      packages.push(Package.getPackage(name));
    }

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

  api.on('message', item => {
    console.log(item.message);
    for (let pack of packages) {
      pack.win.webContents.send('chat', item);
    }
  });
}
