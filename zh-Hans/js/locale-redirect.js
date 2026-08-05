// 1. Auto-redirect based on browser language or saved preference
;(function () {
  var l = navigator.language || navigator.userLanguage
  var isZh = /^zh\b/i.test(l)
  var p = location.pathname
  var b = window.__BASE_URL__ || '/'
  var inZh = p.startsWith(b + 'zh-Hans')
  var saved = localStorage.getItem('pbvm-lang')

  // Follow saved preference
  if (saved) {
    if (saved === 'zh' && !inZh) {
      location.replace(b + 'zh-Hans/' + p.slice(b.length))
    } else if (saved === 'en' && inZh) {
      location.replace(b + p.slice((b + 'zh-Hans/').length))
    }
    return
  }

  // First visit: auto-detect from browser language
  if (isZh && !inZh) {
    location.replace(b + 'zh-Hans/' + p.slice(b.length))
  } else if (!isZh && inZh) {
    location.replace(b + p.slice((b + 'zh-Hans/').length))
  }
})()

// 2. Save manual language switch via event delegation
document.addEventListener('click', function (e) {
  var link = e.target.closest('.dropdown__link[lang]')
  if (link) {
    var lang = link.getAttribute('lang') === 'zh-Hans' ? 'zh' : 'en'
    localStorage.setItem('pbvm-lang', lang)
  }
})
