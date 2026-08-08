import { useMemoFn } from '@site/src/utils/hooks'
import type { MjolnirEvent, MjolnirGestureEvent } from 'mjolnir.js'
import { EventManager, Pan, Pinch, Tap } from 'mjolnir.js'
import type { Dispatch, FC, PropsWithChildren, SetStateAction } from 'react'
import { createContext, useEffect, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'
import type { ZoomViewInstance } from './ZoomView'

const styles = tv({
  slots: {
    container: ['relative', 'rounded-lg', 'cursor-default', 'group', 'select-none'],
    fullscreenBackdrop: ['fixed', 'inset-0', 'z-[9998]', 'bg-white', 'dark:bg-black'],
  },
  variants: {
    fullscreen: {
      false: {
        container: 'relative my-4',
      },
      true: {
        container: ['fixed', 'inset-4', 'z-[9999]', 'my-0', 'flex', 'flex-col', 'overflow-hidden'],
      },
    },
  },
})

const { container, fullscreenBackdrop } = styles()
const WrapperContext = createContext<WrapperContextInstance>({
  fullscreen: '',
  setFullscreen: () => {
    //
  },
})

const Wrapper: FC<PropsWithChildren<WraperProps>> = ({
  children,
  className,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onPanEnd,
  onPanMove,
  onPanStart,
  onPinchMove,
  onPinchStart,
  onTap,
  onWheel,
}) => {
  const [fullscreen, setFullscreen] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const mouseDown = useMemoFn(onMouseDown)
  const mouseMove = useMemoFn(onMouseMove)
  const mouseUp = useMemoFn(onMouseUp)
  const panEnd = useMemoFn(onPanEnd)
  const panMove = useMemoFn(onPanMove)
  const panStart = useMemoFn(onPanStart)
  const pinchMove = useMemoFn(onPinchMove)
  const pinchStart = useMemoFn(onPinchStart)
  const tap = useMemoFn(onTap)
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
      const { target } = event
      if (
        event.button !== 0 ||
        (target instanceof HTMLElement && target.closest('[data-rule="toolbar"]'))
      )
        return

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
    const eventManager = new EventManager(containerRef.current, {
      recognizers: [
        new Pan(),
        new Pinch(),
        new Tap({ event: 'doubletap', pointers: 2 }),
        [Tap, { event: 'singletap' }, 'doubletap'],
      ],
    })

    function panendHandle(event: MjolnirGestureEvent) {
      panEnd.current?.(event)
    }

    function panmoveHandle(event: MjolnirGestureEvent) {
      panMove.current?.(event)
    }

    function panstartHandle(event: MjolnirGestureEvent) {
      panStart.current?.(event)
    }

    function pinchmoveHandle(event: MjolnirGestureEvent) {
      pinchMove.current?.(event)
    }

    function pinchstartHandle(event: MjolnirGestureEvent) {
      pinchStart.current?.(event)
    }

    function tapHandle(event: MjolnirEvent) {
      const { srcEvent, target } = event
      if (target instanceof Element && target.closest('[data-rule="toolbar"]')) return
      if ('pointerType' in srcEvent && srcEvent.pointerType === 'touch') tap.current?.(event)
    }

    eventManager.on('panend', panendHandle)
    eventManager.on('panmove', panmoveHandle)
    eventManager.on('panstart', panstartHandle)
    eventManager.on('pinchmove', pinchmoveHandle)
    eventManager.on('pinchstart', pinchstartHandle)
    eventManager.on('singletap', tapHandle)
    eventManager.on('doubletap', tapHandle)
    return () => {
      eventManager.off('panend', panendHandle)
      eventManager.off('panmove', panmoveHandle)
      eventManager.off('panstart', panstartHandle)
      eventManager.off('pinchmove', pinchmoveHandle)
      eventManager.off('pinchstart', pinchstartHandle)
      eventManager.off('singletap', tapHandle)
      eventManager.off('doubletap', tapHandle)
      eventManager.destroy()
    }
  }, [])

  useEffect(() => {
    function keyHandle(event: KeyboardEvent) {
      if (fullscreen !== '' && event.key === 'Escape') setFullscreen('')
    }

    document.addEventListener('keydown', keyHandle)
    return () => {
      document.removeEventListener('keydown', keyHandle)
    }
  }, [fullscreen, setFullscreen])

  return (
    <WrapperContext.Provider value={{ fullscreen, setFullscreen }}>
      {fullscreen !== '' && (
        <div className={fullscreenBackdrop()} onClick={() => setFullscreen('')} />
      )}
      <div
        className={container({ fullscreen: fullscreen !== '', className })}
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
    </WrapperContext.Provider>
  )
}

export { WrapperContext }

export default Wrapper

interface WrapperContextInstance {
  fullscreen: string
  setFullscreen: Dispatch<SetStateAction<string>>
}
interface WraperProps extends Partial<ZoomViewInstance> {
  className?: string
  onTap?: (event: MjolnirEvent) => void
}
