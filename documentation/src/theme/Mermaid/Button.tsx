import type { PickVariants } from '@site/src/utils/fields'
import type { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

const borderStyle = 'border border-[var(--ifm-color-emphasis-300)]'
const baseBorder = `bg-[var(--ifm-background-surface-color)] ${borderStyle}`
const smallRange = 'py-0.5 px-1.5'

const styles = tv({
  base: [
    smallRange,
    'flex',
    'justify-center',
    'items-center',
    'cursor-pointer',
    'relative',
    'rounded',
    'text-[var(--ifm-color-emphasis-700)]',
    'leading-none',
    'enabled:hover:bg-[var(--ifm-color-emphasis-200)]',
    'disabled:opacity-30',
    'disabled:cursor-default',
    'leading-none',
  ],
  variants: {
    size: {
      base: ['text-3xl', 'size-10'],
      sm: ['text-sm'],
    },
    variants: {
      base: [baseBorder],
      ghost: ['border-0', 'bg-transparent'],
    },
  },
  defaultVariants: {
    size: 'sm',
    variants: 'ghost',
  },
})

const Button: FC<PropsWithChildren<ButtonProps>> = ({
  children,
  className,
  size,
  variants,
  ...props
}) => (
  <button {...props} className={styles({ className, size, variants })}>
    {children}
  </button>
)

export { baseBorder, borderStyle, smallRange }

export default Button

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {}

export type ButtonStyleProps = PickVariants<typeof styles, 'size' | 'variants'>
