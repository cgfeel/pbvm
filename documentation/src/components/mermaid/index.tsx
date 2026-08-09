import useBaseUrl from '@docusaurus/useBaseUrl'
import { useColorMode } from '@site/src/hooks/theme'
import { defaultTheme, themeMode } from '@site/src/utils/i18n'
import { useMemo, type FC } from 'react'
import type { MermaidComProps } from './MeraidCom'
import MermaidCom from './MeraidCom'
import SVGRender from './SVGRender'

const Mermaid: FC<Omit<MermaidComProps, 'theme'>> = ({ value, ...props }) => {
  const colorMode = useColorMode()
  const url = useMemo(() => {
    // 不是 url
    if (!value.endsWith('.svg') || value.includes('\n')) return ''

    // 是 url 一定是没有后缀的
    const currentTheme = themeMode[colorMode]
    return currentTheme === defaultTheme ? value : value.replace(/\.svg$/, `-${currentTheme}.svg`)
  }, [colorMode, value])

  const source = useBaseUrl(url)
  return url === '' ? (
    <MermaidCom {...props} theme={colorMode === 'dark' ? colorMode : 'default'} value={value} />
  ) : (
    <SVGRender {...props} src={source} />
  )
}

export default Mermaid
