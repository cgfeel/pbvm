import type { RefObject } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useMemoFn } from '../utils/hooks'
import { isForceDarkSVG, isSVGElement, preventDarkReader } from '../utils/preventMermaid'

const defaultObserverOps = { childList: true, subtree: true, attributes: true }
const raceAnyTrue = (items: Promise<boolean>[]) =>
  new Promise<boolean>((resolve, reject) => {
    let unresolvedCount = items.length
    if (items.length === 0) return resolve(false)
    items.forEach((item) =>
      item
        .then((flag) => {
          if (unresolvedCount === 0) return
          if (flag) {
            unresolvedCount = 0
            resolve(true)
          } else {
            unresolvedCount -= 1
            if (unresolvedCount === 0) resolve(false)
          }
        })
        .catch((err) => {
          unresolvedCount = 0
          reject(err instanceof Error ? err : new Error(String(err)))
        })
    )
  })

// 暂且只有 MutationObserver，如果后续增加 observer 改用传参的方式
const useWatchObserver = (handle: () => MutationObserver | null) => {
  const observerRef = useRef<MutationObserver>(null)
  const disconnectObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
  }, [])

  useEffect(() => {
    disconnectObserver()
    observerRef.current = handle?.() ?? null
    return () => disconnectObserver()
  }, [disconnectObserver, handle])

  return [observerRef, disconnectObserver] as const
}

export const handle = (elem: Element) => {
  isForceDarkSVG().then((dark) => {
    if (!dark) return
    if (isSVGElement(elem)) {
      preventDarkReader(elem)
    } else {
      elem.querySelectorAll('svg').forEach((item) => preventDarkReader(item))
    }
  })
}

export function useWatchContainer(targetRef: RefObject<Element | null>, opts?: ContainerOptions) {
  const { options, checkit } = opts ?? {}
  const [checkin, setCheckin] = useState<'init' | 'loaded' | 'none'>('init')

  const onCheckit = useMemoFn(checkit)
  const checkHandle = useCallback((root: Element): Promise<boolean> => {
    const { current } = onCheckit
    return Promise.resolve()
      .then(() => current?.(root) ?? null)
      .then(
        (res) =>
          (res === null ? false : undefined) ??
          (res ? true : raceAnyTrue(Array.from(root.children).map(checkHandle)))
      )
  }, [])

  const bootstrap = useCallback(() => {
    const { current } = targetRef

    if (!current) return null
    const handle = () =>
      checkHandle(current).then((loaded) => setCheckin(loaded ? 'loaded' : 'none'))

    handle()
    const observer = new MutationObserver(handle)

    observer.observe(current, { ...defaultObserverOps, ...options })
    return observer
  }, [options, checkHandle])

  useWatchObserver(bootstrap)
  return [checkin] as const
}

export function useWatchSVGRender(
  targetRef: RefObject<Element | null>,
  options?: MutationObserverInit
) {
  const bootstrap = useCallback(() => {
    const { current } = targetRef
    if (!current) return null

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          const { attributeName, target } = mutation
          if (target instanceof Element && isSVGElement(target)) {
            const engineStyle = target.getAttribute('style')?.includes('--darkreader-')
            const engineAttr = attributeName === 'fill' || attributeName === 'stroke'
            if (engineStyle || engineAttr) preventDarkReader(target)
          }
        } else {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof Element) handle(node)
          })
        }
      }
    })

    handle(current)
    observer.observe(current, {
      ...options,
      childList: true,
      subtree: true,
      attributes: true,
    })
    return observer
  }, [options])

  useWatchObserver(bootstrap)
}

interface ContainerOptions {
  options?: MutationObserverInit
  checkit?: (elem: Element) => boolean | PromiseLike<boolean>
}
