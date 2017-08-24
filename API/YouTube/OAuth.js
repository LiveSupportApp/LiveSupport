const storage = require('electron-json-storage');
const Util = require('../../Util');
const Code = require('./Code');
const Protocol = require('./Protocol');
const Server = require('./Server');
const Window = require('./Window');

class OAuth {
  constructor(type) {
    switch (type) {
      case 'code':     this.oauth = new Code();     break;
      case 'protocol': this.oauth = new Protocol(); break;
      case 'server':   this.oauth = new Server();   break;
      case 'window':   this.oauth = new Window();   break;
      default: throw new Error('OAuth type is not appropriate');
    }
  }

  authorize(callback) {
    storage.get('youtube', (err, data) => {
      if (err) Util.showError(err);
      if (Object.keys(data).length === 0) {
        this.oauth.getNewToken((auth, token) => {
          storage.set('youtube', token, Util.showError);
          callback(auth);
        });
      } else {
        this.oauth.authorize(data, callback);
      }
    });
  }
}

module.exports = OAuth;
