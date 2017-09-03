const storage = require('electron-json-storage');
const Util = require('../../Util');
const Code = require('./Code');
const Server = require('./Server');
const Window = require('./Window');

class OAuth {
  constructor(type) {
    this.type = type;
    switch (type) {
      case 'code':   this.oauth = new Code();   break;
      case 'server': this.oauth = new Server(); break;
      case 'window': this.oauth = new Window(); break;
      default: Util.showError(new Error('OAuth type is not appropriate'));
    }
  }

  authorize(callback) {
    storage.get(`youtube-${this.type}`, (err, data) => {
      if (err) Util.showError(err);
      if (Object.keys(data).length === 0) {
        this.oauth.getNewToken((auth, token) => {
          storage.set(`youtube-${this.type}`, token, Util.showError);
          callback(auth);
        });
      } else {
        this.oauth.authorize(data, callback);
      }
    });
  }
}

module.exports = OAuth;
