import { type FC, type ReactNode } from 'react'
import { tv } from 'tailwind-variants'
import Tag from '../tag'

const style = tv({
  slots: {
    desc: 'flex flex-col gap-1',
    icon: 'pt-2 [&_svg]:block [&_svg]:w-10 [&_svg]:h-10 [&_svg]:fill-black dark:[&_svg]:fill-white',
    items: 'flex gap-2',
    title: 'text-2xl font-blod mb-0 text-black dark:text-white',
    wrap: 'pt-2 pb-4 pl-4 pr-10 flex items-start gap-4',
  },
})

const { desc, icon, items, title, wrap } = style()

const BrowserCard: FC<BrowserCardProps> = ({ logo, name, tags }) => (
  <div className={wrap()}>
    <div className={icon()}>{logo}</div>
    <div className={desc()}>
      <span className={title()}>{name}</span>
      <div className={items()}>
        {tags.map((item) => (
          <Tag key={`${item.version}:${item.alias}`} status="solid">
            {item.version}
          </Tag>
        ))}
      </div>
    </div>
  </div>
)

export default BrowserCard

interface BrowserCardProps {
  logo: ReactNode
  name: ReactNode
  tags: TagItem[] | Readonly<TagItem[]>
}

type TagItem = {
  alias: string
  version: string
  active?: boolean
}
