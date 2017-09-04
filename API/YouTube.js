const google = require('googleapis');
const {EventEmitter} = require('events');
const Util = require('../Util');
const OAuth = require('./youtube/OAuth');

class YouTube extends EventEmitter {
  constructor() {
    super();
    this.youtube = google.youtube('v3')
  }

  authorize(type) {
    let oauth = new OAuth(type);
    oauth.authorize(auth => {
      this.auth = auth;
      this.getLive();
    });
  }

  getLive() {
    this.youtube.liveBroadcasts.list({
      auth: this.auth,
      part: 'id,status',
      mine: true,
      broadcastType: 'all',
      maxResults: 1,
    }, (err, res) => {
      if (err) {
        this.emit('error', err);
      } else if (!res.items[0]||res.items[0].status.recordingStatus!=='recording') {
        this.emit('error', new Error('No live was found'));
      } else {
        this.liveId = res.items[0].id;
        this.getChatId();
      }
    });
  }

  getChatId() {
    this.youtube.videos.list({
      auth: this.auth,
      part: 'liveStreamingDetails',
      id: this.liveId,
    }, (err, res) => {
      if (err) {
        this.emit('error', err);
      } else if (!res.items.length) {
        this.emit('error', new Error('Can not find chat'));
      } else {
        this.chatId = res.items[0].liveStreamingDetails.activeLiveChatId;
        this.emit('ready');
      }
    });
  }

  getChat() {
    this.youtube.liveChatMessages.list({
      auth: this.auth,
      liveChatId: this.chatId,
      part: 'snippet,authorDetails',
      hl: 'ja',
      maxResults: 2000,
    }, (err, res) => {
      if (err) {
        this.emit('error', err);
      } else {
        this.emit('json', {
          youtube: res,
        });
      }
    });
  }

  listen(timeout) {
    setInterval(()=>{this.getChat()}, timeout);
    let lastRead = 0, item = {}, time = 0;
    this.on('json', json => {
      for (let item of json.youtube.items) {
        time = new Date(item.snippet.publishedAt).getTime();
        if (lastRead < time) {
          lastRead = time;
          this.emit('message', {
            message: item.snippet.textMessageDetails.messageText,
            name: item.authorDetails.displayName,
            image: item.author.profileImageUrl
          });
        }
      }
    });
  }

  send(message) {
    this.youtube.liveChatMessages.insert({
      auth: this.auth,
      part: 'snippet',
      resource: {
        snippet: {
          liveChatId: this.chatId,
          type: 'textMessageEvent',
          textMessageDetails: {
            messageText: message
          }
        }
      }
    })
  }

  reacquire() {
    this.getLive();
  }
}

module.exports = YouTube;
