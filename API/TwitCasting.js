const {EventEmitter} = require('events')
const request = require('request')
const OAuth = require('./TwitCasting/OAuth')

class TwitCasting extends EventEmitter {
  constructor(oauth) {
    super()
    this.oauth = oauth
  }

  authorize() {
    const oauth = new OAuth(this.oauth)
    oauth.authorize(token => {
      this.token = token
      this.getUser()
    })
  }

  getUser() {
    request.get({
      uri: `${this.baseURL}/verify_credentials`,
      headers: {
        'Accept': 'application/json',
        'X-Api-Version': '2.0',
        'Authorization': `Bearer ${this.token}`,
      },
      json: true,
    }, (err, res, data) => {
      if (err) {
        this.emit('error', err)
      } else if (res.statusCode === 200) {
        this.emit('error', data)
      } else if (!data.user.is_live) {
        this.emit('error', new Error('No live was found'))
      } else {
        this.userId = data.user.id
        this.getLive()
      }
    })
  }

  getLive() {
    request.get({
      uri: `${this.baseURL}/users/${this.userId}/current_live`,
      headers: {
        'Accept': 'application/json',
        'X-Api-Version': '2.0',
        'Authorization': `Bearer ${this.token}`,
      },
      json: true,
    }, (err, res, data) => {
      if (err) {
        this.emit('error', err)
      } else if (res.statusCode === 200) {
        this.emit('error', data)
      } else {
        this.movieId = data.movie.id
        this.emit('ready')
      }
    })
  }

  getChat() {
    request.get({
      uri: `${this.baseURL}/movies/${this.movieId}/comments`,
      headers: {
        'Accept': 'application/json',
        'X-Api-Version': '2.0',
        'Authorization': `Bearer ${this.token}`,
      },
      form: {
        limit: 50,
      },
      json: true,
    }, (err, res, data) => {
      if (err) {
        this.emit('error', err)
      } else if (res.statusCode === 200) {
        this.emit('error', data)
      } else {
        this.emit('json', {
          service: 'twitcasting',
          twitcasting: data,
        })
      }
    })
  }

  listen(timeout) {
    setInterval(()=>{this.getChat()}, timeout)
    let lastRead = 0
    this.on('json', json => {
      for (const comment of json.comments.reverse()) {
        if (lastRead < comment.created) {
          lastRead = comment.created
          this.emit('message', {
            message: comment.message,
            name: comment.from_user.name,
            image: comment.from_user.image,
            json: json,
          })
        }
      }
    })
  }

  send(message) {
    request.post({
      uri: `${this.baseURL}/movies/${this.movieId}/comments`,
      headers: {
        'Accept': 'application/json',
        'X-Api-Version': '2.0',
        'Authorization': `Bearer ${this.token}`,
      },
      form: { comment: message },
    }, (err, res, data) => {
      if (err) {
        this.emit('error', err)
      } else if (res.statusCode === 200) {
        this.emit('error', data)
      }
    })
  }

  static get baseURL() {
    return 'https://apiv2.twitcasting.tv'
  }

  reacquire() {
    this.getUser()
  }
}

module.exports = TwitCasting
