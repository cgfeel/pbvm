import useBaseUrl from '@docusaurus/useBaseUrl'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { DotLottie } from '@lottiefiles/dotlottie-web'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { tv } from 'tailwind-variants'

DotLottie.setWasmUrl(
  process.env.NODE_ENV === 'production'
    ? '/pbvm/wasm/dotlottie-player.wasm'
    : '/wasm/dotlottie-player.wasm'
)

const styles = tv({
  base: ['absolute', 'inset-0', 'flex', 'justify-center', 'items-center', 'pointer-events-none'],
})

const GestureGuid = forwardRef<GestureGuidInstance>((_, ref) => {
  const countRef = useRef(0)
  const dotLottieRef = useRef<DotLottie>(null)
  const lottieUrl = useBaseUrl('/img/gesture.lottie')

  const handleComplete = useCallback(() => {
    countRef.current += 1
    if (countRef.current < 3) dotLottieRef.current?.play()
  }, [])

  const handleRef = useCallback((instance: DotLottie | null) => {
    dotLottieRef.current = instance
    if (instance) {
      instance.addEventListener('complete', handleComplete)
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
      play: () => {
        const { current } = dotLottieRef
        if (current) {
          countRef.current = 0
          current.setLoop(false)
          current.stop()
          current.play()
        }
      },
      stop: () => {
        dotLottieRef.current?.stop()
      },
    }),
    []
  )

  return (
    <div className={styles()}>
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
}
