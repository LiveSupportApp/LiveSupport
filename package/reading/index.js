const Util = require('../../Util')
const setting = require('./settings')
const BouyomiChan = require('./software/BouyomiChan')
const Softalk = require('./software/Softalk')

class Index {
  constructor() {
    switch (setting.software) {
    case 'BouyomiChan': this.software = new BouyomiChan(); break
    case 'Softalk':     this.software = new Softalk();     break
    default: Util.showError('ソフトが正しくありません')
    }
  }

  message(item) {
    this.software.message(item.message)
  }
}

module.exports = Index
