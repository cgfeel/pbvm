import type { FC } from 'react'
import { tv } from 'tailwind-variants'
import { Card, CardBody, CardHeader } from '../card'

const styles = tv({
  slots: {
    command: 'text-slate-200',
    dot: 'size-2.5 rounded-full',
    log: 'text-neutral-400',
    process: 'text-neutral-600',
    title: 'ml-2 text-white/35 text-xs',
  },
  variants: {
    size: {
      xs: {
        command: 'text-xs',
        log: 'text-xs',
      },
    },
  },
})

const { command, dot, log, process, title } = styles()

const Terminal: FC = () => (
  <Card>
    <CardHeader>
      <span className={dot({ className: 'bg-[#ff5f56]' })} />
      <span className={dot({ className: 'bg-[#ffbd2e]' })} />
      <span className={dot({ className: 'bg-[#27c93f]' })} />
      <span className={title()}>Terminal</span>
    </CardHeader>
    <CardBody>
      <div>
        <span className={log()}>$ </span>
        <span className={command()}>pbvm create -b chrome -i 134.0.6998.35 -a prod</span>
      </div>
      <div>
        <span className={process()}># Downloading Chrome 134.0.6998.35...</span>
      </div>
      <div>
        <span className={log()}>✅ Installed success: mac_arm:chrome@134.0.6998.35</span>
      </div>
      <div>
        <span className={log()}>✅ Successfully saved the log to the current directory.</span>
      </div>
      <div className="mt-2">
        <span className={log()}>$ </span>
        <span className={command()}>pbvm open -t prod</span>
      </div>
      <div>
        <span className={log()}>✅ Browser opened successfully.</span>
      </div>
    </CardBody>
  </Card>
)

export { styles }

export default Terminal
