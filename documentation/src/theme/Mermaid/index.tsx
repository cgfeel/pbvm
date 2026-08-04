import type { WrapperProps } from '@docusaurus/types'
import Mermaid from '@theme-original/Mermaid'
import type MermaidType from '@theme/Mermaid'
import type { CSSProperties } from 'react'
import { useRef, useState, type ReactNode } from 'react'
import { tv } from 'tailwind-variants'
import Wrapper from './Wrapper'

const MAX_SCALE = 5
const MIN_SCALE = 0.1
const ZOOM_STEP = 1.2

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(val, min))

const styles = tv({
  slots: {
    btn: 'bg-transparent border-0 cursor-pointer rounded text-sm text-[var(--ifm-color-emphasis-700)] leading-none enabled:hover:bg-[var(--ifm-color-emphasis-200)] disabled:opacity-30 disabled:cursor-default',
    canvas:
      'block w-full origin-top-left translate-x-[var(--x)] translate-y-[var(--y)] scale-[var(--scale)]',
    container: 'relative rounded-lg my-4 cursor-default group select-none',
    point: 'text-xs text-[var(--ifm-color-emphasis-600)] min-w-[38px] text-center',
    toolbar:
      'absolute bottom-2 right-2 flex items-center gap-0.5 bg-[var(--ifm-background-surface-color)] rounded-[6px] opacity-0 transition-opacity duration-200 group-hover:opacity-100',
    zoomViewport: 'h-full overflow-hidden p-4 box-border',
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
  compoundSlots: [
    {
      slots: ['container', 'toolbar'],
      class: 'border border-[var(--ifm-color-emphasis-300)]',
    },
    {
      slots: ['btn', 'toolbar'],
      class: 'py-0.5 px-1.5',
    },
  ],
})

const { btn, canvas, container, point, toolbar, zoomViewport } = styles()

export default function MermaidWrapper(props: Props): ReactNode {
  const dragRef = useRef({ x: 0, y: 0 })
  const zoomRef = useRef<HTMLDivElement>(null)

  const [dragging, setDragging] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)

  const style: CSSVar = { '--x': `${position.x}px`, '--y': `${position.y}px`, '--scale': scale }
  const pct = Math.round(scale * 100)

  const reset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const zoomIn = () => setScale((current) => clamp(current * ZOOM_STEP, MIN_SCALE, MAX_SCALE))
  const zoomOut = () => setScale((current) => clamp(current / ZOOM_STEP, MIN_SCALE, MAX_SCALE))

  return (
    <Wrapper
      className={container()}
      fullscreen={fullscreen}
      onClose={() => setFullscreen(false)}
      onMouseDown={(e) => {
        setDragging(true)
        document.body.classList.add('select-none')
        dragRef.current = { x: e.clientX - position.x, y: e.clientY - position.y }
      }}
      onMouseMove={(event) => {
        if (!dragging) return
        const { x, y } = dragRef.current
        setPosition({ x: event.clientX - x, y: event.clientY - y })
      }}
      onMouseUp={() => {
        document.body.classList.remove('select-none')
        setDragging(false)
      }}
      onWheel={(event) => {
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
      }}
    >
      <div
        className={zoomViewport({
          cursor: (dragging ? 'dragging' : undefined) ?? (scale > 1 ? 'zoomable' : undefined),
        })}
        ref={zoomRef}
      >
        <div className={canvas()} style={style}>
          <Mermaid {...props} />
        </div>
      </div>
      <div className={toolbar()}>
        <button
          className={btn()}
          disabled={scale <= MIN_SCALE}
          title="缩小"
          type="button"
          onClick={zoomOut}
        >
          -
        </button>
        <span className={point()}>{pct}%</span>
        <button
          className={btn()}
          disabled={scale >= MAX_SCALE}
          title="放大"
          type="button"
          onClick={zoomIn}
        >
          +
        </button>
        <button
          className={btn()}
          disabled={scale === 1 && position.x === 0 && position.y === 0}
          title="重置"
          type="button"
          onClick={reset}
        >
          ↺
        </button>
        <button
          className={btn()}
          title={fullscreen ? '退出全屏' : '全屏'}
          type="button"
          onClick={() => {
            setFullscreen(!fullscreen)
            if (!fullscreen) {
              document.body.classList.add('overflow-hidden')
            } else {
              document.body.classList.remove('overflow-hidden')
            }
          }}
        >
          {fullscreen ? '⊡' : '▣'}
        </button>
      </div>
    </Wrapper>
  )
}

interface Props extends WrapperProps<typeof MermaidType> {}

type CSSVar = CSSProperties & {
  [key: `--${string}`]: string | number
}
