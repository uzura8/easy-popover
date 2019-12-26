import '@babel/polyfill'

const EasyPopover = {
  options: {},
  optionsDef: {
    selector: '.js-popover',
    closeSelector: '.js-popover-close',
  },

  init: function(scopeElm = null, eventType = '', options = {}) {
    this.options = Object.assign(this.optionsDef, options)
    const selector = options.selector
    const closeSelector = options.closeSelector

    if (eventType) {
      this.handleEvent(scopeElm, selector, eventType, this.openAll)
    } else {
      this.openAll(scopeElm, selector)
    }
    this.handleEvent(scopeElm, closeSelector, 'click', this.close)
  },

  destroy: function(scopeElm = null, eventType = '', options = {}) {
    this.options = Object.assign(this.optionsDef, options)
    const selector = options.selector
    const closeSelector = options.closeSelector

    if (eventType) {
      this.handleEvent(scopeElm, selector, eventType, this.openAll, true)
    } else {
      this.openAll(scopeElm, selector)
    }
    this.handleEvent(scopeElm, closeSelector, 'click', this.close, true)
  },

  handleEvent: function(scopeElm, selector, type, func, isRemove = false) {
    const listener = {
      handleEvent: func,
      scopeElm: scopeElm,
      selector: selector,
      options: this.options,
    }
    if (isRemove) {
      document.removeEventListener(type, listener)
    } else {
      document.addEventListener(type, listener)
    }
  },

  openAll: function(scopeElm = null, selector = null) {
    if (!scopeElm && this.scopeElm != null) scopeElm = this.scopeElm
    if (!selector && this.selector != null) selector = this.selector
    if (!scopeElm) scopeElm = document
    if (!selector) selector = '.js-popover'

    const els = scopeElm.querySelectorAll(selector)
    if (els == null || !els.length) return

    for (let i = 0, n = els.length; i < n; i++) {
      this.open(els[i])
    }
  },

  open: function(el) {
    const activeClass = el.dataset.active_class != null ?
      el.dataset.active_class : 'is-active'
    const name = el.dataset.name != null ? el.dataset.name : 'popover'
    const strageName = name + '_isDeleted'
    const container = el.dataset.container != null ? el.dataset.container : ''
    const targetParams = el.dataset.targetParams != null ? el.dataset.targetParams.split(',') : []
    const targetParamName = el.dataset.targetParamName != null ? el.dataset.targetParamName : ''
    const expiredDate = el.dataset.expire != null ? el.dataset.expire : ''
    const style = el.dataset.style != null ? el.dataset.style : ''
    const arrowStyle = el.dataset.arrowStyle != null ? el.dataset.arrowStyle : ''
    const content = el.dataset.content != null ? el.dataset.content : ''

    const targetParamVal = EasyPopover.getUrlParam(targetParamName)
    let isTarget = false
    if (targetParams.length) {
      if (targetParamVal && targetParams.includes(targetParamVal)) {
        isTarget = true
      }
    } else {
      isTarget = true
    }

    const isDeleted = localStorage.getItem(strageName) == 1
    const isExpired = expiredDate != '' && EasyPopover.isExpired(expiredDate)
    const isDisp = !isDeleted && isTarget && !isExpired
    if (!isDisp) return

    if (container) {
      let containerEl = document.querySelector(container)
      if (containerEl != null) {
        if (containerEl.style.position != 'relative') {
          containerEl.style.position = 'relative'
        }
        containerEl.append(el)
      }
    }
    if (style) el.setAttribute('style', style)
    if (arrowStyle) {
      let arrowEl = el.querySelector('.popover-arrow')
      if (arrowEl != null) {
        arrowEl.setAttribute('style', arrowStyle)
      }
    }
    if (content) {
      let bodyEl = el.querySelector('.popover-body')
      if (bodyEl != null) {
        bodyEl.insertAdjacentHTML('beforeend', content)
      }
    }
    el.classList.add(activeClass)
  },

  close: function(event) {
    const $scope = this.scopeElm
    const $closeBtn = event.target

    const parentSelector = $closeBtn.dataset.parentSelector != null ?
      $closeBtn.dataset.parentSelector : '.js-popover'
    const $popover = EasyPopover.closest($closeBtn, parentSelector, $scope)
    if ($popover == null) return

    const activeClass = $popover.dataset.active_class != null ?
      $popover.dataset.active_class : 'is-active'
    const name = $popover.dataset.name != null ? $popover.dataset.name : 'popover'
    const strageName = name + '_isDeleted'

    $popover.classList.remove(activeClass);
    localStorage.setItem(strageName, 1);
  },

  getUrlParam: function(name, url) {
    if (!url) url = window.location.href
    name = name.replace(/[\[\]]/g, "\\$&")
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)")
    const results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
  },

  closest: function(node, searchSelector, scopeElm) {
    if (searchSelector == null || !searchSelector) return null
    if (scopeElm == null) scopeElm = document

    const isIE = node.matches == null
    while(node != null && node != scopeElm) {
      if (isIE) {
        if (node.msMatchesSelector(searchSelector)) return node
      } else {
        if (node.matches(searchSelector)) return node
      }
      node = node.parentElement || node.parentNode
    }
    return null
  },

  isExpired: function(dateStr) {
    const expiredTime = new Date(`${dateStr} 00:00`).getTime() + 1000 * 60 * 60 * 24
    return new Date().getTime() >= expiredTime
  }
}

export default EasyPopover
