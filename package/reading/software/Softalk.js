const {exec} = require('child_process')
const Process = require('Process')
const Settings = require('../../../Settings')
const settings = new Settings('./settings.json')

class Softalk {
  constructor() {
    const process = Process.getPath()
    this.path = process.path
    settings.updateSetting('.Softalk.path', this.path)
    const opt = settings.getSetting('.Softalk')
    this.args = `/O:${opt.interval} /Q:${opt.quality} /S:${opt.speed} /T:${opt.library} /U:${opt.voice} /V:${opt.volume}`
    if (!process.running && opt.hide) exec(`${this.path} /X:1`)
  }

  message(text) {
    if (!this.path || !text) return
    exec(`${this.path} ${this.args} /W:${(text.replace('|',' '))}`)
  }
}

module.exports = Softalk
