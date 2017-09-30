const {EventEmitter} = require('events')
const OAuth = require('./Twitter/OAuth')
const Util = require('../Util')

class Twitter extends EventEmitter {
  constructor(oauth) {
    super()
    this.oauth = oauth
    this.hashtag = Util.settings.twitter.hashtag
    if (!this.hashtag) Util.showError(Util._('invalidHashtag'))
    if (/[#＃]/.test(this.hashtag)) this.hashtag.replace(/^[#＃]/, '#')
    else this.hashtag = `#${this.hashtag}`
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
