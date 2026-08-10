import BrowserOnly from '@docusaurus/BrowserOnly'
import type { ComponentType, FC } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import { borderStyle } from './Button'
import ContainerProvider from './ContainerProvider'
import type { GestureGuidInstance } from './GestureGuid'
import GestureGuid from './GestureGuid'
import MouseToolbar from './MouseToolbar'
import StaticMermaid from './StaticMermaid'
import Toolbar from './Toolbar'
import TouchToolbar from './TouchToolbar'
import Wrapper from './Wrapper'
import type { ZoomViewInstance } from './ZoomView'
import ZoomView from './ZoomView'

const isProd = process.env.NODE_ENV === 'production'
let MermaidPromise: Promise<{ default: ComponentType<Props> }> | null = null

const DevMermaid: FC<Props> = (props) => {
  const [Comp, setComp] = useState<ComponentType<Props> | null>(null)
  useEffect(() => {
    let cancelled = false
    if (!MermaidPromise) {
      MermaidPromise = import('@theme-original/Mermaid')
    }
    MermaidPromise.then((res) => {
      if (!cancelled) setComp(() => res.default)
    })
    return () => {
      cancelled = true
    }
  }, [])
  return Comp ? <Comp {...props} /> : null
}

export default function MermaidWrapper(props: Props) {
  const content = isProd ? <StaticMermaid src={props.value} /> : <DevMermaid {...props} />
  const gestureRef = useRef<GestureGuidInstance>(null)
  const zoomRef = useRef<ZoomViewInstance>(null)

  return (
    <Wrapper
      className={borderStyle}
      onMouseDown={(event) => zoomRef.current?.onMouseDown(event)}
      onMouseMove={(event) => zoomRef.current?.onMouseMove(event)}
      onMouseUp={(event) => zoomRef.current?.onMouseUp(event)}
      onPanEnd={(event) => zoomRef.current?.onPanEnd(event)}
      onPanMove={(event) => zoomRef.current?.onPanMove(event)}
      onPanStart={(event) => {
        gestureRef.current?.stop()
        zoomRef.current?.onPanStart(event)
      }}
      onPinchMove={(event) => zoomRef.current?.onPinchMove(event)}
      onPinchStart={(event) => {
        gestureRef.current?.stop()
        zoomRef.current?.onPinchStart(event)
      }}
      onTap={() => gestureRef.current?.play()}
      onWheel={(event) => zoomRef.current?.onWheel(event)}
    >
      <ContainerProvider>
        <ZoomView
          cheat={<BrowserOnly>{() => <GestureGuid ref={gestureRef} />}</BrowserOnly>}
          ref={zoomRef}
        >
          {content}
        </ZoomView>
        <Toolbar size="sm" hover>
          <MouseToolbar />
        </Toolbar>
        <Toolbar size="base" variants="ghost" touch>
          <TouchToolbar
            onTab={() => gestureRef.current?.play()}
            onTrigger={() => gestureRef.current?.stop()}
          />
        </Toolbar>
      </ContainerProvider>
    </Wrapper>
  )
}

interface Props {
  value: string
}
