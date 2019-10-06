import ExtendableError from 'es6-error'
import consola from 'consola'

export const NoBody = class extends ExtendableError {
  constructor (message = 'Error: no body tags found in html string') {
    super(message)
    consola.error(message, this)
  }
}

export const HtmlNotString = class extends ExtendableError {
  constructor (message = 'Error: html provided is not a string') {
    super(message)
    consola.error(message, this)
  }
}

export const AmpImgAttrs = class extends ExtendableError {
  constructor (l1, l2, message = '') {
    message = `Error: Additional amp-img attributes array not the legth of the loaded images array /n addlAttribsArr:${l1} != ${l2}`
    super(message)
    consola.error(message, this)
  }
}

export const NotObjError = class extends ExtendableError {
  constructor (message = 'Error: Additional amp-img attributes contains a non object') {
    super(message)
    consola.error(message, this)
  }
}
export default { NoBody, HtmlNotString, AmpImgAttrs, NotObjError }
