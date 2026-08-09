import Link from '@docusaurus/Link'
import type { FC } from 'react'
import { tv } from 'tailwind-variants'
import { t } from '../../utils/i18n'
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
        <h3 className={title()}>{t('home.bottom.title')}</h3>
        <div className={tips()}>{t('home.bottom.desc')}</div>
      </div>
      <pre className={logo()}>{logoText}</pre>
      <div>
        <Link to="/intro">{t('home.bottom.cta')}</Link>
      </div>
    </div>
  </Wraper>
)

export default BottomStart
