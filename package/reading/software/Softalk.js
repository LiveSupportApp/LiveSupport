const PowerShell = require('node-powershell')
const {exec} = require('child_process')
const Util = require('../../Util')
const settings = require('../../settings').softalk

class Softalk {
  constructor() {
    this.ps = new PowerShell({ debugMsg: false })
    this.path = Util.getPath('Softalk')
    this.args = `/O:${settings.interval} /Q:${settings.quality} /S:${settings.speed} /T:${settings.library} /U:${settings.voice} /V:${settings.volume} /X:${settings.show}`
  }

  message(text) {
    if (!this.path || !text) return
    exec(`${this.path} ${this.args} /W:"${(text.replace('"',' ').replace('\n',' '))}"`)
  }
}

module.exports = Softalk
