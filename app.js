
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , socketio = require('socket.io')
  , lastfm = require('./lib/lastfm')
  , config = require('./config')
  , trackCache = {}

var app = express()

app.configure(function(){
  app.set('port', process.env.PORT || 3110)
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')
  app.use(express.favicon())
  app.use(express.logger('dev'))
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(app.router)
  app.use(express.static(path.join(__dirname, 'public')))
})

app.configure('development', function(){
  app.use(express.errorHandler())
})

app.get('/', routes.index)

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'))
})
console.log(lastfm)
var io = socketio.listen(server)
  , trackStream = lastfm.stream(config.username)

trackStream.start()

trackStream.on('error', function(error) {
  console.log('Error: '  + error.message);
});

io.sockets.on('connection', function (socket) {
  if (trackCache.now) {
    socket.emit('nowPlaying', trackCache.now)
  }
  if (trackCache.last) {
    socket.emit('lastPlayed', trackCache.last)
  }
})

trackStream.on('lastPlayed', function(track) {
  console.log(track)
  trackCache.last = track
  io.sockets.emit('lastPlayed', track)
})

trackStream.on('nowPlaying', function(track) {
  trackCache.now = track
  io.sockets.emit('nowPlaying', track)
})

trackStream.on('stoppedPlaying', function(track) {
  trackCache.last = track
  io.sockets.emit('lastPlayed', track)
})