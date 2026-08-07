import type { Dispatch, FC, PropsWithChildren, SetStateAction } from 'react'
import { createContext, useState } from 'react'

const defaultPosition = { x: 0, y: 0 }
const defaultHandle = () => {
  // nothing
}

const defaultContext: ContainerContextInstance = {
  position: { ...defaultPosition },
  scale: 1,
  setPosition: defaultHandle,
  setScale: defaultHandle,
}

const ContainerContext = createContext<ContainerContextInstance>(defaultContext)

const ContainerProvider: FC<PropsWithChildren> = ({ children }) => {
  const [position, setPosition] = useState({ ...defaultPosition })
  const [scale, setScale] = useState(defaultContext.scale)

  return (
    <ContainerContext.Provider value={{ position, scale, setPosition, setScale }}>
      {children}
    </ContainerContext.Provider>
  )
}

export { ContainerContext }

export default ContainerProvider

interface ContainerContextInstance {
  position: typeof defaultPosition
  scale: number
  setPosition: Dispatch<SetStateAction<typeof defaultPosition>>
  setScale: Dispatch<SetStateAction<number>>
}
