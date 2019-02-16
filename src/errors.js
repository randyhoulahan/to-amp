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

export default { NoBody, HtmlNotString }
