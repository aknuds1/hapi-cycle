import xs from 'xstream'
import Cycle from '@cycle/xstream-run'
import {h, makeDOMDriver,} from '@cycle/dom'
import Logger from '@arve.knudsen/js-logger'

import app from './components/app'

Logger.useDefaults({
  formatter: (messages, context) => {
    messages.unshift(`${context.level.name} - [${context.name}]`)
  },
})
Logger.setHandler((messages, context) => {
  if (context.level === Logger.ERROR) {
    ajax.postJson('/api/logError', {
      error: messages[0],
    })
  }

  Logger.getDefaultHandler()(messages, context)
})

let logger = Logger.get('entry')

window.onerror = (message, url, line) => {
  // TODO: Show dialog?
  logger.error(`Uncaught exception, at ${url}:${line}:\n${message}`)
}

Cycle.run((sources) => {
  let sinks = app(sources)
  sinks.DOM = sinks.DOM.drop(1)
  return sinks
}, {
  DOM: makeDOMDriver('.app-container'),
  context: () => {return xs.of(window.appContext)},
  PreventDefault: (ev$) => {
    ev$.addListener({
      next: ev => ev.preventDefault(),
      error: () => {},
      complete: () => {},
    })
  },
})
