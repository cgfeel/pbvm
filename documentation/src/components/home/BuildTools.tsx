import type { FC, PropsWithChildren, ReactNode } from 'react'
import { tv } from 'tailwind-variants'
import Wraper from './Wraper'

const styles = tv({
  slots: {
    container: 'flex flex-col gap-8',
    title: 'text-4xl mb-0',
  },
  variants: {
    type: {
      secondary: {
        title: 'text-2xl',
      },
    },
  },
})

const { container, title: titleStyle } = styles()

const BuildTools: FC<PropsWithChildren<BuildToolsProps>> = ({ children, subTitle, title }) => (
  <Wraper>
    <div className={container()}>
      <div>
        <h2 className={titleStyle()}>{title}</h2>
        <h3 className={titleStyle({ type: 'secondary' })}>{subTitle}</h3>
      </div>
      {children}
    </div>
  </Wraper>
)

export default BuildTools

interface BuildToolsProps {
  subTitle?: ReactNode
  title?: ReactNode
}
