import { spawn, type ChildProcess } from 'node:child_process'
import { Browser } from '@puppeteer/browsers'
import type { z } from 'zod'
import { syncSecureExecute } from '../utils/fields.js'
import type { baseConnectionSchema } from './browser.schema.js'

export class DevConnection<T extends typeof baseConnectionSchema> {
  private msgId = 0
  private pending = new Map<number, PendItemType<z.infer<T>>>()
  private ready: Promise<void>
  private schema: T
  private ws: WebSocket
  private name?: string

  constructor({ name, schema, wsEndpoint }: DevConnectionProps<T>) {
    this.name = name
    this.schema = schema
    this.ws = new WebSocket(wsEndpoint)

    this.ready = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout'))
      }, 5_000)

      this.ws.onopen = () => {
        clearTimeout(timeout)
        resolve()
      }

      this.ws.onerror = () => {
        clearTimeout(timeout)
        reject(new Error('WebSocket connection error'))
      }

      this.ws.onmessage = (event: MessageEvent) => {
        const message = JSON.parse(String(event.data)) as unknown
        const { data, success } = this.schema.safeParse(message)
        if (success) {
          const entry = this.pending.get(data.id)
          if (entry) {
            clearTimeout(entry.timer)
            this.pending.delete(data.id)
            entry.resolve(data)
          }
        }
      }
    })
  }

  destroy() {
    this.pending.forEach((entry) => {
      clearTimeout(entry.timer)
    })

    this.pending.clear()
    this.ws.onerror = null
    this.ws.onmessage = null
    this.ws.close()
  }

  async send(method: string, params?: Record<string, unknown>) {
    await this.ready
    const id = ++this.msgId
    return this.enqueue(id, method, { id, method, params })
  }

  // 仅 CDP 支持，在指定 session 上发送命令（flatten 模式下 sessionId 放顶层）。
  async sendToSession(sessionId: string, method: string, params?: Record<string, unknown>) {
    await this.ready
    const id = ++this.msgId
    return this.enqueue(id, method, { id, method, params, sessionId })
  }

  private enqueue(id: number, method: string, params: Record<string, unknown> = {}) {
    return new Promise<z.infer<T>>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`${this.name ?? 'Dev'} command "${method}" timed out`))
      }, 10_000)

      this.pending.set(id, { resolve, timer })
      this.ws.send(JSON.stringify(params))
    })
  }
}

export function captureEndpoint(
  childProcess: ChildProcess,
  { closeTips, outTips, match, timeout = 10_000 }: ConnectActionOpts
) {
  return new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(outTips ?? 'Timeout waiting for endpoint'))
    }, timeout)

    const onData = (chunk: Buffer) => {
      const isMatch = match(chunk)
      if (isMatch) {
        clearTimeout(timer)
        childProcess.stderr?.removeListener('data', onData)
        childProcess.removeListener('close', onClose)
        resolve(isMatch[1])
      }
    }

    const onClose = (code: number | null) => {
      clearTimeout(timer)
      childProcess.stderr?.removeListener('data', onData)

      const codeTips = code !== null ? ` (code: ${code})` : ''
      reject(new Error(`${closeTips ?? 'Browser exited unexpectedly'}${codeTips}`))
    }

    childProcess?.stderr?.on('data', onData)
    childProcess?.on('close', onClose)
  })
}

export async function generateBrowserRuntimeInfo(options: RuntimeOptions) {
  const { task, timeout = 15_000 } = options
  const closeQueue: (() => void)[] = []

  let childProcess: ChildProcess | null = null
  let closed = false

  const cleanup = () => {
    if (closed) return
    closed = true
    closeQueue.forEach((handle) => handle())
  }

  const finallyPush = (call: () => void) => {
    closeQueue.push(() => syncSecureExecute(call))
  }

  // stdio 三个值： stdin [标准输入], stdout [标准输出], stderr [标准错误 - DevTools]
  // ignore: 忽略，pipe: 可读
  const bootstarp: BootstrapType = ({ executablePath, args = [] }) => {
    childProcess = spawn(executablePath, args, {
      stdio: ['ignore', 'ignore', 'pipe'],
    })
    return childProcess
  }

  finallyPush(() => childProcess?.kill())

  const taskPromise = task(bootstarp, finallyPush)
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error('Timeout to get browser runtime info.'))
    }, timeout)
    taskPromise.finally(() => clearTimeout(timer))
  })

  try {
    return await Promise.race([taskPromise, timeoutPromise])
  } finally {
    cleanup()
  }
}

export function getExtraArgs(browser: Browser, profileDir: string) {
  return browser === Browser.FIREFOX
    ? ['--profile', profileDir]
    : ['--no-sandbox', `--user-data-dir=${profileDir}`]
}

export interface LaunchOptions extends Omit<RuntimeOptions, 'task'> {
  executablePath: string
  /** 额外的启动参数（不应包含 headless、remote-debugging 等框架控制的参数） */
  args?: string[]
}

export interface RuntimeOptions {
  timeout?: number
  task: (boot: BootstrapType, push: (call: () => void) => void) => Promise<Record<string, unknown>>
}

export interface ShellEnvironment extends Pick<
  Navigator,
  | 'cookieEnabled'
  | 'deviceMemory'
  | 'hardwareConcurrency'
  | 'language'
  | 'languages'
  | 'maxTouchPoints'
  | 'platform'
  | 'userAgent'
  | 'webdriver'
> {
  screen: Pick<Window['screen'], 'colorDepth' | 'height' | 'pixelDepth' | 'width'>
  timezone: string
  userAgentData?: null | HighEntropyRecord<
    'architecture' | 'bitness' | 'fullVersionList' | 'model' | 'platformVersion'
  >
  webgl: null | {
    renderer: string
    vendor: string
  }
}

export type BootstrapType = (args: Omit<LaunchOptions, 'task'>) => ChildProcess

interface DevConnectionProps<T extends typeof baseConnectionSchema> {
  wsEndpoint: string
  schema: T
  name?: string
}

type ConnectActionOpts = {
  match: (chunk: Buffer) => RegExpMatchArray | null
  closeTips?: string
  outTips?: string
  timeout?: number
}

type PendItemType<T extends Record<PropertyKey, unknown>> = {
  timer: ReturnType<typeof setTimeout>
  resolve: (value: T) => void
}
