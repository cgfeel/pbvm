import type { RefObject } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useMemoFn } from '../utils/hooks'

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

export function useColorMode(): 'light' | 'dark' {
  const getValue = () => {
    if (typeof document === 'undefined') return 'light'
    const colorMode = document.documentElement.getAttribute('data-theme') ?? 'light'
    return colorMode === 'light' ? colorMode : 'dark'
  }

  const [mode, setMode] = useState<'light' | 'dark'>(getValue)

  useEffect(() => {
    const observer = new MutationObserver(() => setMode(getValue()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  return mode
}

/** Docusaurus 设置 <html lang="en-US"> 或 <html lang="zh-Hans"> */
export function useLocale() {
  if (typeof document === 'undefined') return 'en'
  const lang = document.documentElement.lang
  return lang.startsWith('en') ? 'en' : lang
}

export function useWatchContainer(targetRef: RefObject<Element | null>, opts?: ContainerOptions) {
  const { options, checkit } = opts ?? {}
  const [checkin, setCheckin] = useState<'init' | 'loaded' | 'none'>('init')

  const observerRef = useRef<MutationObserver>(null)
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

  const disconnectObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
  }, [])

  useEffect(() => {
    disconnectObserver()
    const { current } = targetRef
    if (!current) return

    checkHandle(current).then((loaded) => setCheckin(loaded ? 'loaded' : 'none'))
    const observer = new MutationObserver(() =>
      checkHandle(current).then((loaded) => setCheckin(loaded ? 'loaded' : 'none'))
    )

    observer.observe(current, { ...defaultObserverOps, ...options })
    observerRef.current = observer

    return () => disconnectObserver()
  }, [checkHandle])

  return [checkin] as const
}

interface ContainerOptions {
  options?: MutationObserverInit
  checkit?: (elem: Element) => boolean | PromiseLike<boolean>
}
