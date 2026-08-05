import Link from '@docusaurus/Link'
import Translate from '@docusaurus/Translate'
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
        <h3 className={title()}>
          <Translate id="home.bottom.title">Ready to Get Started?</Translate>
        </h3>
        <div className={tips()}>
          <Translate id="home.bottom.desc">
            Install pbvm and enjoy a smooth browser version management experience.
          </Translate>
        </div>
      </div>
      <pre className={logo()}>{logoText}</pre>
      <div>
        <Link to="/intro">
          <Translate id="home.bottom.cta">Read the Docs →</Translate>
        </Link>
      </div>
    </div>
  </Wraper>
)

export default BottomStart
