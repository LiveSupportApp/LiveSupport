const Util = require('../../Util')
const setting = require('./settings')
const BouyomiChan = require('./software/BouyomiChan')
const Softalk = require('./software/Softalk')

class Index {
  constructor() {
    switch (setting.software) {
    case 'bouyomichan': this.software = new BouyomiChan(); break
    case 'softalk':     this.software = new Softalk();     break
    default: Util.showError('認証タイプ名が正しくありません')
    }
  }

  message(item) {
    this.software.message(item.message)
  }
}

module.exports = Index
