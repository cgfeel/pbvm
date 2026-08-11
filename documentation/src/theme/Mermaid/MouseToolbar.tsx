import MinusCom from '@site/static/img/minus.svg'
import PlusCom from '@site/static/img/plus.svg'
import { t } from '@site/src/utils/i18n'
import { useContext, type FC } from 'react'
import { tv } from 'tailwind-variants'
import BaseBtnGroup from './BaseBtnGroup'
import Button from './Button'
import { ContainerContext } from './ContainerProvider'
import DirectionBtn from './DirectionBtn'
import { MAX_SCALE, MIN_SCALE, ZOOM_STEP } from './ZoomView'

const APP_NAME = 'mouse-toolbar'
const styles = tv({
  base: ['text-xs', 'text-[var(--ifm-color-emphasis-600)]', 'min-w-[38px]', 'text-center'],
})

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(val, min))

const MouseToolbar: FC<MouseToolbarProps> = () => {
  const { scale, setScale } = useContext(ContainerContext)
  const zoomIn = () => setScale((current) => clamp(current * ZOOM_STEP, MIN_SCALE, MAX_SCALE))
  const zoomOut = () => setScale((current) => clamp(current / ZOOM_STEP, MIN_SCALE, MAX_SCALE))

  return (
    <>
      <DirectionBtn />
      <Button disabled={scale <= MIN_SCALE} title={t('mermaid.toolbar.zoomOut')} type="button" onClick={zoomOut}>
        <MinusCom />
      </Button>
      <span className={styles()}>{Math.round(scale * 100)}%</span>
      <Button disabled={scale >= MAX_SCALE} title={t('mermaid.toolbar.zoomIn')} type="button" onClick={zoomIn}>
        <PlusCom />
      </Button>
      <BaseBtnGroup name={APP_NAME} />
    </>
  )
}

export default MouseToolbar

interface MouseToolbarProps {
  classNames?: Partial<Record<keyof typeof styles.slots, string>>
}
