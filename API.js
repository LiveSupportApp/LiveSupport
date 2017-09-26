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
    const notAvailable = []
    for (const service of this.names) {
      const oauth = settings.get[service].oauth
      switch (service) {
        case 'niconico':    this.services.niconico    = new Niconico(oauth);    break
        case 'twitcasting': this.services.twitcasting = new TwitCasting(oauth); break
        case 'twitch':      this.services.twitch      = new Twitch(oauth);      break
        case 'twitter':     this.services.twitter     = new Twitter(oauth);     break
        case 'youtube':     this.services.youtube     = new YouTube(oauth);     break
        default: () => {
          Util.showError(`サービス名が正しくありません - ${service}`)
          notAvailable.push(service)
        }
      }
      this.names = notAvailable.filter(v => { return notAvailable.includes(v) })
    }
    for (const service of this.names) {
      service.on('error',   data => { this.emit('error',   data) })
      service.on('ready',   data => { this.emit('ready',   data) })
      service.on('json',    data => { this.emit('json',    data) })
      service.on('message', data => { this.emit('message', data) })
    }
  }

  /**
   * Authorize
   */
  authorize() {
    for (const service of this.names)
      service.authorize()
  }

  /**
   * messageを取得する
   * @param {Number} [timeout] 更新間隔
   */
  listen(timeout) {
    for (const service of this.names)
      service.listen(timeout)
  }

  /**
   * messageを送信する
   * @param {String} message 送信するメッセージ
   */
  send(message) {
    for (const service of this.names)
      service.send(message)
  }

  /**
   * 再取得する
   */
  reacquire(service) {
    this.services[service].reacquire()
  }

  get service() {
    return this.services
  }
}

module.exports = API
