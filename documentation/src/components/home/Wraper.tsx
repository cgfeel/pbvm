import type { FC, PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

const styles = tv({
  slots: {
    content: 'w-full max-w-[65rem] m-auto box-border px-5',
    wrap: 'mb-20',
  },
})

const { content, wrap } = styles()

const Wraper: FC<PropsWithChildren<WraperProps>> = ({ children, classNames }) => (
  <div className={wrap({ className: classNames?.wrap })}>
    <div className={content({ className: classNames?.content })}>{children}</div>
  </div>
)

export default Wraper

interface WraperProps {
  classNames?: Record<keyof typeof styles.slots, string>
}
