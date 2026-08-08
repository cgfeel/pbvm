import useBaseUrl from '@docusaurus/useBaseUrl'
import { useColorMode } from '@site/src/hooks/theme'
import { useMemo, type FC } from 'react'
import type { MermaidComProps } from './MeraidCom'
import MermaidCom from './MeraidCom'
import SVGRender from './SVGRender'

const Mermaid: FC<Omit<MermaidComProps, 'theme'>> = ({ value, ...props }) => {
  const colorMode = useColorMode()
  const url = useMemo(() => {
    if (!value.endsWith('.svg') || value.includes('\n')) return ''
    if (colorMode === 'dark') {
      return value.endsWith('-dark.svg') ? value : value.replace(/\.svg$/, '-dark.svg')
    }
    return value.endsWith('-dark.svg') ? value.replace(/-dark\.svg$/, '.svg') : value
  }, [colorMode, value])

  return url === '' ? (
    <MermaidCom {...props} theme={colorMode === 'dark' ? colorMode : 'default'} value={value} />
  ) : (
    <SVGRender {...props} src={useBaseUrl(url)} />
  )
}

export default Mermaid
