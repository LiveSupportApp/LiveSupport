const {exec} = require('child_process')
const path = require('path')
const Util = require('../../Util')
const settings = require('../../settings').bouyomichan

class BouyomiChan {
  constructor() {
    this.path = path.join(path.dirname(Util.getPath('BouyomiChan')), 'RemoteTalk', 'RemoteTalk.exe')
    this.args = `${settings.speed} ${settings.interval} ${settings.volume} ${settings.quality}`
  }

  message(text) {
    if (!this.path || !text) return
    exec(`${this.path} /t "${(text.replace('"',' ').replace('\n',' '))}" ${this.args}`)
  }
}

module.exports = BouyomiChan
