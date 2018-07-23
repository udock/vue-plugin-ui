'use strict'
const _ = require('lodash')

module.exports = function (components, options) {
  options = options || {}
  let code = ''
  options.prefix = options.prefix || ''
  for (let key in components) {
    let opts = components[key]
    const id = opts.id || key
    if (opts.javascript !== false) {
      let params = _.extend(opts, {id: id === key ? id : undefined, style: undefined})
      let requireCode = `require('${options.prefix}${id}')`
      code += `[${requireCode}, ${JSON.stringify(params).replace(/"([^"]+?)\|require":("[^"]*?")/g, '"$1":require($2)')}], `
    } else if (!opts.implicit && opts.children) {
      let params = _.extend(opts, {id: id, javascript: undefined, style: undefined})
      code += `[{}, ${JSON.stringify(params)}], `
    }
  }
  return Promise.resolve(code.replace(/, $/, ''))
}
