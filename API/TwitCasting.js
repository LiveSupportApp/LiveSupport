const {EventEmitter} = require('events');
const request = require('request');
const OAuth = require('./TwitCasting/OAuth');

class TwitCasting extends EventEmitter {
  authorize(type) {
    let oauth = new OAuth(type);
    oauth.authorize(token => {
      this.token = token;
      this.getUser();
    });
  }

  getUser() {
    request.get({
      uri: 'https://apiv2.twitcasting.tv/verify_credentials',
      headers: {
        'Accept': 'application/json',
        'X-Api-Version': '2.0',
        'Authorization': 'Bearer '+this.token
      },
      json: true
    }, (err, res, data) => {
      if (err) {
        this.emit('error', err);
      } else if (res.statusCode != 200) {
        this.emit('error', data);
      } else if (!data.user.is_live) {
        this.emit('error', new Error('No live was found'));
      } else {
        this.userId = data.user.id;
        this.getLive();
      }
    });
  }

  getLive() {
    request.get({
      uri: `https://apiv2.twitcasting.tv/users/${this.userId}/current_live`,
      headers: {
        'Accept': 'application/json',
        'X-Api-Version': '2.0',
        'Authorization': 'Bearer '+this.token
      },
      json: true
    }, (err, res, data) => {
      if (err) {
        this.emit('error', err);
      } else if (res.statusCode != 200) {
        this.emit('error', data);
      } else {
        this.movieId = data.movie.id;
        this.emit('ready');
      }
    });
  }

  getChat() {
    request.get({
      uri: `https://apiv2.twitcasting.tv/movies/${this.movieId}/comments`,
      headers: {
        'Accept': 'application/json',
        'X-Api-Version': '2.0',
        'Authorization': 'Bearer '+this.token
      },
      form: {
        limit: 50,
      },
      json: true
    }, (err, res, data) => {
      if (err) {
        this.emit('error', err);
      } else if (res.statusCode != 200) {
        this.emit('error', data);
      } else {
        this.emit('json', data);
      }
    });
  }

  listen(timeout) {
    setInterval(()=>{this.getChat()}, timeout);
    let lastRead = 0;
    this.on('json', data => {
      for (let comment of data.comments.reverse()) {
        if (lastRead < comment.created) {
          lastRead = comment.created;
          this.emit('chat', {
            message: comment.message,
            name: comment.from_user.name,
            url: comment.from_user.image
          });
        }
      }
    });
  }

  send(message) {
    request.post({
      uri: `https://apiv2.twitcasting.tv/movies/${this.movieId}/comments`,
      headers: {
        'Accept': 'application/json',
        'X-Api-Version': '2.0',
        'Authorization': 'Bearer '+this.token
      },
      form: { comment: message }
    }, (err, res, data) => {
      if (err) {
        this.emit('error', err);
      } else if (res.statusCode != 200) {
        this.emit('error', data);
      }
    });
  }
}

module.exports = TwitCasting;
