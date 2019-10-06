const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  chainWebpack: config => {
    if (process.argv.indexOf('--report') !== -1)
      config.plugin('webpack-report').use(BundleAnalyzerPlugin, [ {} ])
  },

  configureWebpack: {
    // watch: true,
    externals: {
      cherio         : 'cherio',
      consola        : 'consola',
      'es6-error'    : 'es6-error',
      isobject       : 'isobject',
      'sanitize-html': 'sanitize-html'
    }
  },

  css: {
    extract: false
  }
}
