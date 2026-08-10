import BrowserOnly from '@docusaurus/BrowserOnly'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { useColorMode } from '@site/src/hooks/theme'
import { type FC, type ReactNode } from 'react'
import { tv } from 'tailwind-variants'
import cliopsEn from '../../mermaid/en/cliops.mmd'
import devopsEn from '../../mermaid/en/devops.mmd'
import lockopsEn from '../../mermaid/en/lockops.mmd'
import mirroropsEn from '../../mermaid/en/mirrorops.mmd'
import cliopsZh from '../../mermaid/zh-Hans/cliops.mmd'
import devopsZh from '../../mermaid/zh-Hans/devops.mmd'
import lockopsZh from '../../mermaid/zh-Hans/lockops.mmd'
import mirroropsZh from '../../mermaid/zh-Hans/mirrorops.mmd'
import { t } from '../../utils/i18n'
import { styles as buttonStyle } from '../button'
import { Card } from '../card'
import Mermaid from '../mermaid'
import Wraper from './Wraper'

// md 最终会在生产变成不到 1kb 的 url
const getItems = (isZh: boolean): ItemType[] => [
  {
    className: 'scale-375 hover:scale-250',
    key: 'commander',
    md: isZh ? cliopsZh : cliopsEn,
    title: t('home.dev.item.commander'),
    url: '/concepts/commander',
  },
  {
    className: 'scale-375 hover:scale-250',
    key: 'monorepo',
    md: isZh ? devopsZh : devopsEn,
    title: t('home.dev.item.architecture'),
    url: '/concepts/monorepo',
  },
  {
    key: 'source-and-mirror',
    md: isZh ? mirroropsZh : mirroropsEn,
    title: t('home.dev.item.resources'),
    url: isZh ? '/source#整体流程' : '/source#overall-flow',
  },
  {
    className: 'pt-9 scale-600 hover:scale-450',
    key: 'lock',
    md: isZh ? lockopsZh : lockopsEn,
    title: t('home.dev.item.storage'),
    url: isZh
      ? '/concepts/store-and-cache#数据存储--文件结构'
      : '/concepts/store-and-cache#store-vs-browserlist-relationship',
  },
]

const styles = tv({
  slots: {
    btn: 'absolute text-white z-1 left-1/2 top-full -translate-x-1/2 border-0 text-sm py-2 px-3 bg-violet-500 pointer-events-none group-hover:top-1/2 group-hover:-translate-y-1/2',
    card: 'size-48 flex inline-flex hover:drop-shadow-[0_0_4px_rgba(155,35,211,0.6)]',
    container: 'flex flex-col gap-12',
    demo: 'flex flex-wrap gap-12',
    item: 'flex flex-col gap-4',
    link: 'relative block w-full h-full group',
    svg: 'scale-200 hover:scale-150 inline-block [&_svg]:w-full [&_svg]:h-full [&_svg]:hover:brightness-150',
    header: 'flex flex-col gap-2 max-lg:gap-1 max-md:hidden',
    title: 'text-2xl mb-0 max-lg:text-xl',
  },
  variants: {
    type: {
      primary: {
        title: 'max-lg:text-2xl',
      },
      secondary: {
        header: 'max-md:block min-md:hidden',
        title: 'text-xl max-lg:text-lg',
      },
    },
  },
  compoundSlots: [{ slots: ['btn', 'card', 'svg'], class: 'transition-all duration-200' }],
})

const { btn, card, container, demo, header, item, link, svg, title } = styles()

const DevEnvironment: FC<DevEnvironmentProps> = () => {
  const { i18n } = useDocusaurusContext()
  const colorMode = useColorMode()
  const items = getItems(i18n.currentLocale === 'zh-Hans')

  return (
    <Wraper>
      <div className={container()}>
        <div className={header()}>
          <h3 className={title()}>{t('home.dev.header.title')}</h3>
          <h3 className={title({ type: 'secondary' })}>{t('home.dev.header.desc')}</h3>
        </div>
        <div className={header({ type: 'secondary' })}>
          <h3 className={title({ type: 'primary' })}>{t('home.dev.header.titleShort')}</h3>
          <div>{t('home.dev.header.descShort')}</div>
        </div>
        <div className={demo()}>
          {items.map(({ className, md, key, title, url }) => (
            <div className={item()} key={key}>
              <Card className={card({ className: 'bg-white' })}>
                <Link className={link()} to={url}>
                  <BrowserOnly>
                    {() => (
                      <Mermaid
                        className={svg({ className })}
                        theme={colorMode === 'dark' ? colorMode : 'default'}
                        value={md}
                      />
                    )}
                  </BrowserOnly>
                  <button className={buttonStyle({ className: btn() })}>
                    {t('home.dev.item.viewDetails')}
                  </button>
                </Link>
              </Card>
              <span>{title}</span>
            </div>
          ))}
        </div>
      </div>
    </Wraper>
  )
}

export default DevEnvironment

interface DevEnvironmentProps {}

type ItemType = {
  md: string
  key: string
  title: ReactNode
  url: string
  className?: string
}
