const {EventEmitter} = require('events')
const TwitCasting = require('./API/TwitCasting')
const Twitch = require('./API/Twitch')
const Twitter = require('./API/Twitter')
const YouTube = require('./API/YouTube')
const Util = require('./Util')

class API extends EventEmitter {
  /**
   * Arrange API methods
   * @extends EventEmitter
   */
  constructor() {
    super()
    this.names = Util.settings.app.service
    this.services = {}
    for (const service of this.names) {
      switch (service) {
        case 'twitcasting': this.services.twitcasting = new TwitCasting(); break
        case 'twitch':      this.services.twitch      = new Twitch();      break
        case 'twitter':     this.services.twitter     = new Twitter();     break
        case 'youtube':     this.services.youtube     = new YouTube();     break
        default: () => {
          Util.showError(`${Util._('invalidService')} - ${service}`)
          this.names = this.names.filter(i => i !== service)
        }
      }
      service.on('error',   data => this.emit('error',   data))
      service.on('ready',   data => this.emit('ready',   data))
      service.on('message', data => this.emit('message', data))
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
   * Get message
   * @param {Number} [timeout] interval
   */
  listen(timeout) {
    for (const service of this.names)
      service.listen(timeout)
  }

  /**
   * Send message
   * @param {String} message content
   */
  send(message) {
    for (const service of this.names)
      service.send(message)
  }

  /**
   * Get live info again
   */
  reacquire(service) {
    this.services[service].reacquire()
  }

  get service() {
    return this.services
  }
}

module.exports = API
