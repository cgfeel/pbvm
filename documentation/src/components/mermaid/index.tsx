import BrowserOnly from '@docusaurus/BrowserOnly'
import type * as MermaidType from 'mermaid'
import { useEffect, useId, useRef, type ComponentProps, type FC } from 'react'
import { tv } from 'tailwind-variants'

let mermaidPromise: Promise<typeof MermaidType> | null = null
const skeleton = tv({
  base: 'animate-pulse block rounded-lg bg-[var(--ifm-color-emphasis-200)] h-full',
})

const getMermaid = () => {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid')
  }
  return mermaidPromise
}

const MermaidContent: FC<Omit<MermaidProps, 'fallback'>> = ({ className, value, onError }) => {
  const containerRef = useRef<HTMLSpanElement>(null)
  const id = useId()

  useEffect(() => {
    const container = containerRef.current
    let cancelled = false

    getMermaid()
      .then(({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
        })
        return mermaid.render(`${id}-svg`, value)
      })
      .then(({ svg }) => {
        if (!cancelled && container) {
          container.innerHTML = svg
        }
      })
      .catch(
        onError ??
          (() => {
            // nothing
          })
      )
    return () => {
      cancelled = true
    }
  }, [id, value])

  return <span className={className} ref={containerRef} />
}

const Mermaid: FC<MermaidProps> = ({ fallback, ...props }) => (
  <BrowserOnly fallback={fallback ?? <span className={skeleton()} />}>
    {() => <MermaidContent {...props} />}
  </BrowserOnly>
)

export default Mermaid

export interface MermaidProps extends Pick<ComponentProps<typeof BrowserOnly>, 'fallback'> {
  value: string
  className?: string
  onError?: (error: unknown) => void
}
