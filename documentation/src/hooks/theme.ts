import { useEffect, useState } from 'react'

export function useColorMode(): 'light' | 'dark' {
  const getValue = (): 'light' | 'dark' => {
    if (typeof document === 'undefined') return 'light'
    return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light'
  }

  const [mode, setMode] = useState<'light' | 'dark'>(getValue)

  useEffect(() => {
    const observer = new MutationObserver(() => setMode(getValue()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  return mode
}

/** Docusaurus 设置 <html lang="en-US"> 或 <html lang="zh-Hans"> */
export function useLocale(): string {
  if (typeof document === 'undefined') return 'en'
  const lang = document.documentElement.lang
  return lang.startsWith('en') ? 'en' : lang
}
