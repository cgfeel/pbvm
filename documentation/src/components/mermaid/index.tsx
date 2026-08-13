import useBaseUrl from '@docusaurus/useBaseUrl'
import { useWatchSVGRender } from '@site/src/hooks/observers'
import { defaultTheme } from '@site/src/utils/i18n'
import { useMemo, useRef, type FC } from 'react'
import type { MermaidComProps } from './MeraidCom'
import MermaidCom from './MeraidCom'
import SVGRender from './SVGRender'

const Mermaid: FC<MermaidComProps> = ({ theme, value, ...props }) => {
  const mermaidRef = useRef<HTMLDivElement>(null)
  const url = useMemo(() => {
    // 不是 url
    if (!value.endsWith('.svg') || value.includes('\n')) return ''

    // 是 url 一定是没有后缀的
    return theme === defaultTheme ? value : value.replace(/\.svg$/, `-${theme}.svg`)
  }, [theme, theme, value])

  const source = useBaseUrl(url)
  useWatchSVGRender(mermaidRef)

  return (
    <div ref={mermaidRef}>
      {url === '' ? (
        <MermaidCom {...props} theme={theme} value={value} />
      ) : (
        <SVGRender {...props} src={source} />
      )}
    </div>
  )
}

export default Mermaid
