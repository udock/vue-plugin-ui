'use strict'
const _ = require('lodash')
const jsonic = require('jsonic')

function parseConfig (config, root) {
  if (!config) {
    return {}
  } else if (_.isString(config)) {
    // 配置项为字符串, 该字符串即为组件名，组件选项为空
    config = {
      component: config,
      options: {}
    }
  } else if (_.isArray(config)) {
    // 配置项为数组
    const component = config[0] // 第一个参数为组件名
    let options = config[1]// 第二个参数为组件选项
    let children = config[2] // 第三个参数为子组件配置
    if (config.length === 2 && _.isArray(options)) {
      // 仅有两个参数，且第二个为数组，修正参数赋值
      children = options
      options = undefined
    }
    if (_.isString(options)) {
      // 选项为字符串，作为 name 选项
      options = {
        name: options
      }
    }
    options = _.extend({}, options)
    options.children = children
    config = {
      component: component,
      options: options
    }
  }
  root = root || config
  const componentName = config.component.split('|', 1)[0]
  const inlineOptions = config.component.substr(componentName.length + 1)
  config.component = componentName
  const opts = config.options = _.defaults(config.options, inlineOptions.length > 0 ? jsonic(inlineOptions) : {})
  if (_.isArray(opts.children)) {
    // 有子项配置
    const children = opts.children
    opts.children = {}
    _.each(children, function (item) {
      if (item) {
        item = parseConfig(item, root)
        if (item && (item.options.multiple || root.options.children !== opts.children || !opts.children[`${item.component}#`])) {
          opts.children[item.component] = item.options
        }
        delete item.options.multiple
      }
    })
    if (_.keys(opts.children).length === 0) {
      delete opts.children
    }
  }
  if (opts.multiple) {
    // 处理组件组
    const result = root.options.children
    opts.javascript = false
    opts.style = false
    for (let key in opts.children) {
      delete result[key]
      result[`${componentName}#${key}`] = _.extend(opts.children[key], {id: key})
    }
    opts.children = _.keys(opts.children)
  }
  if (root === config) {
    for (let key in opts.children) {
      const item = opts.children[key]
      if (_.isArray(item.children) && item.children.length > 0) {
        const children = item.children
        item.children = {}
        _.map(children, (id) => {
          item.children[id] = root.options.children[`${key}#${id}`]
        })
      }
    }
  }
  return config
}

function sortByDependency (deps, dependency, options, parent, implicit, result) {
  result = result || {}
  parent = parent || {useJavascript: true, useStyle: true}
  for (let key of deps) {
    const ref = key.replace(/^[@$]/, '')
    const defaultOpts = options[ref] || {}
    const useJavascript = parent.useJavascript && defaultOpts.javascript !== false && /^(\$|\w)/.test(key)
    const useStyle = parent.useStyle && defaultOpts.style !== false && /^(@|\w)/.test(key)
    let subDeps = ref === parent.id ? false : dependency[ref]
    if (subDeps) {
      sortByDependency(subDeps, dependency, options, {
        id: ref,
        useJavascript: useJavascript,
        useStyle: useStyle
      }, true, result)
    }
    if (!result[ref]) {
      result[ref] = _.extend({
        implicit: implicit,
        javascript: false,
        style: false
      }, defaultOpts)
    }
    const opts = result[ref]
    if (!implicit) {
      // 非隐式引用，移除隐式标志
      delete opts.implicit
    }
    if (!subDeps || parent.id) {
      opts.javascript === false && useJavascript && delete opts.javascript
      opts.style === false && useStyle && delete opts.style
    }
  }
  return result
}

module.exports = function parseComponentConfig (config, options) {
  options = options || {}
  let defaults = options.defaults || []
  let dependency = options.dependency || {}
  defaults = parseConfig(['components', defaults]).options.children
  const components = parseConfig(['components', config]).options.children || {}
  // 补全相关组件的默认配置，以供 merge
  for (let key in defaults) {
    if (!components[key]) {
      const params = key.split('#')
      const name = params[0]
      const opts = components[name]
      if (params.length === 2 && opts) {
        // 子组件选项从父组件复制
        components[key] = opts
      }
    }
  }
  dependency = _.mapValues(dependency, (val, key) => {
    const last = _.last(val)
    if (!last || key !== last.replace(/^[$@]/, '')) {
      val.push(key)
    }
    return val
  })
  let result = sortByDependency(
    _.keys(components),
    dependency,
    _.merge({}, defaults, components)
  )
  return result
}
