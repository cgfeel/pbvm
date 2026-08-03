import Link from '@docusaurus/Link'
import type { FC } from 'react'
import { tv } from 'tailwind-variants'
import Wraper from './Wraper'

const logoText = `██████╗ ██████╗ ██╗   ██╗███╗   ███╗
██╔══██╗██╔══██╗██║   ██║████╗ ████║
██████╔╝██████╔╝██║   ██║██╔████╔██║
██╔═══╝ ██╔══██╗╚██╗ ██╔╝██║╚██╔╝██║
██║     ██████╔╝ ╚████╔╝ ██║ ╚═╝ ██║
╚═╝     ╚═════╝   ╚═══╝  ╚═╝     ╚═╝`

const styles = tv({
  slots: {
    container: 'text-center flex flex-col gap-6 text-lg',
    logo: 'font-mono whitespace-pre leading-[1.2] mb-0 bg-transparent text-center',
    tips: 'text-neutral-500 dark:text-neutral-400',
    title: 'text-3xl',
  },
})

const { container, logo, tips, title } = styles()

const BottomStart: FC = () => (
  <Wraper>
    <div className={container()}>
      <div>
        <h3 className={title()}>准备好开始了吗？</h3>
        <div className={tips()}>安装 pbvm，享受流畅的浏览器版本管理体验。</div>
      </div>
      <pre className={logo()}>{logoText}</pre>
      <div>
        <Link to="/intro">阅读文档 →</Link>
      </div>
    </div>
  </Wraper>
)

export default BottomStart
