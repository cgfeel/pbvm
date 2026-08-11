import Vite from '@site/static/img/vite-light.svg'
import Webpack from '@site/static/img/webpack.svg'
import type { FC } from 'react'
import { tv } from 'tailwind-variants'
import { t } from '../../utils/i18n'
import CodeCard from './CodeCard'

const CODE_RECORD = {
  create_alias: t('home.script.create_alias'),
  info: t('home.script.info'),
  ls: t('home.script.ls'),
  open_alias: t('home.script.open_alias'),
  search: t('home.script.search'),
}

const INSTALL_CODE = `# npm
npm install -g pbvm-cli

# pnpm
pnpm add -g pbvm-cli`

const QUICKSTART_CODE = `# ${CODE_RECORD.create_alias}
pbvm create -b chrome -i 134.0.6998.35 -a prod

# ${CODE_RECORD.ls}
pbvm ls

# ${CODE_RECORD.open_alias}
pbvm open -t prod

# ${CODE_RECORD.info}
pbvm info -t prod -r

# ${CODE_RECORD.search}
pbvm search -b firefox -i stable_136.0.0`

const VITE_CODE = `// vite.config.ts
import { defineConfig } from 'vite'
import { openBrowser } from 'pbvm-cli'

export default defineConfig({
  plugins: [
    {
      name: 'pbvm-open',
      configureServer(server) {
        server.httpServer?.once('listening', () => {
          const { port, host } = server.config.server
          const isHttps = server.config.server.https !== false
          const protocol = isHttps ? 'https' : 'http'
          const url = \`\${protocol}://\${host || 'localhost'}:\${port}\`
          openBrowser({ target: 'my-chrome', url })
        })
      },
    },
  ],
})`

const WEBPACK_CODE = `import { openBrowser } from 'pbvm-cli'

devServer: {
  onAfterSetupMiddleware(devServer) {
    const { host, port, server } = devServer.options
    const isHttps = typeof server === 'string'
      ? server === 'https'
      : server?.type === 'https'
    const protocol = isHttps ? 'https' : 'http'
    const url = \`\${protocol}://\${host || 'localhost'}:\${port}\`
    openBrowser({ target: 'my-chrome', url })
  }
}`

const PACKAGES_CODE = `// package.json
{
  "scripts": {
    "dev:browser": "npm run dev && pbvm open -t my-chrome -u http://localhost:3000"
  }
}`

const styles = tv({
  slots: {
    icon: 'flex gap-6',
    script: 'flex flex-col gap-12',
    tag: 'flex justify-center items-center [&_svg]:h-4 bg-black w-25 h-7 rounded-sm py-0.5 px-2 box-border dark:bg-transparent',
  },
})

const { icon, script, tag } = styles()

export const BuildScript: FC = () => [
  <div key="icon" className={icon()}>
    <span className={tag()}>
      <Vite />
    </span>
    <span className={tag({ className: '[&_svg]:h-6' })}>
      <Webpack />
    </span>
  </div>,
  <div key="script" className={script()}>
    <CodeCard title="vite:">{VITE_CODE}</CodeCard>
    <CodeCard title="webpack:">{WEBPACK_CODE}</CodeCard>
    <CodeCard title="packages (optional):">{PACKAGES_CODE}</CodeCard>
  </div>,
]

export const CreateScript: FC = () => (
  <div className={script()}>
    <CodeCard title={t('home.script.install')}>{INSTALL_CODE}</CodeCard>
    <CodeCard title={t('home.script.common')}>{QUICKSTART_CODE}</CodeCard>
  </div>
)
