const {EventEmitter} = require('events')
const request = require('request')
const tmi = require('tmi.js')
const OAuth = require('./Twitch/OAuth')

let client

class Twitch extends EventEmitter {
  authorize(type) {
    let oauth = new OAuth(type)
    oauth.authorize((token, clientId) => {
      this.token = token
      this.clientId = clientId
      this.getUser()
    })
  }

  getUser() {
    request.get({
      uri: 'https://api.twitch.tv/kraken/user',
      headers: {
        'Accept': 'application/vnd.twitchtv.v5+json',
        'Authorization': `OAuth ${this.token}`,
      },
      json: true,
    }, (err, res, data) => {
      if (err) {
        this.emit('error', err)
      } else if (res.statusCode != 200) {
        this.emit('error', data)
      } else {
        this.userId = data._id
        this.username = data.name
        this.getLive()
      }
    })
  }

  getLive() {
    request.get({
      uri: `https://api.twitch.tv/kraken/streams/${this.userId}`,
      headers: {
        'Accept': 'application/vnd.twitchtv.v5+json',
        'Client-ID': this.clientId,
      },
      json: true,
    }, (err, res, data) => {
      if (err) {
        this.emit('error', err)
      } else if (res.statusCode != 200) {
        this.emit('error', data)
      } else if (!data.stream) {
        this.emit('error', new Error('No live was found'))
      } else {
        this.channelId = data.stream.channel._id
        this.channelName = data.stream.channel.name
        this.emit('ready')
      }
    })
  }

  getLogoUrl(userId) {
    request.get({
      uri: `https://api.twitch.tv/kraken/users/${userId}`,
      headers: {
        'Accept': 'application/vnd.twitchtv.v5+json',
        'Client-ID': this.clientId,
      },
      json: true,
    }, (err, res, data) => {
      if (err) {
        this.emit('error', err)
      } else if (res.statusCode != 200) {
        this.emit('error', data)
      } else {
        return data.logo
      }
    })
  }

  listen() {
    client = new tmi.client({
      identity: {
        username: this.username,
        password: `oauth:${this.token}`
      },
      channels: [`#${this.username}`]
    })

    client.connect()

    client.on('message', (channel, userstate, message, self) => {
      this.emit('json', {
        twitch: {
          message: message,
          user: userstate,
          channel: channel,
          self: self,
        },
      })
      this.emit('message', {
        message: message,
        name: userstate.username,
        // TODO: image: getLogoUrl(userstate.username),
      })
    })
  }

  send(message) {
    client.action(`#${this.username}`, message)
  }

  reacquire() {
    this.getUser()
  }
}

module.exports = Twitch
