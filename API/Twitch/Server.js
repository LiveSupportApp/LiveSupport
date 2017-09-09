const credential = require('./credential.json');
const http = require('http');
const url = require('url');
const {shell} = require('electron');
const request = require('request');

class Server {
  constructor() {
    this.server = http.createServer();
  }

  getNewToken(callback) {
    let authUrl = 'https://api.twitch.tv/kraken/oauth2/authorize'+
      `?client_id=${credential.client_id}&`+
      `redirect_uri=${credential.redirect_uri}&`+
      'response_type=code&'+
      'scope=user_read chat_login';
    shell.openExternal(authUrl);
    this.server.listen(7170);
    this.server.on('request', (req, res) => {
      this.handler(req, res, code => {
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
      });
    });
  }

  handler(req, res, callback) {
    res.writeHead(200, {'Content-Type': 'text/plain; charset=UTF-8'});
    let qs = url.parse(req.url, true).query;
    let message = 'LiveSupport\n';
    if (qs.code) {
      res.write('認証しました');
      callback(qs.code);
    } else if (qs.error==='access_denied') {
      res.write('アクセスが拒否されました');
    } else if (qs.error) {
      res.write(`エラー：${qs.error}`)
    }
    res.end('\nこれでこのウィンドウまたはタブを閉じてもかまいません。');
    this.server.close();
  }

  get clientId() {
    return credential.client_id;
  }
}

module.exports = Server;
