import type { PickVariants } from '@site/src/utils/fields'
import type { DOMAttributes, FC, PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

const styles = tv({
  base: 'inline-flex py-1 px-2.5 border border-white/15 bg-white/6 text-white/50 text-xs rounded-sm',
  variants: {
    active: {
      true: 'text-white',
    },
    status: {
      solid: 'bg-black text-white dark:bg-white dark:text-black',
    },
  },
})

const Tag: FC<PropsWithChildren<TagProps>> = ({
  active,
  children,
  className,
  status,
  ...props
}) => (
  <span {...props} className={styles({ active, className, status })}>
    {children}
  </span>
)

export default Tag

interface TagProps extends StyleProps, DOMAttributes<HTMLSpanElement> {}

type StyleProps = PickVariants<typeof styles, 'active' | 'className' | 'status'>
