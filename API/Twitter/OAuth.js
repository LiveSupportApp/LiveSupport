const storage = require('electron-json-storage')
const Util = require('../../Util')
const Code = require('./Code')
const Server = require('./Server')
const Window = require('./Window')

class OAuth {
  constructor(type) {
    this.type = type
    switch (type) {
    case 'code':
      this.oauth = new Code()
      break
    case 'server':
      this.oauth = new Server()
      break
    case 'window':
      this.oauth = new Window()
      break
    default:
      Util.showError('OAuth type is not appropriate')
    }
  }

  authorize(callback) {
    storage.get('twitter', (err, data) => {
      if (err) Util.showError(err)
      if (Object.keys(data).length === 0) {
        this.oauth.getNewToken((access_token_key, access_token_secret) => {
          data = {
            access_token_key: access_token_key,
            access_token_secret: access_token_secret,
          }
          storage.set('twitter', data, Util.showError)
          this.oauth.authorize(data, callback)
        })
      } else {
        this.oauth.authorize(data, callback)
      }
    })
  }
}

module.exports = OAuth