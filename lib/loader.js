'use strict'

const loaderUtils = require('loader-utils')
module.exports.pitch = function (remainingRequest, precedingRequest, data) {
  let loaders = '!!'
  for (let i = 1, n = this.loaders.length; i < n; i++) {
    const loader = this.loaders[i]
    loaders += `${loader.path}${loader.query}!`
  }
  loaders += `${this.query.replace(/^\?loader=([^&]+?)&(.+)/, '$1?$2')}!`
  let request = loaderUtils.stringifyRequest(this, `${loaders}${this.resourcePath}`)
  return `require(${request});`
}
