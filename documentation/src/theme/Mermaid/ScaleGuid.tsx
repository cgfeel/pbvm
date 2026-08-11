import { useContext, type FC } from 'react'
import { tv } from 'tailwind-variants'
import { ContainerContext } from './ContainerProvider'

const styles = tv({
  slots: {
    guid: [
      'min-h-12',
      'bg-black/24',
      'flex',
      'justify-center',
      'items-center',
      'rounded-lg',
      'text-xl',
      'py-4',
      'px-8',
      'font-bold',
      'opacity-0',
      'transition-opacity',
      'duration-200',
      'dark:bg-black/64',
      'group-data-[state=loaded]:group-data-[operation=zooming]:touch-only:opacity-100',
    ],
    wrap: ['pointer-events-none', 'absolute', 'inset-0', 'grid', 'place-items-center'],
  },
})

const { guid, wrap } = styles()

const ScaleGuid: FC = () => {
  const { scale } = useContext(ContainerContext)
  return (
    <div className={wrap()}>
      <div className={guid()}>{Math.round(scale * 100)}%</div>
    </div>
  )
}

export default ScaleGuid
