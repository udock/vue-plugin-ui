// https://github.com/ElemeFE/element/blob/dev/src/locale/index.js

import Vue from 'vue'
import deepmerge from 'deepmerge'
import Format from './format'

const format = Format(Vue)
let lang = {
  WORD: {
    OK: '确认',
    CANCEL: '取消',
    COMFIRM: '确认',
    BACK: '返回',
    NO_SELECT: '请选择',
    NO_MATCH: '无匹配数据',
    LOADING: '加载中'
  }
}
// let engLang = {
//   WORD: {
//     OK: 'OK',
//     CANCEL: 'cancel',
//     COMFIRM: 'comfirm',
//     BACK: 'Back'
//   }
// }
let merged = false
let i18nHandler = function () {
  const vuei18n = Object.getPrototypeOf(this || Vue).$t
  if (typeof vuei18n === 'function' && !!Vue.locale) {
    if (!merged) {
      // let lang = defaultLang
      // if (Vue.config.lang && Vue.config.lang === 'en-US') {
      //   lang = defaultLang
      // }
      merged = true
      Vue.locale(
        Vue.config.lang,
        deepmerge(lang, Vue.locale(Vue.config.lang) || {}, { clone: true })
      )
    }
    return vuei18n.apply(this, arguments)
  }
}

export const t = function (path, options) {
  let value = i18nHandler.apply(this, arguments)
  if (value !== null && value !== undefined) return value

  const array = path.split('.')
  let current = lang

  for (let i = 0, j = array.length; i < j; i++) {
    const property = array[i]
    value = current[property]
    if (i === j - 1) return format(value, options)
    if (!value) return ''
    current = value
  }
  return ''
}

export const use = function (l) {
  lang = l || lang
}

export const i18n = function (fn) {
  i18nHandler = fn || i18nHandler
}

export default { use, t, i18n }
