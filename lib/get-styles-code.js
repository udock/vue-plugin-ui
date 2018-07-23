'use strict'
const path = require('path')
const _ = require('lodash')

function normalize (filePath) {
  return filePath.replace(/\\/g, '/')
}

module.exports = function (components, options, config) {
  config = config || {}
  options.theme = normalize(options.theme)
  const themeBasePath = normalize(path.resolve(options.theme, '..'))
  let code = ''
  let preStyles = []
  // 预处理样式
  _.each(options['pre-styles'], function (file) {
    if (/^~/.test(file)) {
      preStyles.push(file)
    } else {
      code += `require('${file}'), `
    }
  })
  // 组件样式
  const styles = []
  // 主题基础样式
  for (let key in components) {
    const opts = components[key]
    const id = opts.id || key
    if (opts.style) {
      // 设置了自定义样式文件路径
      code += `require('${opts.style}'), `
    } else if (opts.style !== false) {
      if (config.isCssMode) {
        code += `require('${themeBasePath}/${id}.css'), `
      } else {
        styles.push(id)
      }
    }
  }
  // 后处理样式
  let postStyles = []
  let postStylesCode = ''
  _.each(options['post-styles'], function (file) {
    if (/^~/.test(file)) {
      postStyles.push(file)
    } else {
      postStylesCode += `require('${file}'), `
    }
  })
  if (!config.isCssMode) {
    const loader = config.loader || path.resolve(__dirname, 'ui-style-loader.js')
    const opts = {
      themeBasePath: themeBasePath,
      ignoreThemeFileContent: config.ignoreThemeFileContent,
      pathHandler: config.pathHandler,
      preStyles: preStyles,
      components: styles,
      postStyles: postStyles,
    }
    code += `require('${normalize(path.resolve(__dirname, 'loader.js'))}?loader=${normalize(loader)}&opts=${JSON.stringify(opts).replace(/\\/g, '\\\\')}!${options.theme}'), `
  }
  code += postStylesCode
  code = code.replace(/, $/, '')
  return Promise.resolve(code.replace(/, $/, ''))
}
