import type { FC } from 'react'
import { tv } from 'tailwind-variants'

const styles = tv({
  slots: {
    body: 'py-5 px-6 text-sm leading-[1.8] overflow-x-auto',
    dot: 'size-2.5 rounded-full',
    title: 'ml-2 text-white/35 text-xs',
    topbar: 'flex items-center gap-1.5 py-3 px-4 bg-white/4 border-b border-white/6',
    wrap: 'relative z-1 w-full rounded-xl overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_20px_60px_-20px_rgba(0,0,0,0.15)] bg-[#1a1a1a] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_60px_-20px_rgba(0,0,0,0.5)] dark:bg-[#111]',
  },
  compoundSlots: [
    {
      slots: ['body', 'title'],
      class: 'font-code text-left',
    },
  ],
})

const { body, dot, title, topbar, wrap } = styles()

const Terminal: FC = () => (
  <div className={wrap()}>
    <div className={topbar()}>
      <span className={dot({ className: 'bg-[#ff5f56]' })} />
      <span className={dot({ className: 'bg-[#ffbd2e]' })} />
      <span className={dot({ className: 'bg-[#27c93f]' })} />
      <span className={title()}>Terminal</span>
    </div>
    <div className={body()}>
      <div>
        <span className="text-neutral-400">$ </span>
        <span className="text-slate-200">pbvm create -b chrome -i 134.0.6998.35 -a prod</span>
      </div>
      <div>
        <span className="text-neutral-600"># Downloading Chrome 134.0.6998.35...</span>
      </div>
      <div>
        <span className="text-neutral-400">✅ Installed success: mac_arm:chrome@134.0.6998.35</span>
      </div>
      <div>
        <span className="text-neutral-400">
          ✅ Successfully saved the log to the current directory.
        </span>
      </div>
      <div className="mt-2">
        <span className="text-neutral-400">$ </span>
        <span className="text-slate-200">pbvm open -t prod</span>
      </div>
      <div>
        <span className="text-neutral-400">✅ Browser opened successfully.</span>
      </div>
    </div>
  </div>
)

export default Terminal
