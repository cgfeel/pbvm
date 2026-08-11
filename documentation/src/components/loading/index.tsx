import type { FC } from 'react'
import { tv } from 'tailwind-variants'

const styles = tv({
  slots: {
    circle: 'size-12 animate-spin rounded-full border-4 border-current border-t-transparent',
    wrap: 'pointer-events-none absolute inset-0 grid place-items-center',
  },
})

const { circle, wrap } = styles()

export const CircleLoading: FC = () => (
  <div className={wrap()}>
    <div className={circle()}></div>
  </div>
)
