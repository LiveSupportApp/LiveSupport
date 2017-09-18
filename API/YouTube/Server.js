const credential = require('./credential.json')
const http = require('http')
const url = require('url')
const Util = require('../../Util')
const googleAuth = require('google-auth-library')
const auth = new googleAuth()
const oauth2Client = new auth.OAuth2(
  credential.web.client_id,
  credential.web.client_secret,
  credential.web.redirect_uris[0]
)

class Server {
  constructor() {
    this.server = http.createServer()
  }

  authorize(data, callback) {
    oauth2Client.credentials = data
    callback(oauth2Client)
  }

  getNewToken(callback) {
    let authURL = oauth2Client.generateAuthUrl({
      access_type: 'online',
      scope: 'https://www.googleapis.com/auth/youtube'
    })
    Util.open(authURL)
    this.server.listen(7170)
    this.server.on('request', (req, res) => {
      this.handler(req, res, code => {
        oauth2Client.getToken(code, (err, token) => {
          if (err) {
            Util.msgbox({
              type: 'warning',
              btns: ['再認証'],
              msg: '認証できませんでした。',
              detail: err.toString()
            }, () => { this.getNewToken(callback) })
          } else {
            oauth2Client.credentials = token
            callback(oauth2Client, token)
          }
        })
      })
    })
  }

  handler(req, res, callback) {
    res.writeHead(200, {'Content-Type': 'text/plain; charset=UTF-8'})
    let qs = url.parse(req.url, true).query
    let message = 'LiveSupport\n'
    if (qs.code) {
      message += '認証しました'
      callback(qs.code)
    } else if (qs.result == 'denied') {
      message += 'アクセスが拒否されました'
    }
    res.write(`${message}\nこれでこのウィンドウまたはタブを閉じてもかまいません。`)
    res.end()
    this.server.close()
  }
}

module.exports = Server
