const {EventEmitter} = require('events')
const PowerShell = require('node-powershell')
const path = require('path')
const Util = require('../../Util')

class Main extends EventEmitter {
  constructor() {
    super()
    this.ps = new PowerShell({ debugMsg: false })
    this.getPath()
    this.on('message', item => {
      this.read(item)
    })
  }

  read(text) {
    if (this.path) {
      this.ps.addCommand(`${this.path} /t "${(text.replace('"',' ').replace('\n',' '))}"`)
      this.ps.invoke()
    }
  }

  getPath() {
    this.ps.addCommand('Get-Process BouyomiChan | Select-Object path')
    this.ps.invoke().then(output => {
      let bc = output.split('\r\n').filter(v => path.isAbsolute(v))[0]
      this.path = path.join(path.dirname(bc), 'RemoteTalk', 'RemoteTalk.exe')
    }).catch(err => {
      Util.msgbox({
        type: 'warning',
        btns: ['再認証'],
        msg: '棒読みちゃんが見つかりません',
        detail: err.toString()
      }, this.getPath)
    })
  }
}

module.exports = Main