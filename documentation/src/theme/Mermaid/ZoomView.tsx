import { CircleLoading } from '@site/src/components/loading'
import NoneCom from '@site/static/img/none.svg'
import type { MjolnirGestureEvent } from 'mjolnir.js'
import type { ReactNode } from 'react'
import {
  forwardRef,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'
import { tv } from 'tailwind-variants'
import { ContainerContext } from './ContainerProvider'

const MAX_SCALE = 5
const MIN_SCALE = 0.1
const ZOOM_STEP = 1.2

const styles = tv({
  slots: {
    canvas: [
      'block',
      'w-full',
      'origin-top-left',
      'opacity-0',
      'group-data-[state=loaded]:opacity-100',
      '[&_svg]:pointer-events-none',
      'select-none', // uc 手机浏览器专用
    ],
    loading: 'hidden group-data-[state=init]:block',
    none: 'hidden h-full justify-center items-center opacity-60 [&_svg]:h-24 group-data-[state=none]:flex',
    zoomViewport: [
      'h-40',
      'overflow-hidden',
      'p-4',
      'box-border',
      'relative',
      'group-data-[state=loaded]:h-full',
    ],
  },
  variants: {
    cursor: {
      dragging: {
        zoomViewport: 'cursor-grabbing',
      },
      zoomable: {
        zoomViewport: 'cursor-grab',
      },
    },
  },
  defaultVariants: {
    cursor: 'zoomable',
  },
})

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(val, min))
const { canvas, loading, none, zoomViewport } = styles()

const ZoomView = forwardRef<ZoomViewInstance, PropsWithChildren<ZoomViewProps>>(
  ({ cheat, children }, ref) => {
    const { position, scale, reset, setPosition, setScale } = useContext(ContainerContext)
    const [dragging, setDragging] = useState(false)

    const panBaseRef = useRef({ x: 0, y: 0 })
    const pinchBaseRef = useRef({ scale: 1, x: 0, y: 0 })
    const dragRef = useRef({ x: 0, y: 0 })
    const zoomRef = useRef<HTMLDivElement>(null)

    const style = useMemo(
      () => ({
        transform: `translate3D(${position.x}px, ${position.y}px, 0) scale(${scale})`,
      }),
      [position, scale]
    )

    useImperativeHandle(
      ref,
      () => ({
        onDblclick: () => reset(),
        onMouseDown: ({ clientX, clientY }) => {
          setDragging(true)
          document.body.classList.add('select-none')
          dragRef.current = { x: clientX - position.x, y: clientY - position.y }
        },
        onMouseMove: ({ clientX, clientY }) => {
          if (!dragging) return
          const { x, y } = dragRef.current
          setPosition({ x: clientX - x, y: clientY - y })
        },
        onMouseUp: () => {
          document.body.classList.remove('select-none')
          setDragging(false)
        },
        onPanEnd: () => {
          setDragging(false)
          document.body.classList.remove('select-none')
        },
        onPanMove: ({ deltaX, deltaY }) => {
          if (!dragging) return
          const { current } = panBaseRef
          setPosition({
            x: current.x + deltaX,
            y: current.y + deltaY,
          })
        },
        onPanStart: () => {
          setDragging(true)
          document.body.classList.add('select-none')
          panBaseRef.current = { x: position.x, y: position.y }
        },
        onPinchMove: (event) => {
          const rect = zoomRef.current?.getBoundingClientRect()
          if (!rect) return

          // pinch 中心在 viewport 中的坐标
          const cx = event.center.x - rect.left
          const cy = event.center.y - rect.top
          const { current } = pinchBaseRef

          // event.scale 累积缩放比，新 scale = 基准 * 累积
          const ns = clamp(current.scale * event.scale, MIN_SCALE, MAX_SCALE)
          const radio = ns / current.scale

          setPosition({
            x: cx - (cx - current.x) * radio,
            y: cy - (cy - current.y) * radio,
          })
          setScale(ns)
        },
        onPinchStart: () => {
          pinchBaseRef.current = { x: position.x, y: position.y, scale }
        },
        onWheel: (event) => {
          event.preventDefault()

          const rect = zoomRef.current?.getBoundingClientRect()
          if (!rect) return

          const mx = event.clientX - rect.left
          const my = event.clientY - rect.top
          const factor = event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP
          setScale((currentScale) => {
            const ns = clamp(currentScale * factor, MIN_SCALE, MAX_SCALE)
            const ratio = ns / currentScale
            setPosition((currentPosition) => ({
              x: mx - (mx - currentPosition.x) * ratio,
              y: my - (my - currentPosition.y) * ratio,
            }))
            return ns
          })
        },
      }),
      [dragging, position, scale, reset, setDragging, setPosition, setScale]
    )

    return (
      <div
        className={zoomViewport({
          cursor: (dragging ? 'dragging' : undefined) ?? (scale > 1 ? 'zoomable' : undefined),
        })}
        ref={zoomRef}
      >
        <div className={canvas()} style={style} data-role="canvas">
          {children}
        </div>
        <div className={loading()}>
          <CircleLoading />
        </div>
        <div className={none()}>
          <NoneCom />
        </div>
        {cheat}
      </div>
    )
  }
)

export { MAX_SCALE, MIN_SCALE, ZOOM_STEP }

export default ZoomView

export interface ZoomViewInstance {
  onDblclick: (event: MouseEvent) => void
  onMouseDown: (event: MouseEvent) => void
  onMouseMove: (event: MouseEvent) => void
  onMouseUp: (event: MouseEvent) => void
  onPanEnd: (event: MjolnirGestureEvent) => void
  onPanMove: (event: MjolnirGestureEvent) => void
  onPanStart: (event: MjolnirGestureEvent) => void
  onPinchMove: (event: MjolnirGestureEvent) => void
  onPinchStart: (event: MjolnirGestureEvent) => void
  onWheel: (event: WheelEvent) => void
}

interface ZoomViewProps {
  cheat?: ReactNode
}
