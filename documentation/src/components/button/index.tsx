import Link from '@docusaurus/Link'
import type { PickVariants } from '@site/src/utils/fields'
import type { ComponentProps, FC, PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

const styles = tv({
  slots: {
    linkBtn:
      'inline-flex items-center gap-2 py-3 px-8 rounded-lg font-semibold text-base cursor-pointer no-underline transition-all duration-150',
  },
  variants: {
    type: {
      primary: {
        linkBtn:
          'bg-black text-white hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200',
      },
      secondary: {
        linkBtn:
          'text-neutral-800 border border-black/20 hover:bg-black/5 hover:text-black dark:text-neutral-400 dark:border-white/20 dark:hover:bg-white/8 dark:hover:text-white',
      },
    },
  },
})

export const LinkButton: FC<PropsWithChildren<LinkButtonProps>> = ({
  children,
  className,
  type,
  ...props
}) => {
  const { linkBtn } = styles({ type })
  return (
    <Link className={linkBtn({ class: className })} {...props}>
      {children}
    </Link>
  )
}

interface LinkButtonProps extends LinkButtonOps {}

type LinkButtonOps = ComponentProps<typeof Link> & PickVariants<typeof styles, 'type'>
