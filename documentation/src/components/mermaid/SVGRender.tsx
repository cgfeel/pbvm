import { useMemoFn } from '@site/src/utils/hooks'
import { useEffect, useRef, type FC } from 'react'
import type { MermaidComProps } from './MeraidCom'

const generateSVG = (text: string) => {
  const element = new DOMParser().parseFromString(text, 'image/svg+xml')
  const root = element.documentElement
  return root.tagName.toLowerCase() === 'svg' && !element.querySelector('parsererror') ? root : null
}

const SVGRender: FC<SVGRenderProps> = ({ className, src, fallback, onError }) => {
  const renderRef = useRef<HTMLSpanElement>(null)
  const errorHandle = useMemoFn(onError)
  useEffect(() => {
    let cancelled = false
    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then((text) => {
        const svg = !cancelled ? generateSVG(text) : null
        if (svg) {
          renderRef.current?.replaceChildren(svg)
        }
      })
      .catch((error: unknown) => {
        errorHandle.current?.(error)
      })

    return () => {
      cancelled = true
    }
  }, [src])

  return (
    <span className={className} ref={renderRef}>
      {fallback}
    </span>
  )
}

export default SVGRender

export interface SVGRenderProps extends Pick<MermaidComProps, 'fallback'> {
  src: string
  className?: string
  onError?: (err: unknown) => void
}
