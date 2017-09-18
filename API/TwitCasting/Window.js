const credential = require('./credential.json')
const request = require('request')
const {BrowserWindow} = require('electron')
const TwitCasting = require('../TwitCasting')

class Window {
  constructor() {
    this.win = new BrowserWindow({ show: false })
    this.win.on('closed', () => { this.win = null })
  }

  getNewToken(callback) {
    let authURL = 'https://ssl.twitcasting.tv/oauth_confirm.php?'+
      `client_id=${credential.client_id}&response_type=code`
    this.win.loadURL(authURL)
    this.win.show()
    this.win.webContents.on('will-navigate', (event, url) => {
      event.preventDefault()
      let code = url.parse(url, true).query.code
      if (!code) return this.win.reload()
      this.win.close()
      request.post({
        uri: `${TwitCasting.baseUrl}/oauth2/access_token`,
        headers: { 'Content-type': 'application/x-www-form-urlencoded' },
        form: {
          code: code,
          grant_type: 'authorization_code',
          client_id: credential.client_id,
          client_secret: credential.client_secret,
          redirect_uri: credential.redirect_uri,
        },
        json: true,
      }, (err, res, data) => {
        if (err) return this.win.reload()
        callback(data)
      })
    })
  }
}

module.exports = Window
