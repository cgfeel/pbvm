import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { CreateMermaidRendererOptions, MermaidRenderer } from 'mermaid-isomorphic'

const nativeImport = new Function('specifier', 'return import(specifier)') as (
  specifier: string
) => Promise<{ createMermaidRenderer: (options?: CreateMermaidRendererOptions) => MermaidRenderer }>

let renderer: MermaidRenderer | null = null
export async function getRenderer() {
  if (!renderer) {
    const { createMermaidRenderer } = await nativeImport('mermaid-isomorphic')
    const launchOptions =
      (process.env.CI
        ? { executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox'] }
        : undefined) ??
      (process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : undefined)
    renderer = createMermaidRenderer(launchOptions ? { launchOptions } : undefined)
  }
  return renderer
}

/**
 * djb2 32-bit hash — Node.js 与浏览器行为完全一致。
 * 组件里有一份相同的实现，两边同步。
 */
export function hashString(str: string) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i)
    hash = hash >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

// 加载本地 .env（gitignored），不依赖 Node --env-file 参数
export function loadDotEnv(root: string) {
  const systemKeys = new Set(Object.keys(process.env))
  function parse(filepath: string) {
    if (existsSync(filepath)) {
      for (const line of readFileSync(filepath, 'utf-8').split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue

        const idx = trimmed.indexOf('=')
        if (idx === -1) continue

        const key = trimmed.slice(0, idx).trim()
        if (!systemKeys.has(key)) {
          process.env[key] = trimmed.slice(idx + 1).trim()
        }
      }
    }
  }

  parse(join(root, '.env'))
  parse(join(root, '.env.local'))
}
