import Cycle from '@cycle/xstream-run'
import xs from 'xstream'
import {html, section, h1, p, head, title, body, div, script, makeHTMLDriver,} from '@cycle/dom'
import R from 'ramda'
import Boom from 'boom'
import serialize from 'serialize-javascript'
import Logger from '@arve.knudsen/js-logger'
let logger = Logger.get('server.rendering')

let getInitialRouterState = (request) => {
  let currentPath = request.path
  logger.debug(`Computing initial router state, path is '${currentPath}'`)
  let navItems = R.map((navItem) => {
    let path = !navItem.isExternal ? normalizePath(navItem.path) : navItem.path
    let isSelected = path === currentPath
    logger.debug(`Nav item '${navItem.text}' is selected: ${isSelected}, ${path}`)
    return R.merge(navItem, {
      path,
      isSelected,
    })
  }, [
    {path: '/', text: 'Calendar',},
    {path: '/about', text: 'About',},
  ])
  if (!R.any((navItem) => {return navItem.isSelected}, navItems)) {
    logger.debug(`Defaulting to root nav item being selected`)
    let navItem = R.find((navItem) => {return navItem.path === '/'}, navItems)
    navItem.isSelected = true
  }
  return immutable.fromJS({
    currentPath,
    isLoading: false,
    navItems,
  })
}

let wrapVTreeWithHtmlBoilerplate = ([vtree, context,]) => {
  return (
    html([
      head([
        title('Cycle Isomorphism Example'),
      ]),
      body([
        div('.app-container', [vtree,]),
        script(`window.appContext = ${serialize(context)};`),
        // script(clientBundle),
      ]),
    ])
  );
}

// let clientBundle = (() => {
//   let bundle$ = xs.createWithMemory()
//   let bundleString = ''
//   let bundleStream = browserify()
//     .transform('babelify')
//     .transform({global: true,}, 'uglifyify')
//     .add('./client.js')
//     .bundle()
//   bundleStream.on('data', function (data) {
//     bundleString += data;
//   })
//   bundleStream.on('end', function () {
//     bundle$.shamefullySendNext(bundleString);
//     console.log('Client bundle successfully compiled.');
//   });
//   return bundle$;
// })()

let main = (sources) => {
  let vtree = (
    section('.home', [
      h1('The homepage'),
      p('Welcome to our spectacular web page with nothing special here.'),
    ])
  )
  return {
    DOM: vtree,
  }
}

let renderIndex = (request, reply) => {
  let context = xs.of({})
  Cycle.run((sources) => {
    logger.debug(`Running`, sources)
    let vtree = main(sources).DOM
    let wrappedVTree = xs.combine(vtree, context)
      .map(wrapVTreeWithHtmlBoilerplate)
      .last()
    return {
      DOM: wrappedVTree,
    };
  }, {
    DOM: makeHTMLDriver((html) => {
      logger.debug(`Rendering`)
      let wrappedHtml = `<!doctype html>${html}`
      logger.debug(`Rendered HTML`, wrappedHtml)
    }),
    context: () => {return context},
    PreventDefault: () => {},
  })
}

module.exports = {
  renderIndex,
}
