import { useMemoFn } from '@site/src/utils/hooks'
import { useEffect, useRef, type FC, type PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

const styles = tv({
  slots: {
    fullscreenBackdrop: 'fixed inset-0 z-[9998] bg-white dark:bg-black',
    fullscreenContainer:
      'fixed inset-4 z-[9999] rounded-lg my-0 flex flex-col overflow-hidden group',
  },
})

const { fullscreenBackdrop, fullscreenContainer } = styles()

const Wrapper: FC<PropsWithChildren<WraperProps>> = ({
  children,
  className,
  fullscreen,
  onClose,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const close = useMemoFn(onClose)
  const mouseDown = useMemoFn(onMouseDown)
  const mouseMove = useMemoFn(onMouseMove)
  const mouseUp = useMemoFn(onMouseUp)
  const wheel = useMemoFn(onWheel)

  useEffect(() => {
    function moveHandle(event: MouseEvent) {
      mouseMove.current?.(event)
    }

    function upHandle(event: MouseEvent) {
      mouseUp.current?.(event)
    }

    document.body.addEventListener('mousemove', moveHandle)
    document.body.addEventListener('mouseup', upHandle)
    return () => {
      document.body.removeEventListener('mousemove', moveHandle)
      document.body.removeEventListener('mouseup', upHandle)
    }
  }, [])

  useEffect(() => {
    function wheelHandle(event: WheelEvent) {
      wheel.current?.(event)
    }

    function downHandle(event: MouseEvent) {
      mouseDown.current?.(event)
    }

    const container = containerRef.current
    container?.addEventListener('wheel', wheelHandle, { passive: false })
    container?.addEventListener('mousedown', downHandle)
    return () => {
      container?.removeEventListener('wheel', wheelHandle)
      container?.removeEventListener('mousedown', downHandle)
    }
  }, [])

  useEffect(() => {
    function keyHandle(event: KeyboardEvent) {
      if (fullscreen && event.key === 'Escape') close.current?.()
    }

    document.addEventListener('keydown', keyHandle)
    return () => {
      document.removeEventListener('keydown', keyHandle)
    }
  }, [fullscreen])

  return (
    <>
      {fullscreen && <div className={fullscreenBackdrop()} onClick={onClose} />}
      <div
        className={fullscreen ? fullscreenContainer() : className}
        ref={containerRef}
        onMouseEnter={() => {
          if (!fullscreen) document.body.classList.add('overflow-hidden')
        }}
        onMouseLeave={() => {
          if (!fullscreen) document.body.classList.remove('overflow-hidden')
        }}
      >
        {children}
      </div>
    </>
  )
}

export default Wrapper

interface WraperProps {
  className?: string
  fullscreen?: boolean
  onClose?: () => void
  onMouseDown?: (event: MouseEvent) => void
  onMouseMove?: (event: MouseEvent) => void
  onMouseUp?: (event: MouseEvent) => void
  onWheel?: (event: WheelEvent) => void
}
