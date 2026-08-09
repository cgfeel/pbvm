import { parentPort } from 'node:worker_threads'
import { createMermaidRenderer, type MermaidRenderer } from 'mermaid-isomorphic'
import type { WorkerMessage } from './types.js'

let renderer: MermaidRenderer | null = null
parentPort?.on('message', async ({ id, payload }: WorkerMessage) => {
  if (!renderer) {
    const launchOptions =
      (process.env.CI
        ? { executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox'] }
        : undefined) ??
      (process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : undefined)

    renderer = createMermaidRenderer(launchOptions ? { launchOptions } : undefined)
  }

  try {
    const [result] = await renderer([payload.source], { mermaidConfig: { theme: payload.theme } })
    if (result.status === 'fulfilled') {
      parentPort?.postMessage({ ...result.value, id })
    } else {
      parentPort?.postMessage({
        error: result.reason instanceof Error ? result.reason.message : String(result.reason),
        id,
      })
    }
  } catch (err) {
    parentPort?.postMessage({
      error: err instanceof Error ? err.message : String(err),
      id,
    })
  }
})
