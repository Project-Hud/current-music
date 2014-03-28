var Widget = new require('hud-widget')
  , widget = new Widget()
  , socketio = require('socket.io')
  , lastfm = require('./lib/lastfm')
  , config = require('./config')
  , trackCache = {}

widget.get('/', function (req, res) {
  res.render('index', { title: 'Spotify' })
})

widget.on('started', function () {

  var io = socketio.listen(widget.server)
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

})
