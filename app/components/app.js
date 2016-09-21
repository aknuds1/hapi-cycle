import {h,} from '@cycle/dom'
import Logger from '@arve.knudsen/js-logger'
let logger = Logger.get('app')

if (process.env.IS_BROWSER) {
  logger.debug(`Is in browser`)
  require('./app.styl')
} else {
  logger.debug(`Not in browser`)
}

let app = (sources) => {
  return {
    DOM: sources.context.map(({}) => {
      return h('section.home', [
        h('h1', 'The homepage'),
        h('p', 'Welcome to our spectacular web page with nothing special here.'),
      ])
    }),
  }
}

module.exports = app
