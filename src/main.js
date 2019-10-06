import cheerio      from 'cherio'
import consola      from 'consola'
import isObject     from 'isobject'
import Errors       from './errors'
import Head         from './head'
import sanitizeHtml from 'sanitize-html'

const SCOPE          = 'AMP'
const reqImgAttribs  = [ 'src', 'width', 'height', 'layout' ]
const cheerioOptions = {  cwd                : '',
                          round              : true,
                          normalizeWhitespace: true,
                          xmlMode            : false }

consola.withScope('ToAMP')

export default class ToAMP{
  static domToAMPHtml (html = false, addlAtts = false, scope = SCOPE){
    if (html) convert(html, addlAtts, scope)

    return ToAMP.html[scope].$('body').html()
  }

  static toHTML (scope = SCOPE){
    return ToAMP.html[scope].$('body').html()
  }

  static bodyToAMPHtml (html = false, addlAtts = false, scope = SCOPE){
    let body = extractBody(html)

    if (!body) throw new Errors.NoBody()

    body = ToAMP.domToAMPHtml(body, addlAtts, scope)

    return replaceBody(html, body)
  }

  static loadHtml (html, setDefault = true, scope = SCOPE){
    ToAMP.html[scope] = { $: cheerio.load(html, cheerioOptions) }

    if (setDefault) setParseingDefaults(scope)
  }

  static loadImages (setDefault = true, scope = SCOPE){
    ToAMP.html[scope].images = { elements: ToAMP.html[scope].$('img') }
    linkAttribs(scope)
    if (setDefault) setImageDefaults(scope)
  }

  static convertImages (addlAtts = false, scope = SCOPE){
    isAddlAttsArrValid(addlAtts)
    const imgElements = ToAMP.html[scope].images.elements
    const imgAttribs = ToAMP.html[scope].images.attribs

    for (let i = 0; i < imgElements.length; i++){
      const el = imgElements[i]
      const attribs = imgAttribs[i]
      const addlAttribs = addlAtts[i]

      ToAMP.imgToAmpImg({ el, attribs }, addlAttribs)
    }
  }

  static imgToAmpImg ({ el, attribs }, addlAttribs){
    const ampAttribs = Object.assign(attribs, addlAttribs || {})

    if (!isAmpAttrsValid(ampAttribs)) ToAMP.$(el).remove()

    const attrStr = buildAttrString(ampAttribs)

    ToAMP.$(`<amp-img ${attrStr}></amp-img>`).insertAfter(el)

    ToAMP.$(el).remove()
  }

  static htmlDocToAmpHtmlDoc (html, components = ToAMP.components, processBody = false){
    const componentsOnPage = components.filter(name => ~html.indexOf(name))

    if (~html.indexOf('amp-fx'))
      componentsOnPage.push('amp-fx-collection')

    // html = addAmpScripts(html, componentsOnPage)
    // html = addAmpStyles(html)


    html = html.replace('<html', '<html ⚡')
    html = ToAMP.clean(html)

    if (processBody){
      html = ToAMP.bodyToAMPHtml(html, false, 'FULL_PAGE')
      html = ToAMP.cleanBody(html, componentsOnPage, 'FULL_PAGE')
    }
    //
    html =  Head.toAMP(html, components)
    return html
  }

  static setDefaultOpts (options = {}){
    /*eslint-disable */
    ToAMP.version          = ToAMP.Head.version          = options.version          || 'v0'
    ToAMP.componentVersion = ToAMP.Head.componentVersion = options.componentVersion || '0.1'
    ToAMP.components       = ToAMP.Head.components       = options.components       || []
    /* eslint-enable */
    ToAMP.imgLayout        = options.imgLayout || 'responsive'
    ToAMP.svgLayout        = options.svgLayout || 'intrinsic'
    ToAMP.html             = {}
  }

  static clean (html){
    if (~html.indexOf('<!doctype html>') > -1)
      html = '<!doctype html>' + html
    // if (!html.match(/<meta charset="UTF-8">/i))
    //   html = html.replace('<head>', '<head>\n<meta charset="UTF-8"></meta>\n')

    return html
  }

  static cleanBody (html, componentsOnPage = []){
    let body = extractBody(html)

    if (!body) throw new Errors.NoBody()

    body = sanitizeHtml(body, bodySanitizeConfig(componentsOnPage))

    return replaceBody(html, body)
  }

  static domClean (scope = SCOPE){
    const ampTags = ToAMP.components.concat('amp-img')

    ampTags.forEach(tag => {
      const tagElements = ToAMP.html[scope].$(tag)

      removeVDatas(tagElements)
    })
  }

  static cleanHead (html, componentsOnPage = []){
    let body = extractBody(html)

    if (!body) throw new Errors.NoBody()

    body = sanitizeHtml(body, bodySanitizeConfig(componentsOnPage))

    return replaceBody(html, body)
  }

  static destroy (){
    ToAMP.html = {}
  }
}
ToAMP.Head = Head
ToAMP.setDefaultOpts()


function removeVDatas (tags){
  if (!tags.length) return
  const dataV = new RegExp(/(data-v-)\w+/g)

  for (let i = 0; i < tags.length; i++)
    for (const key in tags[i].attribs)
      if (dataV.test(key))
        delete (tags[i].attribs[key])
}

function isAddlAttsArrValid (addlAttribsArr = []){
  console.log('Errors================', Errors)
  process.exit(1)
  if (!addlAttribsArr) return

  if (addlAttribsArr.length != ToAMP.imgAttribs.length)
    throw new Errors.AmpImgAttrs(addlAttribsArr.length, ToAMP.imgAttribs.length)


  for (let i = 0; i < addlAttribsArr.length; i++)
    if (!isObject(addlAttribsArr[i]))
      Errors.NotObjError()
}


function isAmpAttrsValid (attribs){
  let isValid = 0

  for (const name in attribs) if (reqImgAttribs.includes(name)) isValid++

  return isValid == 3
}

function setParseingDefaults (scope = SCOPE){
  ToAMP.$ = ToAMP.html[scope].$
}

function setImageDefaults (scope = SCOPE){
  ToAMP.images = ToAMP.html[scope].images
  ToAMP.imageElms = ToAMP.html[scope].images.elements || []
  ToAMP.imgAttribs = ToAMP.html[scope].images.attribs || []
  ToAMP.imgSrcs = ToAMP.html[scope].images.srcs || []
}

function linkAttribs (scope = SCOPE){
  const imgElements = ToAMP.html[scope].images.elements
  const imgAttribs = []
  const imgSrcs = []

  for (let i = 0; i < imgElements.length; i++){
    const imgElm = imgElements[i]

    imgAttribs[i] = imgElm.attribs
    imgSrcs[i] = imgAttribs[i].src
  }

  ToAMP.html[scope].images.attribs = imgAttribs
  ToAMP.html[scope].images.srcs = imgSrcs
}

function buildAttrString (attribs){
  addImgLayout(attribs)

  let attrStr = ''

  for (const name in attribs)
    attrStr += `${name}="${attribs[name]}" `

  return attrStr
}

function getImgLayout (imageFormat){
  if (imageFormat === 'svg')
    return ToAMP.svgLayout
  return ToAMP.imgLayout
}

function addImgLayout (attribs){
  if (!attribs.layout){
    const format = ~attribs.src.indexOf('.svg') ? 'svg' : false

    attribs.layout = getImgLayout(format)
  }
}


function convert (html = false, addlAtts = false, scope = SCOPE){
  ToAMP.loadHtml(html, true, scope)
  ToAMP.loadImages(true, scope)
  ToAMP.convertImages(addlAtts, scope)
  ToAMP.domClean(scope)
}

function extractBody (html){
  if (!html) throw new Errors.HtmlNotString()
  return (html.match(/<body[^>]*>[\s\S]*<\/body>/gi) || [])[0]
}

function replaceBody (html, newBody){
  html = html.replace(/<body[^>]*>[\s\S]*<\/body>/gi, '')
  html = html.replace('</head>', `\n</head>\n <body>\n${newBody}\n</body>\n`)
  return html
}

function bodySanitizeConfig (componentsOnPage = []){
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
      'amp-fx',
      'svg',
      'defs',
      'symbol',
      'title',
      'path',
      'use',
      'linearGradient',
      'rect',
      'polygon',
      'amp-youtube'
    ].concat(componentsOnPage)),
    allowedAttributes: {
      '*'                        : [ 'style', 'class', 'layout', 'alt', 'width', 'height', 'aria*', 'data-*', 'role', 'on', 'hidden', 'id', 'side', 'tabindex', 'media', 'type', 'controls', 'loop' ],
      a                          : [ 'href', 'name', 'target', 'rel', 'aria*' ],
      img                        : [ 'src', 'alt', 'width', 'height', 'layout', 'srcset' ],
      'amp-img'                  : [ 'src', 'alt', 'width', 'height', 'layout', 'srcset', 'amp-fx' ],
      'amp-install-serviceworker': [ 'src', 'data-iframe-src', 'data-scope', 'layout', 'data-no-service-worker-fallback-url-match', 'data-no-service-worker-fallback-shell-url' ],
      'amp-*'                    : [ '*' ],
      svg                        : [ '*' ],
      symbol                     : [ '*' ],
      use                        : [ '*' ],
      path                       : [ '*' ]
    },
    // allowedAttributes: false,
    selfClosing                      : [ 'img', 'amp-img', 'br', 'hr', 'area', 'use' ],
    // URL schemes we permit
    allowedSchemes                   : [ 'http', 'https', 'ftp', 'mailto', 'data' ],
    allowedSchemesAppliedToAttributes: [ 'href', 'src', 'cite' ],
    allowProtocolRelative            : true,
    // nonTextTags: [],
    transformTags                    : {
      iframe: iframeTransform
    }

  }
}


function iframeTransform (tagName, attribs){
  if (attribs.src.includes('https://www.youtube.com/embed/'))
    return ampYoutube(attribs)
  return {}
}

function ampYoutube (attribs){
  if (!ToAMP.Head.componentsOnPage.includes('amp-youtube'))
    ToAMP.Head.componentsOnPage.push('amp-youtube')

  return {
    tagName: 'amp-youtube',
    attribs: {
      width         : '480',
      height        : '270',
      layout        : 'responsive',
      'data-videoid': attribs.src.replace('https://www.youtube.com/embed/', '')
    }
  }
}
