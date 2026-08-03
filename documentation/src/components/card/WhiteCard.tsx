import type { FC, PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

const styles = tv({
  base: 'rounded-4xl border-2 border-black dark:border-white',
})

const WhiteCard: FC<PropsWithChildren<WhiteCardProps>> = ({ children, className }) => (
  <div className={styles({ className })}>{children}</div>
)

export default WhiteCard

interface WhiteCardProps {
  className?: string
}
