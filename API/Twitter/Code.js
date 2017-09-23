const Util = require('../../Util')
const credential = require('./credential.json')
const TwitterAPI = require('node-twitter-api')
const Twitter = require('twitter')

class Code {
  constructor() {
    this.client = new TwitterAPI({
      consumerKey: credential.consumer_key,
      consumerSecret: credential.consumer_secret,
      callback: 'oob',
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
    Util.msgbox({
      type: 'info',
      buttons: ['OK'],
      message: 'OAuth認証を行います。',
      detail: '次のページから認証を行いコードを入力してください。',
    }).then(() => {
      this.client.getRequestToken((err, req_token, req_token_secret) => {
        const oauthURL = this.client.getAuthUrl(req_token)
        Util.open(oauthURL)
        Util.prompt('コードを入力してください', code => {
          this.client.getAccessToken(
            req_token,
            req_token_secret,
            code,
            (err, access_token_key, access_token_secret) => {
              if (err) {
                Util.msgbox({
                  type: 'warning',
                  buttons: ['再認証'],
                  message: '認証できませんでした。',
                  detail: err.toString(),
                }).then(() => { this.getNewToken(callback) })
              } else {
                callback(access_token_key, access_token_secret)
              }
            })
        })
      })
    })
  }
}

module.exports = Code
