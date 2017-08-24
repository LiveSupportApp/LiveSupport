const storage = require('electron-json-storage');
const Util = require('../../Util');
const Server = require('./Server');
const Window = require('./Window');

class OAuth {
  constructor(type) {
    switch (type) {
      case 'server': this.oauth = new Server(); break;
      case 'window': this.oauth = new Window(); break;
      default: throw new Error('OAuth type is not appropriate');
    }
  }

  authorize(callback) {
    storage.get('twitcasting', (err, data) => {
      if (err) Util.showError(err);
      if (Object.keys(data).length === 0) {
        this.oauth.getNewToken(data => {
          storage.set('twitcasting', data.access_token, Util.showError);
          callback(data.access_token);
        });
      } else {
        callback(data.access_token);
      }
    });
  }
}

module.exports = OAuth;
