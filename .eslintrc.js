module.exports =  {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  // required to lint *.vue files
  plugins: [ 'vue' ],
  // add your custom rules here
  rules: {
    curly                 : [ 'error', 'multi', 'consistent' ],
    complexity            : [ 'error', 10 ],
    'max-statements'      : [ 'error', 15 ],
    'max-params'          : [ 'error', 3 ],
    'max-nested-callbacks': [ 'error', 3 ],
    'max-depth': [
      'error',
      4
    ],
    'wrap-iife': [
      'error',
      'any'
    ],
    'require-await'               : 'error',
    'prefer-promise-reject-errors': 'error',
    'no-return-await'             : 'error',
    'dot-location'                : [
      'error',
      'property'
    ],
    'no-undef'             : 'error',
    'no-delete-var'        : 'error',
    'handle-callback-err'  : 'error',
    'global-require'       : 'error',
    'array-bracket-spacing': [
      'error',
      'always',
      {
        singleValue: true
      }
    ],
    'comma-style': [
      'error',
      'last'
    ],
    'comma-spacing': [
      'error',
      {
        before: false,
        after : true
      }
    ],
    'comma-dangle': [
      'error',
      'never'
    ],
    camelcase: [
      'error',
      {
        properties: 'always'
      }
    ],
    'brace-style': [
      'error',
      'stroustrup',
      {
        allowSingleLine: true
      }
    ],
    'block-spacing'            : 'error',
    'computed-property-spacing': [
      'error',
      'never'
    ],
    'func-call-spacing': [
      'error',
      'never'
    ],
    'func-style': [
      'error',
      'declaration',
      {
        allowArrowFunctions: true
      }
    ],
    indent: [
      'error',
      2,
      { 'MemberExpression': 1, 'ObjectExpression': 'first' }
    ],
    'key-spacing': [
      'error',
      {
        align: {
          beforeColon: false,
          afterColon : true,
          on         : 'colon',
          mode       : 'strict'
        }
      }
    ],
    'no-multiple-empty-lines'      : 'error',
    'no-multi-assign'              : 'error',
    'no-whitespace-before-property': 'error',
    'no-trailing-spaces'           : [
      'error',
      {
        skipBlankLines: true
      }
    ],
    'no-nested-ternary'   : 'error',
    'object-curly-newline': [
      'error',
      {
        consistent: true
      }
    ],
    'object-curly-spacing': [
      'error',
      'always'
    ],
    quotes: [
      'error',
      'single'
    ],
    'quote-props': [
      'error',
      'as-needed'
    ],
    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev     : [
          'const',
          'let',
          'var'
        ],
        next: '*'
      },
      {
        blankLine: 'any',
        prev     : [
          'const',
          'let',
          'var'
        ],
        next: [
          'const',
          'let',
          'var'
        ]
      }
    ],
    'padded-blocks': [
      'error',
      'never'
    ],
    'space-in-parens': [
      'error',
      'never'
    ],
    'space-before-blocks': [
      'error',
      'never'
    ],
    'no-var'          : 'error',
    'arrow-body-style': [
      'error'
    ],
    'arrow-spacing'       : 'error',
    'no-duplicate-imports': [
      'error',
      {
        includeExports: true
      }
    ],
    'no-useless-computed-key': 'error',
    'no-useless-constructor' : 'error',
    'no-useless-rename'      : 'error',
    'object-shorthand'       : [
      'error',
      'always'
    ],
    'prefer-arrow-callback': [
      'error',
      {
        allowNamedFunctions: true
      }
    ],
    'prefer-const': 'error'
  }
}