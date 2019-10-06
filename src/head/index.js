import Errors       from '../errors'
import sanitizeHtml from 'sanitize-html'

const SCOPE = 'DEFAULT'
const ampBoilerplate = '<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>'

export default class Head{
  static toAMP (html, components, scope = SCOPE){
    Head.oneStyle = ''

    Head.componentsOnPage = components.filter(name => ~html.indexOf(name))

    if (~html.indexOf('amp-fx'))
      Head.componentsOnPage.push('amp-fx-collection')

    html = cleanHead(html, scope)
    html = addAmpStyles(html)
    html = addAmpScripts(html, Head.componentsOnPage)

    return html
  }
}

Head.componentsOnPage = []
Head.oneStyle = ''

function cleanHead (html){
  html = html.replace('<head>', '<head>\n')
  let head = extractHead(html)

  if (!head) throw new Errors.NoBody()

  head = sanitizeHtml(head, sanitizeConfig())

  return replaceHead(html, head)
}

// remove existing js scripts and add amp scripts
function addAmpScripts (html, components = Head.components){
  const scriptString = `<script async src="https://cdn.ampproject.org/${Head.version}.js"></script> `

  // Add AMP script before </head>
  return html.replace('</head>', addComponentScripts(scriptString, components) + '\n</head>')
}

function addComponentScripts (scriptString, components = Head.components){
  components.forEach(name => {
    scriptString += `<script custom-element="${name}" src="https://cdn.ampproject.org/${Head.version}/${name}-${Head.componentVersion}.js" async=""></script> `
  })
  return scriptString
}

function addAmpStyles (html){
  Head.oneStyle = Head.oneStyle.replace(/!important/gi, '')
  html = html.replace('</head>', `\n<style amp-custom >${Head.oneStyle}</style>\n` + '\n</head>')

  return html.replace('</head>', ampBoilerplate + '\n</head>')
}

function extractHead (html){
  if (!html) throw new Errors.HtmlNotString()
  return (html.match(/<head[^>]*>[\s\S]*<\/head>/gi) || [])[0]
}

function replaceHead (html, newHead){
  html = html.replace(/<head[^>]*>[\s\S]*<\/head>/gi, '')
  html = html.replace('<body>', `${newHead}\n\n<body>\n`)
  return html
}

function sanitizeConfig (){
  return {
    allowedTags      : [ 'head', 'title', 'meta', 'link', 'base', 'style' ],
    allowedAttributes: {
      head : [],
      title: [],
      meta : [ 'name', 'content', 'charset', 'http-equiv' ],
      link : [ 'href', 'rel' ],
      base : [ 'href' ],
      style: [ 'amp-custom', 'amp-boilerplate' ]
    },
    selfClosing: [ ],
    exclusiveFilter
  }
}

function exclusiveFilter (frame){
  if (frame.tag === 'style')
    return styleFilter(frame)
  return false
}

function styleFilter (frame){
  let styleString = frame.text.replace(/\r?\n|\r/g, '')

  styleString = styleString.replace(/{\s*/g, '{')
  styleString = styleString.replace(/\s*}/g, '}')
  styleString = styleString.replace(/:\s*/g, ':')
  styleString = styleString.replace(/;\s*/g, ';')
  styleString = styleString.replace(/\s*;/g, ';')
  Head.oneStyle += styleString
  return true
}
