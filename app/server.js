import Hapi from 'hapi'
import R from 'ramda'
import path from 'path'
import Boom from 'boom'
import Url from 'url'
import Logger from '@arve.knudsen/js-logger'
let logger = Logger.get('server')
Logger.useDefaults({
  formatter: (messages, context) => {
    messages.unshift(`${context.level.name} - [${context.name}]`)
  },
})

import rendering from './server/rendering'

let server = new Hapi.Server({
})
let port = parseInt(process.env.PORT || '8000')
server.connection({
  host: '0.0.0.0',
  port,
})

server.register([require('inert'),], (err) => {
  if (err != null) {
    throw err
  }

  let routeServerMethod = (options) => {
    server.route(R.merge({
      method: `GET`,
    }, options))
  }

  routeServerMethod({
    path: '/{path*}',
    handler: rendering.renderIndex,
  })

  server.start((err) => {
    if (err != null) {
      logger.error(`Failed to start server: ${err}`)
      process.exit(1)
    } else {
      logger.info('Server running at', server.info.uri)
    }
  })
})
