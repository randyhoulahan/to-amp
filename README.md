# to-amp
[![codebeat][codebeat-src]][codebeat-href]
[![David-DM][david-dm-src]][david-dm-href]
[![Standard JS][standard-js-src]][standard-js-href]
[![Circle CI][circle-ci-src]][circle-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![size][bundlephobia-src]][bundlephobia-href]

> Google AMP (Accelerated Mobile Pages) utility module.  Cherio engine utility to convert html to google compliant html.

## Setup

- Add `to-amp` dependency using yarn or npm to your project

```js
  yarn add to-amp
```

## Example

```js
  const ToAMP = require('to-amp')

  ToAMP.loadHtml(someHtmlString)  // loads html into cherio
  ToAMP.loadImages()              // seperate images for tansformation

  // easy access to image data, each array containing the image data in the order they appear in the html.  Set by ToAMP.loadImages()
  ToAMP.imageElms     // the dom element extracted
  ToAMP.imgAttribs    // the attributes of each image in object
  ToAMP.imgSrcs       // the srcs

  // do some processing such as get the width and hieghts of the images
  let addAttrbs = await getImageAttrs(ToAMP.imgAttribs) // your custom function to get height and widths if they do not exist

  ToAMP.convertImages(addAttrbs) // convert imgs to amp-img with height and widths

  return ToAMP.toHTML() // dump the html in the body

```

## API

### Options
```js

 const options =  {
    version,            // the amp version default: 'v0'
    componentVersion,   // the default amp component version default: 'v0'
    components,         // list of used components, scripts loaded default:[]
    imgLayout,          // deafult amp-image layout applied to converted <img> tags default:'responsive'
    svgLayout           // deafult amp-image layout applied to converted <img> tags with svg srcs default:'intrinsic'
  }

  ToAMP.setDefaultOpts(options)
```

### Properties
```js

  ToAMP.imageElms     // the dom element extracted                => after ToAMP.loadImages()
  ToAMP.imgAttribs    // the attributes of each image in object   => after ToAMP.loadImages()
  ToAMP.imgSrcs       // the srcs                                 => after ToAMP.loadImages()
  ToAMP.$             // cherio instance loaded with html         => after ToAMP.loadHtml(someHtmlString)

```
### Functions

```js

  static setDefaultOpts (options = {})

  static toHTML (html = false, addlAtts = false, scope = SCOPE)

  static loadHtml (html, setDefault = true, scope = SCOPE)

  static loadImages (setDefault = true, scope = SCOPE)

  static convertImages (addlAtts = false, scope = SCOPE)

  static imgToAmpImg ({ el, attribs }, addlAttribs)

  static htmlPageToAmpHtmlPage (html, components = AMP.components)
```

## Development

- Clone this repository
- Install dependencies using `yarn install` or `npm install`
- Do a PR

## TODO

- pass html-sanitize options

## License

[MIT License](./LICENSE)

Copyright (c) Randy J. Houlahan

<!-- Badges -->
[david-dm-src]: https://david-dm.org/randyhoulahan/to-amp/status.svg?style=flat-square
[david-dm-href]: https://david-dm.org/randyhoulahan/to-amp
[standard-js-src]: https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square
[standard-js-href]: https://standardjs.com
[circle-ci-src]: https://img.shields.io/circleci/project/github/randyhoulahan/to-amp.svg?style=flat-square
[circle-ci-href]: https://circleci.com/gh/randyhoulahan/to-amp
[codecov-src]: https://img.shields.io/codecov/c/github/randyhoulahan/to-amp.svg?style=flat-square
[codecov-href]: https://codecov.io/gh/randyhoulahan/to-amp
[npm-version-src]: https://img.shields.io/npm/dt/to-amp.svg?style=flat-square
[npm-version-href]: https://npmjs.com/package/to-amp
[npm-downloads-src]: https://img.shields.io/npm/v/to-amp/latest.svg?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/to-amp
[codebeat-src]: https://codebeat.co/badges/52e4e261-5b9d-4ab1-9871-701a4fcd161d
[codebeat-href]: https://codebeat.co/projects/github-com-randyhoulahan-to-amp-master
[bundlephobia-src]: https://badgen.net/bundlephobia/minzip/to-amp
[bundlephobia-href]: https://bundlephobia.com/result?p=to-amp@1.0.0-beta.5