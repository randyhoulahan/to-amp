import cheerio      from 'cherio'
import isObject     from 'isobject'
import Errors       from './errors'


const SCOPE          = 'AMP'
const reqImgAttribs  = [ 'src', 'width', 'height', 'layout' ]
const cheerioOptions = { cwd: '', round: true, normalizeWhitespace: true, xmlMode: false }

export default class Images{
  static loadImages (html, setDefault = true, scope = SCOPE){
    Images[scope] = { elements: Images.html[scope].$('img') }
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


  static domClean (scope = SCOPE){
    const ampTags = ToAMP.components.concat('amp-img')

    ampTags.forEach(tag => {
      const tagElements = ToAMP.html[scope].$(tag)

      removeVDatas(tagElements)
    })
  }
}


function isAddlAttsArrValid (addlAttribsArr = []){
  console.log('Errors-----------------', Errors)
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

  for (const name in attribs){ if (reqImgAttribs.includes(name)) isValid++ }

  return isValid == 3
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

// remove existing js scripts and add amp scripts
function addAmpScripts (html, components = ToAMP.components){
  html = removeScripts(html)

  const scriptString = `<script async src="https://cdn.ampproject.org/${ToAMP.version}.js"></script> `

  // Add AMP script before </head>
  return html.replace('</head>', addComponentScripts(scriptString, components) + '\n</head>')
}

function addComponentScripts (scriptString, components = ToAMP.components){
  components.forEach(name => {
    scriptString += `<script custom-element="${name}" src="https://cdn.ampproject.org/${ToAMP.version}/${name}-${ToAMP.componentVersion}.js" async=""></script> `
  })
  return scriptString
}


function convert (html = false, addlAtts = false, scope = SCOPE){
  ToAMP.loadHtml(html, true, scope)
  ToAMP.loadImages(true, scope)
  ToAMP.convertImages(addlAtts, scope)
  ToAMP.domClean(scope)
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
      // 'iframe'
    ].concat(componentsOnPage)),
    allowedAttributes: {
      '*'      : [ 'style', 'class', 'layout', 'alt', 'width', 'height', 'aria*', 'data-*', 'role', 'on', 'hidden', 'id', 'side', 'tabindex', 'media', 'type', 'controls', 'loop' ],
      a        : [ 'href', 'name', 'target' ],
      img      : [ 'src', 'alt', 'width', 'height', 'layout', 'srcset' ],
      'amp-img': [ 'src', 'alt', 'width', 'height', 'layout', 'srcset' ],
      'amp-*'  : [ '*' ],
      // iframe: ['*'],
      svg      : [ '*' ],
      symbol   : [ '*' ],
      use      : [ '*' ],
      path     : [ '*' ]
    },
    // allowedAttributes: false,
    selfClosing                      : [ 'img', 'amp-img', 'br', 'hr', 'area', 'use' ],
    // URL schemes we permit
    allowedSchemes                   : [ 'http', 'https', 'ftp', 'mailto', 'data' ],
    allowedSchemesAppliedToAttributes: [ 'href', 'src', 'cite' ],
    allowProtocolRelative            : true,
    nonTextTags                      : [],
    transformTags                    : {
      iframe: iframeTransform
    }

  }
}

