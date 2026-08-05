import Link from '@docusaurus/Link'
import Translate from '@docusaurus/Translate'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { type FC, type ReactNode } from 'react'
import { tv } from 'tailwind-variants'
import { cliOps, devOps, lockOps, mirrorOps } from '../../utils/mermaidMD'
import { styles as buttonStyle } from '../button'
import { Card } from '../card'
import Mermaid from '../mermaid'
import Wraper from './Wraper'

const getItems = (isZh: boolean): ItemType[] => [
  {
    className: 'scale-375 hover:scale-250',
    md: cliOps,
    key: 'commander',
    title: <Translate id="home.dev.item.commander">CLI Command Flow</Translate>,
    url: '/concepts/commander',
  },
  {
    className: 'scale-375 hover:scale-250',
    md: devOps,
    key: 'monorepo',
    title: <Translate id="home.dev.item.architecture">Project Architecture</Translate>,
    url: '/concepts/monorepo',
  },
  {
    md: mirrorOps,
    key: 'source-and-mirror',
    title: <Translate id="home.dev.item.resources">Resources & Mirrors</Translate>,
    url: isZh ? '/source#整体流程' : '/source#overall-flow',
  },
  {
    className: 'pt-9 scale-600 hover:scale-450',
    md: lockOps,
    key: 'lock',
    title: <Translate id="home.dev.item.storage">Storage & File Lock</Translate>,
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
  const items = getItems(i18n.currentLocale === 'zh-Hans')

  return (
    <Wraper>
      <div className={container()}>
        <div className={header()}>
          <h3 className={title()}>
            <Translate id="home.dev.header.title">
              Designed for frontend engineering — generate independent browserlist.json
              configs for different projects
            </Translate>
          </h3>
          <h3 className={title({ type: 'secondary' })}>
            <Translate id="home.dev.header.desc">
              Achieve project-level browser version management. Integrate with modern build
              tools to provide a consistent browser environment for development, testing,
              and CI/CD.
            </Translate>
          </h3>
        </div>
        <div className={header({ type: 'secondary' })}>
          <h3 className={title({ type: 'primary' })}>
            <Translate id="home.dev.header.titleShort">
              Designed for Frontend Engineering
            </Translate>
          </h3>
          <div>
            <Translate id="home.dev.header.descShort">
              Generate independent browserlist.json configs for different projects, achieving
              project-level browser version management. Integrate with modern build tools to
              provide a consistent browser environment for development, testing, and CI/CD.
            </Translate>
          </div>
        </div>
        <div className={demo()}>
          {items.map(({ className, md, key, title, url }) => (
            <div className={item()} key={key}>
              <Card className={card()}>
                <Link className={link()} to={url}>
                  <Mermaid className={svg({ className })} value={md} />
                  <button className={buttonStyle({ className: btn() })}>
                    <Translate id="home.dev.item.viewDetails">View Details</Translate>
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
