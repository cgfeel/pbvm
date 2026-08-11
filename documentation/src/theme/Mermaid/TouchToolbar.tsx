import Gesture from '@site/static/img/gesture.svg'
import type { FC } from 'react'
import type { BaseBtnGroupProps } from './BaseBtnGroup'
import BaseBtnGroup from './BaseBtnGroup'
import Button from './Button'

const APP_NAME = 'touch-toolbar'

const TouchToolbar: FC<TouchToolbarProps> = ({ onTab, onTrigger }) => {
  return (
    <>
      <Button size="base" variants="base" onClick={onTab}>
        <Gesture />
      </Button>
      <BaseBtnGroup name={APP_NAME} size="base" variants="base" onTrigger={onTrigger} />
    </>
  )
}

export default TouchToolbar

interface TouchToolbarProps extends Pick<BaseBtnGroupProps, 'onTrigger'> {
  onTab?: () => void
}
