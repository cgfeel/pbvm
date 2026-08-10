import { useWatchContainer } from '@site/src/hooks/theme'
import { useCallback, useEffect, type FC, type PropsWithChildren, type RefObject } from 'react'

const createTimeout = (time = 5_000) =>
  new Promise<false>((resolve) => {
    setTimeout(() => resolve(false), time)
  })

const waitForLayout = (elem: Element) =>
  new Promise<true>((resolve) => {
    const checkit = (server: ResizeObserver) => {
      const rect = elem.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        server.disconnect()
        requestAnimationFrame(() => resolve(true))
        return true
      }
      return false
    }

    const observer = new ResizeObserver(() => checkit(observer))
    if (!checkit(observer)) {
      observer.observe(elem)
    }
  })

const RenderContent: FC<PropsWithChildren<RenderContentProps>> = ({ children, container }) => {
  const checkit = useCallback((em: Element) => {
    const wraper = container.current instanceof HTMLElement ? container.current : null
    const target = em instanceof HTMLElement && em.dataset.role === 'canvas' ? em : null

    return target !== null && (wraper?.dataset.state === 'init' || target.querySelector('svg'))
      ? Promise.race([waitForLayout(em), createTimeout()])
      : false
  }, [])

  const [state] = useWatchContainer(container, { checkit })
  useEffect(() => {
    const { current } = container
    if (current instanceof HTMLElement) current.dataset.state = state
  }, [state])

  return <>{children}</>
}

export default RenderContent

interface RenderContentProps {
  container: RefObject<Element | null>
}
