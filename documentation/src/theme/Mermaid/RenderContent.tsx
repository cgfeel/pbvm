import { useWatchContainer, useWatchSVGRender } from '@site/src/hooks/observers'
import { useCallback, useEffect, type FC, type PropsWithChildren, type RefObject } from 'react'

const createTimeout = (time = 5_000) =>
  new Promise<never>((_, reject) => {
    setTimeout(() => reject(), time)
  })

const waitForLayout = (elem: Element, signal?: AbortSignal) => {
  let observer: ResizeObserver | null = null
  let frame = 0

  return new Promise<boolean>((resolve) => {
    const checkit = () => {
      const rect = elem.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        frame = requestAnimationFrame(() => resolve(true))
        return true
      }
      return false
    }

    observer = new ResizeObserver(checkit)
    if (!checkit()) {
      observer.observe(elem)
    }

    signal?.addEventListener('abort', () => resolve(false), { once: true })
  }).finally(() => {
    if (frame) cancelAnimationFrame(frame)
    observer?.disconnect()

    frame = 0
    observer = null
  })
}

const RenderContent: FC<PropsWithChildren<RenderContentProps>> = ({ children, container }) => {
  const checkit = useCallback((em: Element) => {
    const wraper = container.current instanceof HTMLElement ? container.current : null
    const target = em instanceof HTMLElement && em.dataset.role === 'canvas' ? em : null

    const controller = new AbortController()
    return target !== null && (wraper?.dataset.state === 'init' || target.querySelector('svg'))
      ? Promise.race([waitForLayout(em, controller.signal), createTimeout()]).catch(() => {
          controller.abort()
          return false
        })
      : false
  }, [])

  const [state] = useWatchContainer(container, { checkit })
  useWatchSVGRender(container)

  useEffect(() => {
    const { current } = container
    if (current instanceof HTMLElement) {
      current.dataset.state = state
    }
  }, [state])

  return <>{children}</>
}

export default RenderContent

interface RenderContentProps {
  container: RefObject<Element | null>
}
