const storage = require('electron-json-storage')
const Util = require('../../Util')
const Server = require('./Server')
const Window = require('./Window')

class OAuth {
  constructor(type) {
    switch (type) {
      case 'server': this.oauth = new Server(); break
      case 'window': this.oauth = new Window(); break
      default: Util.showError(Util._.invalidOAuthType)
    }
  }

  authorize(callback) {
    storage.get('twitch', (err, data) => {
      if (err) Util.showError(err)
      if (Object.keys(data).length === 0) {
        this.oauth.getNewToken((data, clientId) => {
          storage.set('twitch', data, Util.showError)
          callback(data.access_token, clientId)
        })
      } else {
        callback(data.access_token, this.oauth.clientId)
      }
    })
  }
}

module.exports = OAuth
