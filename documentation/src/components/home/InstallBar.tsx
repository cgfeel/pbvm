import { copyText } from '@site/src/utils/copyText'
import { useRef, useState, type FC } from 'react'
import { tv } from 'tailwind-variants'
import { Card } from '../card'

const PKG_MANAGERS = [
  { key: 'npm', label: 'npm', cmd: 'npm install -g pbvm-cli' },
  { key: 'pnpm', label: 'pnpm', cmd: 'pnpm add -g pbvm-cli' },
  { key: 'npx', label: 'npx', cmd: 'npx pbvm-cli create' },
] as const

const style = tv({
  slots: {
    btn: 'shrink-0 py-[0.3rem] px-[0.6rem] border border-white/15 rounded-md bg-white/6 text-white/50 hover:bg-white/12 hover:text-white',
    cmd: 'flex items-center justify-between gap-3 py-3 px-4',
    code: 'text-sm text-[#e2e8f0] whitespace-nowrap overflow-x-auto bg-transparent',
    item: 'flex-1 py-2 px-4 border-0 bg-transparent text-white/40 font-medium uppercase tracking-[0.04em] hover:text-white/70',
    tabs: 'flex border-b',
    wrap: 'mt-4',
  },
  variants: {
    active: {
      true: {
        item: 'text-white shadow-[inset_0_-2px_0_#fff]',
      },
    },
  },
  compoundSlots: [
    {
      slots: ['tabs', 'wrap'],
      class: 'border-white/8',
    },
    {
      slots: ['code', 'item'],
      class: 'font-code',
    },
    {
      slots: ['btn', 'item'],
      class: 'cursor-pointer text-[0.8rem] transition-all duration-150',
    },
  ],
})

const { btn, cmd, code, item, tabs, wrap } = style()

const InstallBar: FC = () => {
  const timeRef = useRef<ReturnType<typeof setTimeout>>(null)
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)

  return (
    <Card className={wrap()}>
      <div className={tabs()}>
        {PKG_MANAGERS.map((pkg, i) => (
          <button
            key={pkg.key}
            type="button"
            className={item({ active: i === active })}
            onClick={() => setActive(i)}
          >
            {pkg.label}
          </button>
        ))}
      </div>
      <div className={cmd()}>
        <code className={code()}>{PKG_MANAGERS[active].cmd}</code>
        <button
          type="button"
          className={btn()}
          onClick={() => copyText(PKG_MANAGERS[active].cmd).then(setCopied)}
          onMouseEnter={() => {
            if (timeRef.current) {
              clearTimeout(timeRef.current)
              timeRef.current = null
            }
          }}
          onMouseLeave={() => {
            timeRef.current = setTimeout(() => setCopied(false), 500)
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </Card>
  )
}

export default InstallBar
