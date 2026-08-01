import type { FC, PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'
import { LinkButton } from '../button'

const secondary = ['text-neutral-500', 'dark:text-neutral-400']
const styles = tv({
  slots: {
    actions: 'flex gap-4 flex-wrap max-lg:justify-center',
    badge:
      'inline-flex items-center gap-2 py-2 px-4 rounded-full bg-black/5 border border-black/10 text-sm font-medium mb-6 dark:bg-white/6 dark:border-white/10',
    badgeDot: 'size-1.5 rounded-full bg-green-500',
    container:
      'relative z-1 flex items-center gap-12 max-lg:flex-col max-lg:gap-10 max-lg:text-center',
    demo: 'flex-[0_0_460px] flex flex-col items-center justify-center max-lg:flex-[1_1_auto] max-lg:w-full max-lg:max-w-120',
    description: 'flex-[1_1_50%] min-w-0 max-lg:flex max-lg:flex-col max-lg:items-center',
    slogan: 'flex flex-col mb-4',
    subtitle: 'text-lg max-w-120 mb-8 leading-normal max-lg:text-base',
    title:
      'text-6xl font-extrabold text-black leading-[1.15] tracking-[-0.02em] my-0 dark:text-white max-lg:text-4xl',
    warp: 'relative py-20 overflow-hidden bg-surface border-b border-black/10 dark:border-white/10 max-lg:py-12',
  },
  variants: {
    type: {
      secondary: {
        title: 'text-5xl',
      },
    },
  },
  compoundVariants: [{ type: 'secondary', class: { title: secondary.join(' ') } }],
  compoundSlots: [
    {
      slots: ['badge', 'subtitle'],
      class: secondary,
    },
  ],
})

const { actions, badge, badgeDot, container, demo, description, slogan, subtitle, title, warp } =
  styles()

const Header: FC<PropsWithChildren> = ({ children }) => (
  <header className={warp()}>
    <div className={container({ class: 'container' })}>
      <div className={description()}>
        <span className={badge()}>
          <span className={badgeDot()} />
          v1.0 已发布
        </span>
        <div className={slogan()}>
          <h1 className={title()}>浏览器版本</h1>
          <h2 className={title({ type: 'secondary' })}>管理从未如此简单</h2>
        </div>
        <p className={subtitle()}>
          基于 @puppeteer/browsers，一条命令安装、切换、管理多个浏览器版本，
          为开发与自动化测试而生。
        </p>
        <div className={actions()}>
          <LinkButton to="/intro" type="primary">
            快速开始 →
          </LinkButton>
          <LinkButton to="/commands/create" type="secondary">
            命令参考
          </LinkButton>
        </div>
      </div>

      <div className={demo()}>{children}</div>
    </div>
  </header>
)

export default Header
