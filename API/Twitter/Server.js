const Util = require('../../Util');
const credential = require('./credential.json');
const TwitterAPI = require('node-twitter-api');
const Twitter = require('twitter');
const http = require('http');
const url = require('url');

class Server {
  constructor() {
    this.server = http.createServer();
    this.client = new TwitterAPI({
      consumerKey: credential.consumer_key,
      consumerSecret: credential.consumer_secret,
      callback: credential.redirect_uri,
    });
  }

  authorize(data, callback) {
    callback(new Twitter({
      consumer_key: credential.consumer_key,
      consumer_secret: credential.consumer_secret,
      access_token_key: data.access_token_key,
      access_token_secret: data.access_token_secret,
    }));
  }

  getNewToken(callback) {
    this.client.getRequestToken((err, req_token, req_token_secret) => {
      let authUrl = this.client.getAuthUrl(req_token);

      Util.open(authUrl);
      this.server.listen(7170);
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
                  btns: ['再認証'],
                  msg: '認証できませんでした。',
                  detail: err.toString()
                }, id => { this.getNewToken(callback); });
              } else {
                callback(access_token_key, access_token_secret);
              }
          });
        });
      });
    });
  }

  handler(req, res, callback) {
    res.writeHead(200, {'Content-Type': 'text/plain; charset=UTF-8'});
    let qs = url.parse(req.url, true).query;
    let message = 'LiveSupport\n';
    if (qs.oauth_verifier) {
      message += '認証しました';
      callback(qs.oauth_verifier);
    } else if (qs.denied) {
      message += 'アクセスが拒否されました';
    }
    res.write(`${message}\nこれでこのウィンドウまたはタブを閉じてもかまいません。`);
    res.end();
    this.server.close();
  }
}

module.exports = Server;
