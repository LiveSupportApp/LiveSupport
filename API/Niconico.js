const Nico = require('node-nicovideo-api')
const {EventEmitter} = require('events')
const storage = require('electron-json-storage')
const Util = require('../Util')
const Settings = require('../Settings')

class Niconico extends EventEmitter {
  authorize() {
    storage.get('niconico', (error, data) => {
      if (error) Util.showError(error)
      if (Object.keys(data).length === 0) prompt()
      else {
        this.id = data.id
        this.pass = data.pass
        this.init()
      }
    })
  }

  prompt() {
    Util.msgbox({
      type: 'info',
      buttons: ['はい'],
      message: 'これからニコニコアカウントへログインします。',
    }).then(id => {
      if (id === 1) return Util.msgbox({
        type: 'warn',
        buttons: ['いいえ', 'はい'],
        message: 'これから先の処理が原因でアカウントを乗っ取られたとしても責任を負えません。同意しますか？',
        detail: 'アカウント情報は暗号化されずにPC内に保存されます。',
      })
    }).then(id => {
      if (id === 1) return Util.prompt('ニコニコアカウントのIDを入力してください')
    }).then(id => {
      this.id = id
      return Util.prompt('ニコニコアカウントのパスワードを入力してください')
    }).then(pass => {
      this.pass = pass
      storage.set('niconico', {
        id: this.id,
        pass: this.pass,
      }, Util.showError)
      this.init()
    })
  }

  init() {
    Nico.login(this.id, this.pass).then(session => {
      return session.live.getLiveInfo('lvxxxxxxx')
    }).then(live => {
      return live.commentProvider()
    }).then(provider => {
      this.provider = provider
    })
  }

  getComment() {
    this.provider.onDidReceiveComment(comment => {
      this.emit('json', {
        service: 'niconico',
        niconico: comment,
      })
    })
  }

  send(message) {
    // TODO: コメンド
    this.provider(message)
  }

  reacquire() {
    this.init()
  }
}

module.exports = Niconico
