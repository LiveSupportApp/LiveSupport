const YouTube = require('./API/YouTube');
const TwitCasting = require('./API/TwitCasting');
const {EventEmitter} = require('events');

class API extends EventEmitter {
  /**
   * APIをまとめるクラス
   * @param {string} type 使用するAPI
   * @extends EventEmitter
   */
  constructor(type) {
    super();
    switch (type) {
      case 'youtube':     this.api = new YouTube();     break;
      case 'twitcasting': this.api = new TwitCasting(); break;
      default: throw new Error('Type is not appropriate');
    }
    this.api.on('error', data => { this.emit('error', data) });
    this.api.on('ready', data => { this.emit('ready', data) });
    this.api.on('json',  data => { this.emit('json',  data) });
    this.api.on('chat',  data => { this.emit('chat',  data) });
  }

  /**
   * 認証する
   */
  authorize(type) {
    this.api.authorize(type);
  }

  /**
   * チャット/コメントを取得する
   * @param {number} timeout 取得間隔
   */
  listen(timeout) {
    this.api.listen(timeout);
  }

  /**
   * チャット/コメントを送信する
   * @param {string} message 送信するメッセージ
   */
  send(message) {
    this.api.send(message);
  }
}

module.exports = API;
