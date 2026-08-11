import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'

if (ExecutionEnvironment.canUseDOM) {
  window.addEventListener('appinstalled', () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'pwa_install', {
        event_category: 'pwa',
        event_label: 'app_installed',
      })
    }
  })
}
