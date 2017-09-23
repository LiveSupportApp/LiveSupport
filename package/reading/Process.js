const PowerShell = require('node-powershell')
const path = require('path')
const fs = require('fs')
const ps = new PowerShell({ debugMsg: false })
const settings = require('./settings')
const {
  app,
  dialog,
} = require('electron')

class Processes {
  constructor() {
    this.software = settings.software
    this.path = settings[this.software].path
  }

  getPath() {
    let isRunning = isRunning()
    if (this.isExistFile(this.path))
      return { path: this.path, running: isRunning }
    if (isRunning) this.getProcessPath()
      .then(file => {return { path: file, running: true }})
    this.selectFile(file => {return { path: file, running: false }})
  }

  /**
   * 実行しているプロセスからディレクトリを取得する
   * @returns {String}
   */
  getProcessPath() {
    return new Promise((resolve, reject) => {
      ps.addCommand(`Get-Process ${this.software} | Select-Object path`)
      ps.invoke().then(output => {
        ps.dispose()
        resolve(output.split('\r\n').filter(v => path.isAbsolute(v))[0])
      }).catch(() => {
        ps.dispose()
        reject()
      })
    })
  }

  selectFile(callback) {
    this.openFile(this.software).then(file => {
      callback(file)
    }).catch(() => {
      this.msgbox(`${this.software}.exeを選択してください`).then(() => {
        this.selectFile(callback)
      })
    })
  }

  isRunning() {
    ps.addCommand(`Get-Process ${this.software}`)
    ps.invoke().then(() => {
      ps.dispose()
      return true
    }).catch(() => {
      ps.dispose()
      return false
    })
  }

  isExistFile(file) {
    if (!file) return false
    try {
      fs.statSync(file)
      return true
    } catch (err) {
      if (err.code === 'ENOENT') return false
    }
  }

  openFile(name) {
    return new Promise((resolve, reject) => {
      dialog.showOpenDialog({
        title: 'LiveSupport',
        defaultPath: app.getPath('desktop'),
        filters: [
          { name: 'アプリケーション', extensions: ['exe'] },
        ],
        properties: ['openFile'],
      }, paths => {
        if (paths[0]) {
          let isTarget = paths[0].endsWith(`${name}.exe`)
          if (isTarget) resolve(paths[0])
          else reject()
        } else reject()
      })
    })
  }
}

module.exports = new Processes()
