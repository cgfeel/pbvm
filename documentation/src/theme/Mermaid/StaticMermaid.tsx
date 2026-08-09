import useBaseUrl from '@docusaurus/useBaseUrl'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import type { SVGRenderProps } from '@site/src/components/mermaid/SVGRender'
import SVGRender from '@site/src/components/mermaid/SVGRender'
import { useColorMode } from '@site/src/hooks/theme'
import { type FC } from 'react'
import { cn } from 'tailwind-variants'

function hashString(str: string) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i)
    hash = hash >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

const StaticMermaid: FC<SVGRenderProps> = ({ className, src, onError }) => {
  const hash = hashString(src.trim())
  const colorMode = useColorMode()

  const { i18n } = useDocusaurusContext()
  const prelang = i18n.currentLocale === i18n.defaultLocale ? '' : `/${i18n.currentLocale}`
  const svgUrl = useBaseUrl(`${prelang}/mermaid/${i18n.currentLocale}/${colorMode}/${hash}.svg`)

  return (
    <SVGRender
      className={cn('docusaurus-mermaid-container', className)}
      src={svgUrl}
      onError={onError}
    />
  )
}

export default StaticMermaid
