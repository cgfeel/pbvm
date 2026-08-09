import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Worker } from 'node:worker_threads'
import type { RenderOptions, RenderResult } from 'mermaid-isomorphic'
import type { WorkerMessage } from './types.js'

type MessageType =
  | {
      id: string
      error: string
    }
  | RenderResult

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

export function closeWorker() {
  worker?.terminate()
  worker = null
}

function send(msg: Omit<WorkerMessage, 'id'>) {
  return new Promise<MessageType>((resolve) => {
    const id = String(++nextId)
    pending.set(id, resolve)
    getWorker().postMessage({ id, ...msg })
  })
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
