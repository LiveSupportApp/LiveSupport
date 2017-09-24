const {EventEmitter} = require('events')
const OAuth = require('./Twitter/OAuth')
const Util = require('../Util')
const Settings = require('../Settings')
const settings = new Settings('./settings.json')

class Twitter extends EventEmitter {
  constructor() {
    super()
    this.hashtag = settings.get.twitter.hashtag
    if (!this.hashtag) {
      Util.prompt('ハッシュタグを入力してください', res => {
        this.hashtag = (res.match(/^[#＃]/)) ? res.replace(/^＃/, '#') : `#${res}`
        settings.updateSetting('.twitter.hashtag', this.hashtag)
      })
    }
  }

  authorize(type) {
    const oauth = new OAuth(type)
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
