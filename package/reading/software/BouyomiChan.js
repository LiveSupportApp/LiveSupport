const {exec} = require('child_process')
const Process = require('Process')
const Settings = require('../../../Settings')
const settings = new Settings('../../settings')

const path = require('path')

class BouyomiChan {
  constructor() {
    let process = Process.getPath()
    if (!process.running) exec(process.path)
    this.path = path.join(path.dirname(process.path), 'RemoteTalk', 'RemoteTalk.exe')
    settings.updateSettings('.Softalk.path', this.path)
    let opt = settings.getSettings('.BouyomiChan')
    this.args = `${opt.speed} ${opt.interval} ${opt.volume} ${opt.quality}`
  }

  message(text) {
    if (!this.path || !text) return
    exec(`${this.path} /t "${(text.replace('"',' ').replace('\n',' '))}" ${this.args}`)
  }
}

module.exports = BouyomiChan
