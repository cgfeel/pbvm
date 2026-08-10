import type { Dispatch, FC, PropsWithChildren, SetStateAction } from 'react'
import { createContext, useCallback, useState } from 'react'

const defaultPosition = { x: 0, y: 0 }
const defaultHandle = () => {
  // nothing
}

const defaultContext: ContainerContextInstance = {
  position: { ...defaultPosition },
  scale: 1,
  reset: defaultHandle,
  setPosition: defaultHandle,
  setScale: defaultHandle,
}

const ContainerContext = createContext<ContainerContextInstance>(defaultContext)

const ContainerProvider: FC<PropsWithChildren> = ({ children }) => {
  const [position, setPosition] = useState({ ...defaultPosition })
  const [scale, setScale] = useState(defaultContext.scale)

  const reset = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  return (
    <ContainerContext.Provider value={{ position, scale, reset, setPosition, setScale }}>
      {children}
    </ContainerContext.Provider>
  )
}

export { ContainerContext }

export default ContainerProvider

interface ContainerContextInstance {
  position: typeof defaultPosition
  scale: number
  reset: () => void
  setPosition: Dispatch<SetStateAction<typeof defaultPosition>>
  setScale: Dispatch<SetStateAction<number>>
}
