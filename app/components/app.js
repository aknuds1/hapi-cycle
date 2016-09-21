import {h,} from '@cycle/dom'
require('./app.styl')

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
