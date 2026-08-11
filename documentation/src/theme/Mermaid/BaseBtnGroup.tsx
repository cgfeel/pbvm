import FullScreenEnter from '@site/static/img/24gf-fullScreenEnter.svg'
import FullScreenExit from '@site/static/img/24gf-fullScreenExit.svg'
import RedoCom from '@site/static/img/redo.svg'
import { t } from '@site/src/utils/i18n'
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
        title={t('mermaid.toolbar.reset')}
        type="button"
        onClick={() => {
          onTrigger?.('reset')
          reset()
        }}
      >
        <RedoCom />
      </Button>
      <Button
        {...props}
        title={fullscreen !== '' ? t('mermaid.toolbar.exitFullscreen') : t('mermaid.toolbar.fullscreen')}
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
        {fullscreen !== '' ? <FullScreenExit /> : <FullScreenEnter />}
      </Button>
    </>
  )
}

export default BaseBtnGroup

export interface BaseBtnGroupProps extends ButtonStyleProps {
  name: string
  onTrigger?: (type: 'full' | 'reset') => void
}
