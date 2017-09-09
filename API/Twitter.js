const {EventEmitter} = require('events');
const OAuth = require('./Twitter/OAuth');
const Util = require('../Util');
const hashtag = require('../package/settings').twitter.hashtag;

class Twitter extends EventEmitter {
  constructor() {
    super();
    if (!hashtag) Util.showError('ハッシュタグを設定してください');
  }

  authorize(type) {
    let oauth = new OAuth(type);
    oauth.authorize(client => {
      this.client = client;
      this.getTweet();
    });
  }

  getTweet() {
    this.client.stream('statuses/filter', { track: hashtag }, (stream) => {
      stream.on('data', data => {
        this.emit('json', {
          twitter: data,
        });
        this.emit('message', {
          message: data.text,
          name: data.user.name,
          image: data.user.profile_image_url,
        });
      });

      stream.on('error', err => {
        this.emit('error', err);
      });
    });
  }
}

module.exports = Twitter;
