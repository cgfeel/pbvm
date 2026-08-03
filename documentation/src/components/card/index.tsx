import type { FC, PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

const style = tv({
  slots: {
    body: 'py-5 px-6 text-sm leading-[1.8] overflow-x-auto',
    header: 'flex items-center gap-1.5 py-3 px-4 bg-white/4 border-b border-white/6',
    wrap: 'relative z-1 w-full rounded-xl overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_20px_60px_-20px_rgba(0,0,0,0.15)] bg-[#1a1a1a] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_60px_-20px_rgba(0,0,0,0.5)] dark:bg-[#111]',
  },
  compoundSlots: [
    {
      slots: ['body', 'header'],
      class: 'font-code text-left',
    },
  ],
})

const { body, header, wrap } = style()

export const Card: FC<PropsWithChildren<CardProps>> = ({ children, className }) => (
  <div className={wrap({ className })}>{children}</div>
)

export const CardBody: FC<PropsWithChildren<CardBodyProps>> = ({ children, className }) => (
  <div className={body({ className })}>{children}</div>
)

export const CardHeader: FC<PropsWithChildren<CardHeaderProps>> = ({ children, className }) => (
  <div className={header({ className })}>{children}</div>
)

interface BaseProps {
  className?: string
}

interface CardProps extends BaseProps {}

interface CardBodyProps extends BaseProps {}

interface CardHeaderProps extends BaseProps {}
