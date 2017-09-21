const {EventEmitter} = require('events')
const OAuth = require('./Twitter/OAuth')
const Util = require('../Util')

class Twitter extends EventEmitter {
  constructor() {
    super()
    let settings = Util.settings
    this.hashtag = settings.twitter.hashtag
    if (!this.hashtag) {
      Util.prompt('ハッシュタグを入力してください', res => {
        this.hashtag = (res.match(/^[#＃]/)) ? res.replace(/^＃/, '#') : `#${res}`
        settings.twitter.hashtag = this.hashtag
        Util.settings = settings
      })
    }
  }

  authorize(type) {
    let oauth = new OAuth(type)
    oauth.authorize(client => {
      this.client = client
      this.getTweet()
    })
  }

  getTweet() {
    this.client.stream('statuses/filter', { track: this.hashtag }, (stream) => {
      stream.on('data', data => {
        this.emit('json', {
          service: 'twitter',
          twitter: data,
        })
        this.emit('message', {
          message: data.text,
          name: data.user.name,
          image: data.user.profile_image_url,
        })
      })

      stream.on('error', err => {
        this.emit('error', err)
      })
    })
  }
}

module.exports = Twitter
