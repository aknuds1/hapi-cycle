import xs from 'xstream'
import Logger from '@arve.knudsen/js-logger'
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
