const {EventEmitter} = require('events')
const TwitCasting = require('./API/TwitCasting')
const Twitch = require('./API/Twitch')
const Twitter = require('./API/Twitter')
const YouTube = require('./API/YouTube')
const Util = require('./Util')

class API extends EventEmitter {
  /**
   * APIをまとめるクラス
   * @extends EventEmitter
   */
  constructor() {
    super()
    let settings = Util.settings
    this.service = settings.app.service
    this.oauth = settings[this.service].oauth
    switch (this.service) {
    case 'twitcasting': this.api = new TwitCasting(); break
    case 'twitch':      this.api = new Twitch();      break
    case 'twitter':     this.api = new Twitter();     break
    case 'youtube':     this.api = new YouTube();     break
    default: Util.showError('サービス名が正しくありません')
    }
    this.api.on('error',   data => { this.emit('error',   data) })
    this.api.on('ready',   data => { this.emit('ready',   data) })
    this.api.on('json',    data => { this.emit('json',    data) })
    this.api.on('message', data => { this.emit('message', data) })
  }

  /**
   * 認証する
   */
  authorize() {
    this.api.authorize(this.oauth)
  }

  /**
   * chat/commentを取得する
   * @param {Number} timeout 更新間隔
   */
  listen(timeout) {
    this.api.listen(timeout)
  }

  /**
   * chat/commentを送信する
   * @param {String} message 送信するメッセージ
   */
  send(message) {
    this.api.send(message)
  }

  /**
   * 再取得する
   */
  reacquire() {
    this.api.reacquire()
  }
}

module.exports = API
