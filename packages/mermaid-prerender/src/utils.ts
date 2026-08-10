import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Worker } from 'node:worker_threads'
import type { RenderOptions, RenderResult } from 'mermaid-isomorphic'
import type { CompilerMode, MermaidTheme, TargetType, WorkerMessage } from './types.js'

let worker: Worker | null = null
let nextId = 0

const pending = new Map<string, (res: MessageType) => void>()
function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./worker.js', import.meta.url))
    worker.unref()
    worker.on('message', (msg: MessageType) => {
      const resolve = pending.get(msg.id)
      if (resolve) {
        pending.delete(msg.id)
        resolve(msg)
      }
    })
  }
  return worker
}

function send(msg: Omit<WorkerMessage, 'id'>) {
  return new Promise<MessageType>((resolve) => {
    const id = String(++nextId)
    pending.set(id, resolve)
    getWorker().postMessage({ id, ...msg })
  })
}

export const DEFAULT_THEMES: MermaidTheme[] = [
  { name: 'light', theme: 'default' },
  { name: 'dark', theme: 'dark' },
]

// 目前通过编译为 svg 文件，不做服务端渲染，后期有需要再看，但 dev 环境是肯定不处理的，需要实时修改反馈
export function allowProcess(options: { mode?: CompilerMode; target?: TargetType }) {
  const { mode, target } = options
  const isProd = mode === 'production' || process.env.NODE_ENV === 'production'

  const isServer = target === 'node' || (Array.isArray(target) && target.includes('node'))
  return isProd && !isServer
}

export async function closeWorker() {
  if (worker) {
    await worker.terminate()
    worker = null
  }
}

export async function getRenderer() {
  return (diagrams: string[], opts?: RenderOptions) => {
    const theme = opts?.mermaidConfig?.theme ?? 'default'
    return Promise.allSettled(
      diagrams.map((source) => {
        return send({ payload: { source, theme } }).then((res) => {
          if ('error' in res) throw new Error(res.error)
          return res
        })
      })
    )
  }
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

type MessageType =
  | {
      id: string
      error: string
    }
  | RenderResult
