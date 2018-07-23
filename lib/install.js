'use strict'
const _ = require('lodash')
const parseComponentConfig = require('./component-config-parser')
const getStylesCode = require('./get-styles-code')
const getComponentsCode = require('./get-components-code')
const pify = require('pify')
const LIB_PREFIX = '@udock/vue-plugin-ui--'

module.exports = function (loader, options) {
  const loaderResolve = pify(loader.resolve)

  options = _.merge({
    theme: `${LIB_PREFIX}theme-default`,
    'pre-styles': [],
    'post-styles': [],
    components: []
  }, options)
  const langs = '{}'
  // 收集依赖配置
  function getDependencies (list, result) {
    result = result || {}
    const tasks = []
    for (let item of list) {
      if (!result[item]) {
        tasks.push(
          loaderResolve(loader.context, `${LIB_PREFIX}${item.split('|')[0]}/package.json`).then(
            (filePath) => {
              const pkg = require(filePath)
              const deps = result[item] = []
              if (pkg.peerDependencies) {
                for (let dep in pkg.peerDependencies) {
                  if (_.startsWith(dep, LIB_PREFIX)) {
                    deps.push(dep.substr(LIB_PREFIX.length))
                  }
                }
              }
              return deps
            },
            (err) => {
              console.log(`read package.json of ${LIB_PREFIX}${item} is failed: `, err)
              return []
            }
          )
        )
      }
    }
    if (tasks.length > 0) {
      return Promise.all(tasks).then((results) => {
        let list = []
        for (let item of results) {
          list = list.concat(item)
        }
        return getDependencies(list, result)
      })
    } else {
      return Promise.resolve(result)
    }
  }

  const componentlist = _.map(options.components, (item) => _.isArray(item) ? item[0] : item)
  return getDependencies(componentlist).then((dependency) => {
    options.components = parseComponentConfig(options.components, {dependency: dependency})
  }).then(() => {
    return Promise.all([
      getStylesCode(options.components, options),
      getComponentsCode(options.components, {prefix: LIB_PREFIX, loader: loader, debug: options.$debug})
    ])
  }).then(function (results) {
    const styles = results[0]
    const components = results[1]
    return {
      install: `framework.use(
        ${options.$plugin},
        {
          langs: ${langs},
          components: [ ${components} ]
        }),
        [ ${styles} ]`
    }
  })
}
