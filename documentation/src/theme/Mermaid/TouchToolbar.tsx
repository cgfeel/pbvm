import Gesture from '@site/static/img/gesture.svg'
import type { FC } from 'react'
import { tv } from 'tailwind-variants'
import type { BaseBtnGroupProps } from './BaseBtnGroup'
import BaseBtnGroup from './BaseBtnGroup'
import Button from './Button'

const APP_NAME = 'touch-toolbar'
const styles = tv({
  base: 'size-10 overflow-hidden [&_svg]:size-5 [&_svg]:fill-white',
})

const TouchToolbar: FC<TouchToolbarProps> = ({ onTab, onTrigger }) => {
  return (
    <>
      <Button className={styles()} size="base" variants="base" onClick={onTab}>
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
