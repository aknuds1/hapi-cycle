global.__IS_BROWSER__ = false

import Hapi from 'hapi'
import R from 'ramda'
import path from 'path'
import Boom from 'boom'
import pug from 'pug'
import Url from 'url'
import Promise from 'bluebird'
import Logger from '@arve.knudsen/js-logger'
let logger = Logger.get('server')
Logger.useDefaults({
  formatter: (messages, context) => {
    messages.unshift(`${context.level.name} - [${context.name}]`)
  },
})

import rendering from './server/rendering'

let server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: path.join(__dirname, '../public'),
      },
    },
  },
})
let port = parseInt(process.env.PORT || '8000')
server.connection({
  host: '0.0.0.0',
  port,
})

if (process.env.APP_URI == null) {
  process.env.APP_URI = `http://localhost:${port}`
}

let hapiPlugins = R.map((x) => {return require(x)}, ['inert', 'vision',])
server.register(hapiPlugins, (err) => {
  if (err != null) {
    throw err
  }

  let routeServerMethod = (options) => {
    if (typeof options.handler === 'function') {
      let originalHandler = options.handler
      options.handler = (request, reply) => {
        Promise.method(originalHandler)(request, reply)
          .catch((error) => {
            logger.error(`An unhandled error occurred:`, error.stack)
            reply(Boom.badImplementation())
          })
      }
    }
    server.route(R.merge({
      method: `GET`,
    }, options))
  }

  server.ext('onRequest', (request, reply) => {
    if (request.headers['x-forwarded-proto'] === 'http') {
      console.log(`Redirecting to HTTPS, using $APP_URI: ${process.env.APP_URI}`)
      return reply.redirect(Url.format({
        protocol: 'https',
        hostname: Url.parse(process.env.APP_URI).hostname,
        pathname: request.url.path,
        port: 443,
      }))
    } else {
      console.log(`Not redirecting to HTTPS`)
      reply.continue()
    }
  })

  server.views({
    engines: {pug,},
    path: __dirname + '/templates',
    compileOptions: {
      pretty: true,
    },
  })

  routeServerMethod({
    path: '/{path*}',
    handler: rendering.renderIndex,
  })
  server.route({
    method: ['GET',],
    path: '/bundle.js',
    handler: {
      file: path.join(__dirname, '../dist/bundle.js'),
    },
  })
  server.route({
    method: 'GET',
    path: '/assets/{param*}',
    handler: {
      directory: {
        path: '.',
        redirectToSlash: true,
        listing: true,
      },
    },
  })
  server.route({
    method: 'GET',
    path: '/robots.txt',
    handler: (request, reply) => {
      if ((process.env.NODE_ENV || '').toLowerCase() !== 'production') {
        reply(`User-agent: *\nDisallow: /`).header('Content-Type', 'text/plain')
      } else {
        reply()
      }
    },
  })

  // api.register(server)

  server.start((err) => {
    if (err != null) {
      logger.error(`Failed to start server: ${err}`)
      process.exit(1)
    } else {
      logger.info('Server running at', server.info.uri)
    }
  })
})
