const credential = require('./credential.json')
const TwitterAPI = require('node-twitter-api')
const Twitter = require('twitter')
const {BrowserWindow} = require('electron')

class Window {
  constructor() {
    this.win = new BrowserWindow({ show: false })
    this.win.on('closed', () => { this.win = null })
    this.client = new TwitterAPI({
      consumerKey: credential.consumer_key,
      consumerSecret: credential.consumer_secret,
      callback: credential.redirect_uri,
    })
  }

  authorize(data, callback) {
    callback(new Twitter({
      consumer_key: credential.consumer_key,
      consumer_secret: credential.consumer_secret,
      access_token_key: data.access_token_key,
      access_token_secret: data.access_token_secret,
    }))
  }

  getNewToken(callback) {
    this.client.getRequestToken((err, req_token, req_token_secret) => {
      const oauthURL = this.client.getAuthUrl(req_token)

      this.win.loadURL(oauthURL)
      this.win.show()

      this.win.webContents.on('will-navigate', (event, url) => {
        event.preventDefault()
        const verifier = url.parse(url, true).query.oauth_verifier
        if (!verifier) return this.win.reload()
        this.win.close()
        this.client.getAccessToken(
          req_token,
          req_token_secret,
          verifier,
          (err, access_token_key, access_token_secret) => {
            if (err) return this.win.reload()
            callback(access_token_key, access_token_secret)
          })
      })
    })
  }
}

module.exports = Window
