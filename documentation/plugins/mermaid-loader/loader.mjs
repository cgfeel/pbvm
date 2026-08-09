import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createMermaidRenderer } from 'mermaid-isomorphic'

{
  const root = process.cwd()
  const envPath = join(root, '.env')
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const idx = trimmed.indexOf('=')
      if (idx === -1) continue

      const key = trimmed.slice(0, idx).trim()
      if (!process.env[key]) {
        process.env[key] = trimmed.slice(idx + 1).trim()
      }
    }
  }
}

let renderer = null
const launchOptions =
  (process.env.CI
    ? { executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox'] }
    : undefined) ??
  (process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : undefined)

function getRenderer() {
  if (!renderer) renderer = createMermaidRenderer(launchOptions ? { launchOptions } : undefined)
  return renderer
}

function hashString(str = '') {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i)
    hash = hash >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

export default function mermaidLoader(source) {
  const callback = this.async()
  const hash = hashString(source.trim())

  const isProd = this.mode === 'production' || process.env.NODE_ENV === 'production'
  if (!isProd) {
    callback(null, `export default ${JSON.stringify(source)}`)
    return
  }

  const renderer = getRenderer()
  Promise.all([
    renderer([source], { mermaidConfig: { theme: 'default' } }),
    renderer([source], { mermaidConfig: { theme: 'dark' } }),
  ])
    .then(([light, dark]) => {
      if (dark[0].status === 'fulfilled') {
        this.emitFile(`mermaid/index/${hash}-dark.svg`, dark[0].value.svg)
      }
      if (light[0].status === 'fulfilled') {
        this.emitFile(`mermaid/index/${hash}.svg`, light[0].value.svg)
        callback(null, `export default ${JSON.stringify(`/mermaid/index/${hash}.svg`)}`)
        return
      }
      return Promise.reject(
        light[0].reason instanceof Error ? light[0].reason : new Error('parse svg failed')
      )
    })
    .catch((err) => {
      console.error('[mermaid-loader] render error:', err.message)
      callback(null, `export default ${JSON.stringify(source)}`)
    })
}

mermaidLoader.raw = true
