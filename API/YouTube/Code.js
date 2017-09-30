const googleAuth = require('google-auth-library')
const credential = require('./credential.json')
const Util = require('../../Util')
const auth = new googleAuth()
const oauth2Client = new auth.OAuth2(
  credential.installed.client_id,
  credential.installed.client_secret,
  credential.installed.redirect_uris[0]
)

class Code {
  authorize(data, callback) {
    oauth2Client.credentials = data
    callback(oauth2Client)
  }

  getNewToken(callback) {
    Util.msgbox({
      type: 'info',
      message: Util._('willOAuth'),
      detail: Util._('inputCode'),
      buttons: [Util._('ok')],
      only: 0,
    }).then(() => {
      const oauthURL = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/youtube',
      })
      Util.open(oauthURL)
      Util.prompt(Util._('inputCode'), code => {
        oauth2Client.getToken(code, (err, token) => {
          if (err) {
            Util.msgbox({
              type: 'warning',
              message: Util._('canNotOAuth') + Util._('doAgain'),
              detail: err.toString(),
              buttons: [Util._('yes'), Util._('cancel')],
              only: 0,
            }).then(() => this.getNewToken(callback))
          } else {
            oauth2Client.credentials = token
            callback(oauth2Client, token)
          }
        })
      })
    })
  }
}

module.exports = Code
