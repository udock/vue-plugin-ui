'use strict'
const _ = require('lodash')

module.exports = function (content, map) {
  const opts = JSON.parse(this.query.split('=')[1])
  if (opts.ignoreThemeFileContent) {
    content = ''
  }
  const themeBasePath = opts.themeBasePath
  const pathHandler = _.defaults(opts.pathHandler ? require(opts.pathHandler) : {}, {
    prePath: (themeBasePath, filePath) => `@import '${filePath}';`,
    componentPath: (themeBasePath, componentName) => `@import '~@udock/vue-plugin-ui--${componentName}/src/scss/index.scss';`,
    postPath: (themeBasePath, filePath) => `@import '${filePath}';`
  })
  let preStyles = ''
  // 预加载样式
  opts.preStyles.forEach((item) => {
    preStyles += `${pathHandler.prePath(themeBasePath, item)}\n`
  })
  content = preStyles + content
  // 组件样式
  opts.components.forEach((item) => {
    content += `\n${pathHandler.componentPath(themeBasePath, item)}`
  })
  // 后加载样式
  opts.postStyles.forEach((item) => {
    content += `\n${pathHandler.postPath(themeBasePath, item)}`
  })
  return content
}
