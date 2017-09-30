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
      message: Util._('willOAuth'),
      detail: Util._('inputCode'),
      buttons: [Util._('ok')],
      only: 0,
    }).then(() => {
      this.client.getRequestToken((err, req_token, req_token_secret) => {
        const oauthURL = this.client.getAuthUrl(req_token)
        Util.open(oauthURL)
        Util.prompt(Util._('inputCode'), code => {
          this.client.getAccessToken(
            req_token,
            req_token_secret,
            code,
            (err, access_token_key, access_token_secret) => {
              if (err) {
                Util.msgbox({
                  type: 'warning',
                  message: Util._('canNotOAuth') + Util._('doAgain'),
                  detail: err.toString(),
                  buttons: [Util._('yes'), Util._('cancel')],
                  only: 0,
                }).then(() => this.getNewToken(callback))
              } else
                callback(access_token_key, access_token_secret)
            })
        })
      })
    })
  }
}

module.exports = Code
