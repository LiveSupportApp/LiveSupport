const {EventEmitter} = require('events')
const OAuth = require('./Twitter/OAuth')
const Util = require('../Util')
const Settings = require('../Settings')
const settings = new Settings('./settings.json')

class Twitter extends EventEmitter {
  constructor(oauth) {
    super()
    this.oauth = oauth
    this.hashtag = settings.get.twitter.hashtag
    if (!this.hashtag) {
      Util.prompt('ハッシュタグを入力してください', res => {
        this.hashtag = (res.match(/^[#＃]/)) ? res.replace(/^＃/, '#') : `#${res}`
        settings.updateSetting('.twitter.hashtag', this.hashtag)
      })
    }
  }

  authorize() {
    const oauth = new OAuth(this.oauth)
    oauth.authorize(client => {
      this.client = client
      this.getTweet()
    })
  }

  getTweet() {
    this.client.stream('statuses/filter', { track: this.hashtag }, (stream) => {
      stream.on('data', data => {
        this.emit('message', {
          message: data.text,
          name: data.user.name,
          image: data.user.profile_image_url,
          json: {
            service: 'twitter',
            twitter: data,
          },
        })
      })

      stream.on('error', err => {
        this.emit('error', err)
      })
    })
  }
}

module.exports = Twitter
