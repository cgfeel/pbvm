import CodeBlock from '@theme/CodeBlock'
import type { FC, PropsWithChildren, ReactNode } from 'react'
import { tv } from 'tailwind-variants'

const styles = tv({
  slots: {
    card: 'w-full m-auto rounded-xl overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_4px_24px_rgba(0,0,0,0.3)]',
    title: 'font-semibold mb-2',
    wrap: 'max-w-[640px] [--ifm-leading:0]',
  },
})

const { card, title: titleStyle, wrap } = styles()

const CodeCard: FC<PropsWithChildren<CodeCardProps>> = ({ children, title }) => (
  <div className={wrap()}>
    <p className={titleStyle()}>{title}</p>
    <div className={card()}>
      <CodeBlock language="bash">{children}</CodeBlock>
    </div>
  </div>
)

export default CodeCard

interface CodeCardProps {
  title?: ReactNode
}
