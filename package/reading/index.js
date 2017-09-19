const PowerShell = require('node-powershell')
const path = require('path')
const Util = require('../../Util')

class Main {
  constructor() {
    this.ps = new PowerShell({ debugMsg: false })
    this.getPath()
  }

  message(item) {
    if (!this.path || !item.message) return
    this.ps.addCommand(`${this.path} /t "${(item.message.replace('"',' ').replace('\n',' '))}"`)
    this.ps.invoke()
  }

  getPath() {
    this.ps.addCommand('Get-Process BouyomiChan | Select-Object path')
    this.ps.invoke().then(output => {
      let bc = output.split('\r\n').filter(v => path.isAbsolute(v))[0]
      this.path = path.join(path.dirname(bc), 'RemoteTalk', 'RemoteTalk.exe')
    }).catch(err => {
      Util.msgbox({
        type: 'warning',
        btns: ['再試行'],
        msg: '棒読みちゃんが見つかりません',
        detail: err.toString()
      }, this.getPath)
    })
  }
}

module.exports = Main
