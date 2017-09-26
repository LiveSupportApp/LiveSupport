const credential = require('./credential.json')
const http = require('http')
const url = require('url')
const Util = require('../../Util')

class Server {
  constructor() {
    this.server = http.createServer()
  }

  getNewToken(callback) {
    const oauthURL = 'https://ssl.twitcasting.tv/oauth_confirm.php?'+
      `client_id=${credential.client_id}&response_type=code`
    Util.open(oauthURL)
    this.server.listen(7170)
    this.server.on('request', (req, res) => {
      this.handler(req, res, callback)
    })
  }

  handler(req, res, callback) {
    res.writeHead(200, {'Content-Type': 'text/plain; charset=UTF-8'})
    const qs = url.parse(req.url, true).query
    let message = 'LiveSupport\n'
    if (qs.code) {
      message += Util._.authenticated
      callback(qs.code)
    } else if (qs.result === 'denied') {
      message += Util._.denied
    }
    res.write(`${message}\n${Util._.canClose}`)
    res.end()
    this.server.close()
  }
}

module.exports = Server
