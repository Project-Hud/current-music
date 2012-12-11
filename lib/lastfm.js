var LastFmNode = require('lastfm').LastFmNode
  , apiData = require('../config')

module.exports = new LastFmNode(
{ api_key: apiData.key
, secret: apiData.secret
, useragent: apiData.useragent
})
