export const buildEnvScript = async function () {
  var webgl = (function () {
    var canvas = document.createElement('canvas')
    var gl = canvas.getContext('webgl')
    var debug = gl ? gl.getExtension('WEBGL_debug_renderer_info') : null
    return !gl || !debug
      ? null
      : {
          renderer: gl.getParameter(debug.UNMASKED_RENDERER_WEBGL),
          vendor: gl.getParameter(debug.UNMASKED_VENDOR_WEBGL),
        }
  })()

  var uaData = await Promise.race([
    navigator.userAgentData && navigator.userAgentData.getHighEntropyValues
      ? navigator.userAgentData.getHighEntropyValues([
          'architecture',
          'bitness',
          'model',
          'platformVersion',
          'fullVersionList',
        ])
      : undefined,
    new Promise(function (resolve) {
      setTimeout(function () {
        resolve(undefined)
      }, 4000)
    }),
  ])

  return {
    userAgent: navigator.userAgent,
    userAgentData: uaData ?? null,
    platform: navigator.platform,
    language: navigator.language,
    languages: navigator.languages,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory ?? null,
    maxTouchPoints: navigator.maxTouchPoints,
    webdriver: navigator.webdriver,
    cookieEnabled: navigator.cookieEnabled,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: {
      colorDepth: screen.colorDepth,
      height: screen.height,
      pixelDepth: screen.pixelDepth,
      width: screen.width,
    },
    webgl: webgl,
  }
}
