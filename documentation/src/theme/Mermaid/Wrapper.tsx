import { useMemoFn } from '@site/src/utils/hooks'
import type { MjolnirEvent, MjolnirGestureEvent } from 'mjolnir.js'
import { EventManager, Pan, Pinch, Tap } from 'mjolnir.js'
import type { Dispatch, FC, PropsWithChildren, SetStateAction } from 'react'
import { createContext, useCallback, useEffect, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'
import RenderContent from './RenderContent'
import type { ZoomViewInstance } from './ZoomView'

const styles = tv({
  slots: {
    container: [
      'relative',
      'rounded-lg',
      'cursor-default',
      'group',
      'select-none',
      'pointer-events-none',
      'data-[state=loaded]:pointer-events-auto',
    ],
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

const inElementRange = (elem: unknown) =>
  elem instanceof Element && !elem.closest('[data-rule="toolbar"]')

// eslint-disable-next-line @typescript-eslint/no-explicit-any 必须用 any 推导
function debounce<T extends (...args: any[]) => any>(func: T, delay = 500) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function doit(this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
      timer = null
    }, delay)
  }
}

const Wrapper: FC<PropsWithChildren<WraperProps>> = ({
  children,
  className,
  onDblclick,
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

  const dblclick = useMemoFn(onDblclick)
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

  const operationHandle = useCallback((action: 'moving' | 'normal' | 'zooming') => {
    const { current } = containerRef
    if (current) current.dataset.operation = action
  }, [])

  const delayOperat = useCallback(debounce(operationHandle, 300), [operationHandle])

  useEffect(() => {
    function moveHandle(event: MouseEvent) {
      mouseMove.current?.(event)
    }

    function upHandle(event: MouseEvent) {
      operationHandle('normal')
      mouseUp.current?.(event)
    }

    document.body.addEventListener('mousemove', moveHandle)
    document.body.addEventListener('mouseup', upHandle)
    return () => {
      document.body.removeEventListener('mousemove', moveHandle)
      document.body.removeEventListener('mouseup', upHandle)
    }
  }, [operationHandle])

  useEffect(() => {
    function dblclickHandle(event: MouseEvent) {
      event.preventDefault()
      dblclick.current?.(event)
    }

    function wheelHandle(event: WheelEvent) {
      const { target } = event
      if (inElementRange(target)) {
        operationHandle('zooming')
        delayOperat('normal')
        wheel.current?.(event)
      }
    }

    function downHandle(event: MouseEvent) {
      const { target } = event
      if (event.button === 0 && inElementRange(target)) {
        operationHandle('moving')
        mouseDown.current?.(event)
      }
    }

    function pointerDownHandle(event: PointerEvent) {
      if (event.button === 2 || event.button === 1) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    function contextmenuHandle(event: PointerEvent) {
      event.preventDefault()
    }

    const container = containerRef.current
    container?.addEventListener('wheel', wheelHandle, { passive: false })
    container?.addEventListener('mousedown', downHandle)
    container?.addEventListener('dblclick', dblclickHandle)
    container?.addEventListener('pointerdown', pointerDownHandle)
    container?.addEventListener('contextmenu', contextmenuHandle)
    return () => {
      container?.removeEventListener('wheel', wheelHandle)
      container?.removeEventListener('mousedown', downHandle)
      container?.removeEventListener('dblclick', dblclickHandle)
      container?.removeEventListener('pointerdown', pointerDownHandle)
      container?.removeEventListener('contextmenu', contextmenuHandle)
    }
  }, [delayOperat, operationHandle])

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
      operationHandle('normal')
      panEnd.current?.(event)
    }

    function panmoveHandle(event: MjolnirGestureEvent) {
      panMove.current?.(event)
    }

    function panstartHandle(event: MjolnirGestureEvent) {
      operationHandle('moving')
      panStart.current?.(event)
    }

    function pinchmoveHandle(event: MjolnirGestureEvent) {
      operationHandle('zooming')
      delayOperat('normal')
      pinchMove.current?.(event)
    }

    function pinchstartHandle(event: MjolnirGestureEvent) {
      pinchStart.current?.(event)
    }

    function tapHandle(event: MjolnirEvent) {
      const { srcEvent, target } = event
      if ('pointerType' in srcEvent && srcEvent.pointerType === 'touch' && inElementRange(target))
        tap.current?.(event)
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
  }, [delayOperat, operationHandle])

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
      <RenderContent container={containerRef}>
        <div
          className={container({ fullscreen: fullscreen !== '', className })}
          data-state="init"
          data-operation="normal"
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
      </RenderContent>
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
