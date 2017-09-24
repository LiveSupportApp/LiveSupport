const {EventEmitter} = require('events')
const Niconico = require('./API/Niconico')
const TwitCasting = require('./API/TwitCasting')
const Twitch = require('./API/Twitch')
const Twitter = require('./API/Twitter')
const YouTube = require('./API/YouTube')
const Util = require('./Util')
const Settings = require('./Settings')
const settings = new Settings('./settings.json')

class API extends EventEmitter {
  /**
   * APIをまとめるクラス
   * @extends EventEmitter
   */
  constructor() {
    super()
    this.names = settings.get.app.service
    this.services = {}
    for (const service of this.names) {
      const oauth = settings.get[service].oauth
      switch (service) {
      case 'niconico':    this.services.niconico    = new Niconico(oauth);    break
      case 'twitcasting': this.services.twitcasting = new TwitCasting(oauth); break
      case 'twitch':      this.services.twitch      = new Twitch(oauth);      break
      case 'twitter':     this.services.twitter     = new Twitter(oauth);     break
      case 'youtube':     this.services.youtube     = new YouTube(oauth);     break
      default: Util.showError(`サービス名が正しくありません - ${service}`)
      }
    }
    for (const service of Object.values(this.services)) {
      service.on('error',   data => { this.emit('error',   data) })
      service.on('ready',   data => { this.emit('ready',   data) })
      service.on('json',    data => { this.emit('json',    data) })
      service.on('message', data => { this.emit('message', data) })
    }
  }

  /**
   * 認証する
   */
  authorize() {
    for (const service of Object.values(this.services))
      service.authorize()
  }

  /**
   * chat/commentを取得する
   * @param {Number} [timeout] 更新間隔
   */
  listen(timeout) {
    for (const service of Object.values(this.services))
      service.listen(timeout)
  }

  /**
   * chat/commentを送信する
   * @param {String} message 送信するメッセージ
   */
  send(message) {
    for (const service of Object.values(this.services))
      service.send(message)
  }

  /**
   * 再取得する
   */
  reacquire(service) {
    this.services[service].reacquire()
  }

  get services() {
    return this.names
  }
}

module.exports = API
