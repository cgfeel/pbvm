import type { FC } from 'react'
import { useContext } from 'react'
import type { ButtonStyleProps } from './Button'
import Button from './Button'
import { ContainerContext } from './ContainerProvider'
import { WrapperContext } from './Wrapper'

const BaseBtnGroup: FC<BaseBtnGroupProps> = ({ name, onTrigger, ...props }) => {
  const { fullscreen, setFullscreen } = useContext(WrapperContext)
  const { position, scale, reset } = useContext(ContainerContext)

  return (
    <>
      <Button
        {...props}
        disabled={scale === 1 && position.x === 0 && position.y === 0}
        title="重置"
        type="button"
        onClick={() => {
          onTrigger?.('reset')
          reset()
        }}
      >
        <span className="-translate-y-0.5">↺</span>
      </Button>
      <Button
        {...props}
        title={fullscreen !== '' ? '退出全屏' : '全屏'}
        type="button"
        onClick={() => {
          setFullscreen((current) => (current === name ? '' : name))
          onTrigger?.('full')

          if (!fullscreen) {
            document.body.classList.add('overflow-hidden')
          } else {
            document.body.classList.remove('overflow-hidden')
          }
        }}
      >
        {fullscreen !== '' ? '⊡' : '▣'}
      </Button>
    </>
  )
}

export default BaseBtnGroup

export interface BaseBtnGroupProps extends ButtonStyleProps {
  name: string
  onTrigger?: (type: 'full' | 'reset') => void
}
