import Cycle from '@cycle/xstream-run'
import xs from 'xstream'
import {makeHTMLDriver, h,} from '@cycle/dom'
import serialize from 'serialize-javascript'
import Logger from '@arve.knudsen/js-logger'
let logger = Logger.get('server.rendering')

import app from '../components/app'

let wrapVTreeWithHtmlBoilerplate = ([vtree, context,]) => {
  return h('html', [
    h('head', [
      h('title', 'Cycle Isomorphism Example'),
    ]),
    h('body', [
      h('.app-container', [vtree,]),
      h('script', `window.appContext = ${serialize(context)};`),
      h('script', {attrs: {src: '/bundle.js',},}),
    ]),
  ])
}

let renderIndex = (request, reply) => {
  let context = xs.of({})
  Cycle.run((sources) => {
    let vtree = app(sources).DOM
    let wrappedVTree = xs.combine(vtree, context)
      .map(wrapVTreeWithHtmlBoilerplate)
      .last()
    return {
      DOM: wrappedVTree,
    };
  }, {
    DOM: makeHTMLDriver((html) => {
      let wrappedHtml = `<!doctype html>${html}`
      reply(html)
    }),
    context: () => {return context},
    PreventDefault: () => {},
  })
}

module.exports = {
  renderIndex,
}
