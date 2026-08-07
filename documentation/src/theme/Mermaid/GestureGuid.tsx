import type { DotLottie } from '@lottiefiles/dotlottie-react'
import { DotLottieReact, setWasmUrl } from '@lottiefiles/dotlottie-react'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { tv } from 'tailwind-variants'

setWasmUrl('/wasm/dotlottie-player.wasm')
const styles = tv({
  base: ['absolute', 'inset-0', 'flex', 'justify-center', 'items-center', 'pointer-events-none'],
})

const GestureGuid = forwardRef<GestureGuidInstance>((_, ref) => {
  const countRef = useRef(0)
  const dotLottieRef = useRef<DotLottie>(null)

  useEffect(() => {
    const { current } = dotLottieRef
    function handleComplete() {
      countRef.current += 1
      if (countRef.current < 3) current?.play()
    }

    current?.addEventListener('complete', handleComplete)
    return () => {
      current?.removeEventListener('complete', handleComplete)
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
        src="/img/gesture.lottie"
        dotLottieRefCallback={(instance) => {
          dotLottieRef.current = instance
        }}
      />
    </div>
  )
})

export default GestureGuid

export interface GestureGuidInstance {
  play: () => void
  stop: () => void
}
