// import { useColorMode } from '@docusaurus/theme-common'
import useBaseUrl from '@docusaurus/useBaseUrl'
// import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { hashString } from '@site/src/scripts/utils'
import { useMemoFn } from '@site/src/utils/hooks'
import { useEffect, useState, type FC } from 'react'

function useColorMode(): 'light' | 'dark' {
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
function useLocale(): string {
  if (typeof document === 'undefined') return 'en'
  const lang = document.documentElement.lang
  return lang.startsWith('en') ? 'en' : lang
}

const StaticMermaid: FC<StaticMermaidProps> = ({ value, onError }: StaticMermaidProps) => {
  //   const { i18n } = useDocusaurusContext()
  //   const { colorMode } = useColorMode()
  const [svg, setSvg] = useState<string | null>(null)

  const errorHandle = useMemoFn(onError)
  //   const svgUrl = useMemo(() => {
  //   }, [colorMode, i18n, value])
  const hash = hashString(value.trim())
  const lang = useLocale()
  const colorMode = useColorMode()
  const theme = colorMode === 'dark' ? 'dark' : 'light'
  const svgUrl = useBaseUrl(`/mermaid/${lang}/${theme}/${hash}.svg`)

  useEffect(() => {
    let cancelled = false
    fetch(svgUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then((text) => {
        if (!cancelled) setSvg(text)
      })
      .catch((error: unknown) => {
        errorHandle.current?.(error)
      })

    return () => {
      cancelled = true
    }
  }, [svgUrl])

  return !svg ? null : (
    <div className="docusaurus-mermaid-container" dangerouslySetInnerHTML={{ __html: svg }} />
  )
}

export default StaticMermaid

interface StaticMermaidProps {
  value: string
  onError?: (err: unknown) => void
}
