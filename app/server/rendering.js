import Cycle from '@cycle/xstream-run'
import xs from 'xstream'
import {html, section, h1, p, head, title, body, div, script, makeHTMLDriver,} from '@cycle/dom'
import serialize from 'serialize-javascript'
import Logger from '@arve.knudsen/js-logger'
let logger = Logger.get('server.rendering')

let wrapVTreeWithHtmlBoilerplate = ([vtree, context,]) => {
  return html([
    head([
      title('Cycle Isomorphism Example'),
    ]),
    body([
      div('.app-container', [vtree,]),
      script(`window.appContext = ${serialize(context)};`),
      // script(clientBundle),
    ]),
  ])
}

let main = (sources) => {
  let vtree = sources.context.map(({}) => {
     return (
      section('.home', [
        h1('The homepage'),
        p('Welcome to our spectacular web page with nothing special here.'),
      ])
    )
  })
  return {
    DOM: vtree,
  }
}

let renderIndex = (request, reply) => {
  let context = xs.of({})
  Cycle.run((sources) => {
    let vtree = main(sources).DOM
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
