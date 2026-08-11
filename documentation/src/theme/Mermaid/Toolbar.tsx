import type { PickVariants } from '@site/src/utils/fields'
import type { FC, PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'
import { baseBorder, smallRange } from './Button'

const styles = tv({
  base: [
    'absolute',
    'bottom-2',
    'right-2',
    'flex',
    'items-center',
    'rounded-[6px]',
    'transition-opacity',
    'duration-200',
    'pointer-events-none',
  ],
  variants: {
    hover: {
      true: [
        'opacity-0',
        'group-data-[state=loaded]:group-data-[operation=normal]:group-hover:opacity-100',
        'group-data-[state=loaded]:group-data-[operation=normal]:group-hover:pointer-events-auto',
        'group-data-[state=loaded]:group-data-[operation=zooming]:group-hover:opacity-100',
        'group-data-[state=loaded]:group-data-[operation=zooming]:group-hover:pointer-events-auto',
      ],
    },
    size: {
      base: 'gap-4',
      sm: [smallRange, 'gap-0.5'],
    },
    touch: {
      true: '',
    },
    variants: {
      base: [baseBorder],
      ghost: ['bg-transparent'],
    },
  },
  compoundVariants: [
    {
      hover: false,
      touch: true,
      class: [
        'opacity-0',
        'group-data-[state=loaded]:group-data-[operation=normal]:touch-only:opacity-100',
        'group-data-[state=loaded]:group-data-[operation=normal]:touch-only:pointer-events-auto',
      ],
    },
  ],
  defaultVariants: {
    hover: false,
    touch: false,
    variants: 'base',
  },
})

const Toolbar: FC<PropsWithChildren<ToolbarProps>> = ({ children, className, ...props }) => (
  <div className={styles({ ...props, className: className })} data-rule="toolbar">
    {children}
  </div>
)

export default Toolbar

export type ToolbarStyleProps = PickVariants<typeof styles, 'hover' | 'size' | 'touch' | 'variants'>

interface ToolbarProps extends ToolbarStyleProps {
  className?: string
}
