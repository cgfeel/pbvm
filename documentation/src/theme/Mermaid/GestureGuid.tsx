import useBaseUrl from '@docusaurus/useBaseUrl'
import type { DotLottie } from '@lottiefiles/dotlottie-react'
import { DotLottieReact, setWasmUrl } from '@lottiefiles/dotlottie-react'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { tv } from 'tailwind-variants'

setWasmUrl(
  process.env.NODE_ENV === 'production'
    ? '/pbvm/wasm/dotlottie-player.wasm'
    : '/wasm/dotlottie-player.wasm'
)

const styles = tv({
  base: [
    'absolute',
    'inset-0',
    'flex',
    'justify-center',
    'items-center',
    'pointer-events-none',
    'data-[guid=play]:light:bg-black/24',
  ],
})

const GestureGuid = forwardRef<GestureGuidInstance>((_, ref) => {
  const dotLottieRef = useRef<DotLottie>(null)
  const guidRef = useRef<HTMLDivElement>(null)
  const lottieUrl = useBaseUrl('/img/gesture.lottie')
  const countRef = useRef(-1)

  const stop = useCallback(() => {
    if (guidRef.current) guidRef.current.dataset.guid = 'stop'
    dotLottieRef.current?.stop()
    countRef.current = -1
  }, [])

  const handleComplete = useCallback(() => {
    countRef.current += 1
    if (countRef.current < 3) {
      dotLottieRef.current?.play()
    } else {
      stop()
    }
  }, [stop])

  const handleRef = useCallback((instance: DotLottie | null) => {
    dotLottieRef.current = instance
    if (instance) {
      instance.addEventListener('complete', handleComplete)
    }
  }, [])

  const play = useCallback(() => {
    const { current } = dotLottieRef
    if (current) {
      if (guidRef.current) guidRef.current.dataset.guid = 'play'
      countRef.current = 0

      current.setLoop(false)
      current.stop()
      current.play()
    }
  }, [])

  useEffect(() => {
    return () => {
      dotLottieRef.current?.removeEventListener('complete', handleComplete)
    }
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      toggle: () => {
        if (countRef.current > -1) {
          stop()
        } else {
          play()
        }
      },
      play,
      stop,
    }),
    [play, stop]
  )

  return (
    <div className={styles()} ref={guidRef} data-guid="stop">
      <DotLottieReact
        className="size-[max(8rem,20vmin)]"
        src={lottieUrl}
        dotLottieRefCallback={handleRef}
      />
    </div>
  )
})

export default GestureGuid

export interface GestureGuidInstance {
  play: () => void
  stop: () => void
  toggle: () => void
}
