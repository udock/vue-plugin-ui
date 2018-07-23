import isArray from 'lodash/isArray'
import isFunction from 'lodash/isFunction'
import set from 'lodash/set'

import mixins from './mixins/index'
import * as utils from './utils/index'
import locale from './locale/index'

const install = function (Vue, options) {
  if (install.installed) return

  if (Vue.i18n) {
    locale.i18n(function (path, opts) {
      // mergeLocaleMessage,setLocaleMessage
      const value = Vue.i18n.t(path, opts)
      if (value !== null && value !== undefined) return value
      return ''
    })
  }
  let resolvedOptions = {
    langs: options.langs,
    components: {}
  }
  options.components.forEach((component) => {
    if (!isArray(component)) {
      component = [component]
    }
    const opts = component[1] || {}
    component = component[0]
    component = component && component.hasOwnProperty('default') ? component['default'] : component
    if (!opts.implicit && isFunction(component.install)) {
      // 作为插件安装
      Vue.use(component, opts)
    }
    if (opts.id) {
      resolvedOptions.components[opts.id] = opts
    }
  })
  set(Vue, 'udock.plugins.ui.opts', resolvedOptions)
}

export default {
  install
}

export {
  mixins,
  utils
}
