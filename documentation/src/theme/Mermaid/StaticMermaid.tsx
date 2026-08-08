import useBaseUrl from '@docusaurus/useBaseUrl'
import type { SVGRenderProps } from '@site/src/components/mermaid/SVGRender'
import SVGRender from '@site/src/components/mermaid/SVGRender'
import { useColorMode, useLocale } from '@site/src/hooks/theme'
import { hashString } from '@site/src/scripts/utils'
import { type FC } from 'react'
import { cn } from 'tailwind-variants'

const StaticMermaid: FC<SVGRenderProps> = ({ className, src, onError }) => {
  const hash = hashString(src.trim())
  const lang = useLocale()
  const colorMode = useColorMode()
  const theme = colorMode === 'dark' ? 'dark' : 'light'
  const svgUrl = useBaseUrl(`/mermaid/${lang}/${theme}/${hash}.svg`)

  return (
    <SVGRender
      className={cn('docusaurus-mermaid-container', className)}
      src={svgUrl}
      onError={onError}
    />
  )
}

export default StaticMermaid
