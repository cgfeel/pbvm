import Link from '@docusaurus/Link'
import { type FC } from 'react'
import { tv } from 'tailwind-variants'
import { cliOps, devOps, lockOps, stroeMD } from '../../utils/mermaidMD'
import { styles as buttonStyle } from '../button'
import { Card } from '../card'
import Mermaid from '../mermaid'
import Wraper from './Wraper'

const items: ItemType[] = [
  {
    md: stroeMD,
    key: 'store-and-cache',
    title: '数据存储 & 文件结构',
    url: '/concepts/store-and-cache#数据存储--文件结构',
  },
  {
    className: 'scale-375 hover:scale-250',
    md: devOps,
    key: 'monorepo',
    title: '项目架构/组件依赖关联',
    url: '/concepts/monorepo',
  },
  {
    className: 'scale-375 hover:scale-250',
    md: cliOps,
    key: 'commander',
    title: 'CLI 命令执行流程',
    url: '/concepts/commander',
  },
  {
    className: 'pt-9 scale-600 hover:scale-450',
    md: lockOps,
    key: 'lock',
    title: '文件锁机制',
    url: '/concepts/store-and-cache#文件锁机制',
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
  return (
    <Wraper>
      <div className={container()}>
        <div className={header()}>
          <h3 className={title()}>
            面向前端工程化场景设计，可为不同项目生成独立的 browserlist.json 配置
          </h3>
          <h3 className={title({ type: 'secondary' })}>
            实现项目级浏览器版本管理。同时支持与现代构建工具结合，为开发、测试和构建流程提供一致的浏览器环境
          </h3>
        </div>
        <div className={header({ type: 'secondary' })}>
          <h3 className={title({ type: 'primary' })}>面向前端工程化场景设计</h3>
          <div>
            可为不同项目生成独立的 browserlist.json
            配置，实现项目级浏览器版本管理。同时支持与现代构建工具结合，为开发、测试和构建流程提供一致的浏览器环境
          </div>
        </div>
        <div className={demo()}>
          {items.map(({ className, md, key, title, url }) => (
            <div className={item()} key={key}>
              <Card className={card()}>
                <Link className={link()} to={url}>
                  <Mermaid className={svg({ className })} value={md} />
                  <button className={buttonStyle({ className: btn() })}>查看详情</button>
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

type ItemType = Record<'md' | 'key' | 'title' | 'url', string> & {
  className?: string
}
