import ArrowIcon from '@site/static/img/arrow-to-top.svg'
import { useCallback, useEffect, useRef, useSyncExternalStore, type FC } from 'react'
import { tv } from 'tailwind-variants'
import type { ButtonProps } from './Button'
import Button from './Button'
import type { DirectionType } from './directionStore'
import { directionStore, keyname } from './directionStore'

const styles = tv({
  base: '',
  variants: {
    direction: {
      left: ['rotate-90'],
      right: ['-rotate-90'],
    },
  },
  defaultVariants: {
    direction: 'right',
  },
})

const DirectionBtn: FC<ButtonProps> = ({ className, onClick, ...props }) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const direction = useSyncExternalStore<DirectionType>(
    directionStore.subscribe,
    directionStore.getSnapshot,
    directionStore.getServerSnapshot
  )

  const changeHandle = useCallback((pos: DirectionType) => {
    directionStore.setPersistentDirection(pos)
  }, [])

  useEffect(() => {
    function storageHandle(event: StorageEvent) {
      if (event.key === keyname) {
        directionStore.setDirection(event.newValue)
      }
    }

    directionStore.setDirection(localStorage.getItem(keyname))
    window.addEventListener('storage', storageHandle)
    return () => {
      window.removeEventListener('storage', storageHandle)
    }
  }, [])

  useEffect(() => {
    const toolbar = buttonRef.current?.closest('[data-direction]')
    if (toolbar instanceof HTMLElement) toolbar.dataset.direction = direction
  }, [direction])

  return (
    <Button
      {...props}
      className={styles({ className, direction })}
      ref={buttonRef}
      onClick={(event) => {
        onClick?.(event)
        changeHandle(direction === 'left' ? 'right' : 'left')
      }}
    >
      <ArrowIcon />
    </Button>
  )
}

export default DirectionBtn
