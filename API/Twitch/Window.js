const credential = require('./credential/window.json');
const request = require('request');
const {BrowserWindow} = require('electron');
const url = require('url');
const Util = require('../../Util');
const TwitCasting = require('../TwitCasting.js');

class Window {
  constructor() {
    this.win = new BrowserWindow({show:false});
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
    this.win.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
      let code = url.parse(newUrl, true).query.code;
      if (code) {
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
          callback(data, credential.client_id);
        });
      }
    });
  }
}

module.exports = Window;
