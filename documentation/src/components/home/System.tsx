import Translate from '@docusaurus/Translate'
import { objectEntries } from '@site/src/utils/fields'
import Linux from '@site/static/img/linux.svg'
import Osx from '@site/static/img/osx.svg'
import Windows from '@site/static/img/windows.svg'
import type { FC } from 'react'
import { tv } from 'tailwind-variants'
import { Card } from '../card'
import Tag from '../tag'
import { styles as commandStyles } from './Terminal'
import Wraper from './Wraper'

const iconMap = Object.freeze({
  Windows,
  Osx,
  Linux,
})

const styles = tv({
  slots: {
    code: 'p-4 flex flex-col gap-2',
    codelist: 'bg-transparent [--ifm-pre-padding:0_1rem]',
    demo: 'flex-1 min-w-0 max-w-[542px]',
    desc: 'flex-1 gap-6',
    header: 'gap-2',
    footer: 'gap-4',
    icon: 'inline-flex gap-1 [&_svg]:w-4 [&_svg]:h-4 [&_svg]:fill-white dark:[&_svg]:fill-black',
    selector: 'flex gap-6 max-lg:flex-col max-lg:gap-10',
    tags: 'flex gap-2',
    title: 'text-5xl',
  },
  compoundSlots: [
    {
      slots: ['desc', 'footer', 'header'],
      class: 'flex flex-col',
    },
  ],
})

const { command, log } = commandStyles({ size: 'xs' })
const { code, codelist, demo, desc, footer, header, icon, selector, tags, title } = styles()

const System: FC = () => (
  <Wraper>
    <div className={selector()}>
      <div className={desc()}>
        <div className={header()}>
          <div>
            <Translate id="home.system.label">
              Cross-platform Compatibility
            </Translate>
          </div>
          <h3 className={title()}>
            <Translate id="home.system.title">
              Run Anywhere, Switch Seamlessly
            </Translate>
          </h3>
        </div>
        <div className={footer()}>
          <div>
            <Translate id="home.system.desc">
              pbvm runs on Windows, macOS, and Linux, helping developers install, switch,
              and manage multiple browser versions in any environment.
            </Translate>
          </div>
          <div className={tags()}>
            {objectEntries(iconMap).map(([name, Element]) => (
              <Tag key={name} status="solid">
                <span className={icon()}>
                  <Element />
                  <span>{name}</span>
                </span>
              </Tag>
            ))}
          </div>
        </div>
      </div>
      <div className={demo()}>
        <Card>
          <div className={code()}>
            <div>
              <span className={log()}>$ </span>
              <span className={command()}>pbvm ls -a</span>
            </div>
            <div className={command({ className: 'font-semibold' })}>mac (current):</div>
            <div className={command()}>
              <pre className={codelist()}>
                {`
ff-t                →  revision: firefox@stable_130.0.1
mac-121231          →  revision: chromium@121231`.trim()}
              </pre>
            </div>
            <span className={log()}>linux:</span>
            <div className={command({ className: 'text-neutral-400' })}>
              <pre className={codelist()}>
                {`
linux-chromedriver-v130  →  revision: chrome@130.0.6723.116`.trim()}
              </pre>
            </div>
            <span className={log()}>win32:</span>
            <div className={command({ className: 'text-neutral-400' })}>
              <pre className={codelist()}>
                {`
win32-firefox-dev  →  revision: firefox@130.0`.trim()}
              </pre>
            </div>
            <span className={log()}>win64:</span>
            <div className={command({ className: 'text-neutral-400' })}>
              <pre className={codelist()}>
                {`
win-chrome-beta  →  revision: chrome@131.0.6757.5
windows稳定版     →  revision: chrome@130.0.6723.116`.trim()}
              </pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </Wraper>
)

export default System
