const listeners = new Set<() => void>()
let direction: DirectionType = 'right'

export const keyname = 'pbvm-tool-direction'

export const setDirection = (value: DirectionType) => {
  if (direction !== value) {
    direction = value
    listeners.forEach((listeners) => listeners())
  }
}

export const directionStore = {
  getSnapshot: () => direction,
  getServerSnapshot: () => 'right' as const,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  setDirection: (value: string | null) => {
    const data = value === 'left' ? 'left' : 'right'
    if (direction !== data) {
      direction = data
      listeners.forEach((listeners) => listeners())
    }
  },
  setPersistentDirection: (value: DirectionType) => {
    directionStore.setDirection(value)
    localStorage.setItem(keyname, value)
  },
}

export type DirectionType = 'left' | 'right'
