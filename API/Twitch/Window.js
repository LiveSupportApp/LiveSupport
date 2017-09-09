const credential = require('./credential.json');
const request = require('request');
const {BrowserWindow} = require('electron');
const url = require('url');
const Util = require('../../Util');

class Window {
  constructor() {
    this.win = new BrowserWindow({ show: false });
    this.win.on('closed', () => { this.win = null; });
  }

  getNewToken(callback) {
    let authUrl = 'https://api.twitch.tv/kraken/oauth2/authorize'+
      `?client_id=${credential.client_id}&`+
      `redirect_uri=${credential.redirect_uri}&`+
      'response_type=code&'+
      'scope=user_read chat_login';
    this.win.loadURL(authUrl);
    this.win.show();
    this.win.webContents.on('will-navigate', (event, url) => {
      event.preventDefault();
      let code = url.parse(url, true).query.code;
      if (!code) return this.win.reload();
      this.win.close();
      request.post({
        uri: 'https://api.twitch.tv/kraken/oauth2/token'+
          `?client_id=${credential.client_id}`+
          `&client_secret=${credential.client_secret}`+
          `&code=${code}`+
          '&grant_type=authorization_code'+
          `&redirect_uri=${credential.redirect_uri}`,
        headers: { 'Content-type': 'application/x-www-form-urlencoded' },
        json: true,
      }, (err, res, data) => {
        if (err) return this.win.reload();
        callback(data, credential.client_id);
      });
    });
  }
}

module.exports = Window;
