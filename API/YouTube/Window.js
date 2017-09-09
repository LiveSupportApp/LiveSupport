const credential = require('./credential.json');
const request = require('request');
const {BrowserWindow} = require('electron');
const url = require('url');
const Util = require('../../Util');
const YouTube = require('../YouTube');
const googleAuth = require('google-auth-library');
const auth = new googleAuth();

class Window {
  constructor() {
    this.win = new BrowserWindow({ show: false });
    this.win.on('closed', () => { this.win = null; });
    this.client = new auth.OAuth2(
      credential.web.client_id,
      credential.web.client_secret,
      credential.web.redirect_uris[0]
    );
  }

  authorize(data, callback) {
    this.client.credentials = data;
    callback(this.client);
  }

  getNewToken(callback) {
    let authUrl = this.client.generateAuthUrl({
      access_type: 'online',
      scope: 'https://www.googleapis.com/auth/youtube'
    });
    this.win.loadURL(authUrl);
    this.win.show();
    this.win.webContents.on('will-navigate', (event, url) => {
      event.preventDefault();
      let code = url.parse(url, true).query.code;
      if (!code) return this.win.reload();
      this.win.close();
      this.client.getToken(code, (err, token) => {
        if (err) return this.win.reload();
        this.client.credentials = token;
        callback(this.client, token);
      });
    });
  }
}

module.exports = Window;
