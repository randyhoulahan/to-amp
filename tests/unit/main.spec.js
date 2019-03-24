import ToAMP from '../../src/main'
import fs from 'fs'
import path from 'path'
import Errors from '../../src/errors'
import amphtmlValidator from 'amphtml-validator'
const options = {
  version: 'v0',
  componentVersion: '0.1',
  components: ['amp-carousel', 'amp-sidebar', 'amp-accordion', 'amp-instagram', 'amp-social-share', 'amp-fx-collection'],
  pathFilter: false,
  hostFilter: false,
  // minify: true,
  calcImgDimensions: false
}

let ampHtml = ''
let htmlSource = ''
let validator = ''
beforeAll(() => {
  ToAMP.setDefaultOpts(options)
  htmlSource = fs.readFileSync(path.resolve(__dirname, 'test.html'), 'utf8')
  amphtmlValidator.getInstance().then((v) => { v = validator })
})
beforeEach(() => {
  ampHtml = ToAMP.htmlDocToAmpHtmlDoc(htmlSource, options.components, true)
})

describe('Set Options', () => {
  it('ToAMP.setDefaultOpts(options):', () => {
    expect(ToAMP.version).toBe('v0')
  })
})

describe('Sets static properties with image data', () => {
  test('ToAMP.loadImages', () => {

    expect(ToAMP.imgSrcs.length).toBe(12)
    expect(ToAMP.imageElms.length).toBe(12)
    expect(ToAMP.imgAttribs.length).toBe(12)
  })
})

describe('Converts img to amp-img', () => {
  it('converts', () => {
    expect(!!~ampHtml.indexOf('<amp-img')).toBeTruthy()
  })
})

describe('Removes img tags with no hieght and width', () => {
  it('no img tags', () => {
    expect(!!~ampHtml.indexOf('<img')).toBeFalsy()
  })
})

describe('Containes: AMP ⚡, amp-custom, amp-boilerpate, amp script', () => {
  it('has amp', () => {
    expect(!!~ampHtml.indexOf(`https://cdn.ampproject.org/${options.version}.js`)).toBeTruthy()
    expect(!!~ampHtml.indexOf('<html ⚡')).toBeTruthy()
    expect(!!~ampHtml.indexOf('<style amp-custom')).toBeTruthy()
    expect(!!~ampHtml.indexOf('<style amp-boilerplate')).toBeTruthy()
  })
})

describe('Throws Errors', () => {
  it('it throws HtmlNotString Error', () => {
    expect(() => {
      ToAMP.bodyToAMPHtml()
    }).toThrow(new Errors.HtmlNotString())
  })

  it('it throws NoBody Error', () => {
    expect(() => {
      ToAMP.bodyToAMPHtml('asdasdaads')
    }).toThrow(new Errors.NoBody())
  })
})

describe('AMP Validator', () => {
  it('is valid', () => {
    amphtmlValidator.getInstance().then((v) => {
      let result = v.validateString(ampHtml)

      // for (let index = result.errors.length - 1; index >= 0; index--) {
      //   let error = result.errors[index]
      //   var msg = 'line ' + error.line + ', col ' + error.col + ': ' + error.message
      //   console.log('Warn', msg)
      // }
      expect((result.status === 'PASS')).toBeTruthy()
    })


  })
})

describe('AMP Validator', () => {
  it('is NOT valid', () => {
    amphtmlValidator.getInstance().then(function (validator) {
      let result = amphtmlValidator.validateString(htmlSource)

      expect((result.status === 'PASS')).toBeFalse()
    })
  })
})


describe('Preserve JSONLD', () => {
  it('is preserves', () => {
    expect(!!~ampHtml.indexOf('application/ld+json')).toBeTruthy()
  })
})
