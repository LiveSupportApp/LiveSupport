const Util = require('../../Util')
const credential = require('./credential.json')
const TwitterAPI = require('node-twitter-api')
const Twitter = require('twitter')
const http = require('http')
const url = require('url')

class Server {
  constructor() {
    this.server = http.createServer()
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
      Util.open(oauthURL)
      this.server.listen(7170)
      this.server.on('request', (req, res) => {
        this.handler(req, res, verifier => {
          this.client.getAccessToken(
            req_token,
            req_token_secret,
            verifier,
            (err, access_token_key, access_token_secret) => {
              if (err) {
                Util.msgbox({
                  type: 'warning',
                  message: Util._('canNotOAuth') + Util._('doAgain'),
                  detail: err.toString(),
                  buttons: [Util._('yes'), Util._('cancel')],
                  only: 0,
                }).then(() => this.getNewToken(callback))
              } else {
                callback(access_token_key, access_token_secret)
              }
            })
        })
      })
    })
  }

  handler(req, res, callback) {
    res.writeHead(200, {'Content-Type': 'text/plain; charset=UTF-8'})
    const qs = url.parse(req.url, true).query
    let message = 'LiveSupport\n'
    if (qs.oauth_verifier) {
      message += Util._('authenticated')
      callback(qs.oauth_verifier)
    } else if (qs.denied) {
      message += Util._('denied')
    }
    res.write(`${message}\n${Util._('canClose')}`)
    res.end()
    this.server.close()
  }
}

module.exports = Server
