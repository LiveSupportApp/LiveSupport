const {exec} = require('child_process')
const Process = require('Process')
const Settings = require('../../../Settings')
const settings = new Settings('./settings.json')

const path = require('path')

class BouyomiChan {
  constructor() {
    const process = Process.getPath()
    if (!process.running) exec(process.path)
    this.path = path.join(path.dirname(process.path), 'RemoteTalk', 'RemoteTalk.exe')
    settings.updateSetting('.Softalk.path', this.path)
    const opt = settings.get.BouyomiChan
    this.args = `${opt.speed} ${opt.interval} ${opt.volume} ${opt.quality}`
  }

  message(text) {
    if (!this.path || !text) return
    exec(`${this.path} /t "${(text.replace('"',' ').replace('\n',' '))}" ${this.args}`)
  }
}

module.exports = BouyomiChan
