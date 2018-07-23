module.exports = {
  external: (id) => /^(vue|deepmerge|lodash\/.*)$/.test(id),
  globals: {
    'babel-runtime/core-js/get-iterator': 'core.getIterator',
    'babel-runtime/core-js/object/get-prototype-of': 'core.getPrototypeOf',
    'babel-runtime/helpers/typeof': 'BabelHelpers.typeof',
    'deepmerge': 'deepmerge',
    'lodash/isArray': '_.isArray',
    'lodash/isFunction': '_.isFunction',
    'lodash/set': '_.set',
    'vue': 'Vue'
  }
}
