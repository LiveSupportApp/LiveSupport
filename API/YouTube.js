const google = require('googleapis')
const {EventEmitter} = require('events')
const OAuth = require('./YouTube/OAuth')
const Util = require('../Util')

class YouTube extends EventEmitter {
  constructor() {
    super()
    this.youtube = google.youtube('v3')
  }

  authorize() {
    const oauth = new OAuth(Util.settings.youtube.oauth)
    oauth.authorize(oauth => {
      this.oauth = oauth
      this.getLive()
    })
  }

  getLive() {
    this.youtube.liveBroadcasts.list({
      auth: this.oauth,
      part: 'id,status',
      mine: true,
      broadcastType: 'all',
      maxResults: 1,
    }, (err, res) => {
      if (err) {
        this.emit('error', err)
      } else if (!res.items[0]||res.items[0].status.recordingStatus!=='recording') {
        this.emit('error', new Error('No live was found'))
      } else {
        this.liveId = res.items[0].id
        this.getChatId()
      }
    })
  }

  getChatId() {
    this.youtube.videos.list({
      auth: this.oauth,
      part: 'liveStreamingDetails',
      id: this.liveId,
    }, (err, res) => {
      if (err) {
        this.emit('error', err)
      } else if (!res.items.length) {
        this.emit('error', new Error('Can not find chat'))
      } else {
        this.chatId = res.items[0].liveStreamingDetails.activeLiveChatId
        this.emit('ready')
      }
    })
  }

  getChat() {
    this.youtube.liveChatMessages.list({
      auth: this.oauth,
      liveChatId: this.chatId,
      part: 'snippet,authorDetails',
      hl: 'ja',
      maxResults: 2000,
    }, (err, res) => {
      if (err) {
        this.emit('error', err)
      } else {
        this.emit('json', {
          service: 'youtube',
          youtube: res,
        })
      }
    })
  }

  listen(timeout) {
    setInterval(()=>{this.getChat()}, timeout)
    let lastRead = 0, time = 0
    this.on('json', json => {
      for (const item of json.youtube.items) {
        time = new Date(item.snippet.publishedAt).getTime()
        if (lastRead < time) {
          lastRead = time
          this.emit('message', {
            message: item.snippet.textMessageDetails.messageText,
            name: item.authorDetails.displayName,
            image: item.author.profileImageUrl,
            json: json,
          })
        }
      }
    })
  }

  send(message) {
    this.youtube.liveChatMessages.insert({
      auth: this.oauth,
      part: 'snippet',
      resource: {
        snippet: {
          liveChatId: this.chatId,
          type: 'textMessageEvent',
          textMessageDetails: {
            messageText: message,
          },
        },
      },
    })
  }

  reacquire() {
    this.getLive()
  }
}

module.exports = YouTube
