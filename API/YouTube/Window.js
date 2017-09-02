const credential = require('./credential/window.json');
const request = require('request');
const {BrowserWindow} = require('electron');
const url = require('url');
const Util = require('../../Util');
const TwitCasting = require('../TwitCasting');
const googleAuth = require('google-auth-library');
const auth = new googleAuth();
const oauth2Client = new auth.OAuth2(
  credential.web.client_id,
  credential.web.client_secret,
  credential.web.redirect_uris[0]
);


class Window {
  constructor() {
    this.win = new BrowserWindow({ show: false });
    this.win.on('closed', () => { this.win = null; });
  }

  authorize(data, callback) {
    oauth2Client.credentials = data;
    callback(oauth2Client);
  }

  getNewToken(callback) {
    let authUrl = oauth2Client.generateAuthUrl({
      access_type: 'online',
      scope: 'https://www.googleapis.com/auth/youtube'
    });
    this.win.loadURL(authUrl);
    this.win.show();
    this.win.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
      let code = url.parse(newUrl, true).query.code;
      if (code) {
        this.win.close();
        oauth2Client.getToken(code, (err, token) => {
          if (err) {
            Util.msgbox({
              type: 'warning',
              btns: ['再認証'],
              msg: '認証できませんでした。',
              detail: err.toString()
            }, id => { this.getNewToken(callback); });
          } else {
            oauth2Client.credentials = token;
            callback(oauth2Client, token);
          }
        });
      }
    });
  }
}

module.exports = Window;
