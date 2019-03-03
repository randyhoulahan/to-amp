import cheerio from 'cherio'
import consola from 'consola'
import isObject from 'isobject'
import Errors from './errors'
import sanitizeHtml from 'sanitize-html'

const SCOPE = 'AMP'
const reqImgAttribs = ['src', 'width', 'height', 'layout']
const ampBoilerplate = `<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>`
const cheerioOptions = {
  cwd: '',
  round: true,
  normalizeWhitespace: true,
  xmlMode: false
}

consola.withScope('ToAMP')

export default class ToAMP {

  static domToAMPHtml (html = false, addlAtts = false, scope = SCOPE) {
    if (html) convert(html, addlAtts, scope)

    return ToAMP.html[scope].$('body').html()
  }

  static toHTML (scope = SCOPE) {
    return ToAMP.html[scope].$('body').html()
  }

  static bodyToAMPHtml (html = false, addlAtts = false, scope = SCOPE) {
    let body = extractBody(html)

    if (!body) throw new Errors.NoBody()

    body = ToAMP.domToAMPHtml(body, addlAtts, scope)

    return replaceBody(html, body)
  }

  static loadHtml (html, setDefault = true, scope = SCOPE) {
    ToAMP.html[scope] = { '$': cheerio.load(html, cheerioOptions) }

    if (setDefault) { setParseingDefaults(scope) }
  }

  static  loadImages (setDefault = true, scope = SCOPE) {
    ToAMP.html[scope].images = { elements: ToAMP.html[scope].$('img') }
    linkAttribs(scope)
    if (setDefault) { setImageDefaults(scope) }
  }

  static convertImages (addlAtts = false, scope = SCOPE) {
    isAddlAttsArrValid(addlAtts)
    let imgElements = ToAMP.html[scope].images.elements
    let imgAttribs = ToAMP.html[scope].images.attribs

    for (let i = 0; i < imgElements.length; i++) {
      let el = imgElements[i]
      let attribs = imgAttribs[i]
      let addlAttribs = addlAtts[i]
      ToAMP.imgToAmpImg({ el: el, attribs: attribs }, addlAttribs)
    }
  }



  static imgToAmpImg ({ el, attribs }, addlAttribs) {
    let ampAttribs = Object.assign(attribs, addlAttribs || {})

    if (!isAmpAttrsValid(ampAttribs)) { ToAMP.$(el).remove() }

    let attrStr = buildAttrString(ampAttribs)

    ToAMP.$(`<amp-img ${attrStr}></amp-img>`).insertAfter(el)

    ToAMP.$(el).remove()
  }

  static htmlDocToAmpHtmlDoc (html, components = ToAMP.components, processBody = false) {

    let componentsOnPage = components.filter(name => ~html.indexOf(name))

    if (~html.indexOf('amp-fx'))
      componentsOnPage.push('amp-fx-collection')

    html = addAmpStyles(html)

    html = addAmpScripts(html, componentsOnPage)
    html = html.replace('<html', '<html ⚡')
    html = ToAMP.clean(html)

    if (processBody) {
      html = ToAMP.bodyToAMPHtml(html, false, 'FULL_PAGE')
      html = ToAMP.cleanBody(html, componentsOnPage, 'FULL_PAGE')
    }

    return html
  }

  static setDefaultOpts (options = {}) {
    ToAMP.version = options.version || 'v0'
    ToAMP.componentVersion = options.componentVersion || '0.1'
    ToAMP.components = options.components || []
    ToAMP.imgLayout = options.imgLayout || 'responsive'
    ToAMP.svgLayout = options.svgLayout || 'intrinsic'
    ToAMP.html = {}
  }

  static clean (html) {

    if (~html.indexOf('<!doctype html>') > -1)
      html = '<!doctype html>' + html
    if (~html.indexOf('<meta charset="UTF-8">') > -1)
      html = html.replace('<head>', '<head>\n<meta charset="UTF-8">')

    return html
  }

  static cleanBody (html, componentsOnPage = [], scope = SCOPE) {
    let body = extractBody(html)

    if (!body) throw new Errors.NoBody()

    body =  sanitizeHtml(body, bodySanitizeConfig(componentsOnPage))

    return replaceBody(html, body)
  }

  static  domClean (scope = SCOPE) {

    const ampTags = ToAMP.components.concat('amp-img')
    ampTags.forEach(tag => {
      let tagElements = ToAMP.html[scope].$(tag)
      removeVDatas(tagElements)
    })
  }

  static cleanHead (html, componentsOnPage = []) {
    let body = extractBody(html)

    if (!body) throw new Errors.NoBody()

    body =  sanitizeHtml(body, bodySanitizeConfig(componentsOnPage))

    return replaceBody(html, body)
  }

  static destroy () {
    ToAMP.html = {}
  }
}

ToAMP.setDefaultOpts()


function removeVDatas (tags) {

  if (!tags.length) return
  let dataV = new RegExp(/(data-v-)\w+/g)

  for (let i = 0; i < tags.length; i++)
    for (const key in tags[i].attribs)
      if (dataV.test(key))
        delete (tags[i].attribs[key])
}

function isAddlAttsArrValid (addlAttribsArr = []) {
  if (!addlAttribsArr) return

  if (addlAttribsArr.length != ToAMP.imgAttribs.length)
    throw new Errors.AmpImgAttrs(addlAttribsArr.length, ToAMP.imgAttribs.length)


  for (let i = 0; i < addlAttribsArr.length; i++) {
    if (!isObject(addlAttribsArr[i]))
      Errors.NotObjError()
  }
}


function isAmpAttrsValid (attribs) {
  let isValid = 0

  for (let name in attribs) { if (reqImgAttribs.includes(name)) isValid++ }

  return isValid == 3
}

function setParseingDefaults (scope = SCOPE) {
  ToAMP.$ = ToAMP.html[scope].$
}

function setImageDefaults (scope = SCOPE) {
  ToAMP.images = ToAMP.html[scope].images
  ToAMP.imageElms = ToAMP.html[scope].images.elements || []
  ToAMP.imgAttribs = ToAMP.html[scope].images.attribs || []
  ToAMP.imgSrcs = ToAMP.html[scope].images.srcs || []
}

function linkAttribs (scope = SCOPE) {
  let imgElements = ToAMP.html[scope].images.elements
  let imgAttribs = []
  let imgSrcs = []

  for (let i = 0; i < imgElements.length; i++) {
    let imgElm = imgElements[i]
    imgAttribs[i] = imgElm.attribs
    imgSrcs[i] = imgAttribs[i].src
  }

  ToAMP.html[scope].images.attribs = imgAttribs
  ToAMP.html[scope].images.srcs = imgSrcs
}

function buildAttrString (attribs) {
  addImgLayout(attribs)

  let attrStr = ''
  for (let name in attribs)
    attrStr += `${name}="${attribs[name]}" `

  return attrStr
}

function getImgLayout (imageFormat) {
  if (imageFormat === 'svg')
    return ToAMP.svgLayout
  return ToAMP.imgLayout
}

function addImgLayout (attribs) {
  if (!attribs.layout) {
    let format = ~attribs.src.indexOf('.svg') ? 'svg' : false
    attribs.layout = getImgLayout(format)
  }
}

// remove existing js scripts and add amp scripts
function addAmpScripts (html, components = ToAMP.components) {
  html = removeScripts(html)

  let scriptString = `<script async src="https://cdn.ampproject.org/${ToAMP.version}.js"></script> `

  // Add AMP script before </head>
  return html.replace('</head>', addComponentScripts(scriptString, components) + '\n</head>')
}

function addComponentScripts (scriptString, components = ToAMP.components) {
  components.forEach(name => {
    scriptString += `<script custom-element="${name}" src="https://cdn.ampproject.org/${ToAMP.version}/${name}-${ToAMP.componentVersion}.js" async=""></script> `
  })
  return scriptString
}

function addAmpStyles (html)  {

  html = html.replace(/<style/gi, '<style amp-custom ')
  let styles = html.match(/<style amp-custom\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi)
  html = html.replace(/<style amp-custom\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

  let oneStyle = ''
  if (styles) {
    for (let i = 0; i < styles.length; i++) {
      styles[i] = styles[i].replace(/<style amp-custom .*>/gi, '')
      styles[i] = styles[i].replace(/<\/style>/gi, '')
      oneStyle += styles[i] + '\n'
    }
  }

  html = html.replace('</head>', `\n<style amp-custom >${oneStyle}</style>\n` + '\n</head>')
  html = html.replace(/!important/gi, '')
  return html.replace('</head>', ampBoilerplate + '\n</head>')
}

function convert (html = false, addlAtts = false, scope = SCOPE) {
  ToAMP.loadHtml(html, true, scope)
  ToAMP.loadImages(true, scope)
  ToAMP.convertImages(addlAtts, scope)
  ToAMP.domClean(scope)
}

function extractBody (html) {
  if (!html) throw new Errors.HtmlNotString()
  return (html.match(/<body[^>]*>[\s\S]*<\/body>/gi) || [])[0]
}

function replaceBody (html, newBody) {
  html = html.replace(/<body[^>]*>[\s\S]*<\/body>/gi, '')
  html = html.replace('</head>', `\n</head>\n <body>\n${newBody}\n</body>\n`)
  return html
}

function bodySanitizeConfig (componentsOnPage = []) {

  return {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'amp-menu-container', 'header', 'nuxt-link', 'amp-accordion', 'amp-img', 'amp-sidebar', 'h2', 'h1', 'section',
      'span',
      'header',
      'nav',
      'footer',
      'center',
      'b',
      'main',
      'figure',
      'amp-fx'
    ].concat(componentsOnPage)),
    allowedAttributes: {
      '*': ['style', 'class', 'layout', 'alt', 'width', 'height',  'aria*', 'data-*', 'role', 'on', 'hidden', 'id', 'side', 'tabindex', 'media', 'type', 'controls', 'loop'],
      a: [ 'href', 'name', 'target', 'alt' ],
      'amp-img': [ 'src', 'alt', 'width', 'height', 'layout' ]
    },
    // allowedAttributes: false,
    selfClosing: [ 'amp-img', 'br', 'hr', 'area' ],
    // URL schemes we permit
    allowedSchemes: [ 'http', 'https', 'ftp', 'mailto' ],
    allowedSchemesByTag: {},
    allowedSchemesAppliedToAttributes: [ 'href', 'src', 'cite' ],
    allowProtocolRelative: true,
    nonTextTags: []
  }
}

/// Remove every script tag from generated HTML except jsonld
function removeScripts (html) {
  let scripts = html.match(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi)
  let saved = ''
  for (let i = 0; i < scripts.length; i++)
    if (scripts[i].includes('application/ld+json'))
      saved += scripts[i].replace('async', '')

  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  // return html
  return html.replace('</head>', `${saved}\n</head>`)
}

