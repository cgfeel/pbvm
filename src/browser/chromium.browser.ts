import { createServer } from 'node:http'
import { syncSecureExecute } from '../utils/fields.js'
import {
  captureEndpoint,
  DevConnection,
  generateBrowserRuntimeInfo,
  type LaunchOptions,
  type RuntimeOptions,
  type ShellEnvironment,
} from './base.browser.js'
import { chromiumConnectionSchema, sessionIdSchema, targetInfosSchema } from './browser.schema.js'
import { buildEnvScript } from './buildEnvScript.js'

const startLocalhost = () => {
  const server = createServer((_, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('<html><body></body></html>')
  })

  return new Promise<[typeof server | null, string]>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (address && typeof address === 'object') {
        resolve([server, `http://127.0.0.1:${address.port}`])
      } else {
        syncSecureExecute(() => server.close())
        resolve([null, ''])
      }
    })

    server.on('error', () => {
      syncSecureExecute(() => server.close())
      resolve([null, ''])
    })
  })
}

/**
 * 使用 Chrome headless 命令行 + WebSocket CDP 获取浏览器运行时信息。
 * 不依赖 puppeteer-core，兼容任意 Chrome 版本。
 *
 * 流程：--headless=new + about:blank 启动（稳定），
 * CDP 连接后 Page.navigate 到 localhost 获取 secure context（使 userAgentData 可用）。
 */
export async function getChromiumRuntimeInfo(options: LaunchOptions) {
  const { args = [], executablePath, timeout } = options

  // --headless=new 与 --user-data-dir 在旧版 Chrome（≤114）上可能导致无输出，
  // 过滤掉后 Chrome 会自动使用临时目录，对 info 采集无影响
  const browserArgs = [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=0',
    ...args.filter((a) => !a.startsWith('--user-data-dir')),
    'about:blank',
  ]

  const task: RuntimeOptions['task'] = async (boot, closePush) => {
    const childProcess = boot({ args: browserArgs, executablePath })
    const wsEndpoint = await captureEndpoint(childProcess, {
      closeTips: 'Chrome exited unexpectedly',
      outTips: 'Timeout waiting for Chrome DevTools endpoint',
      match: (chunk) => chunk.toString().match(/DevTools listening on (ws:\/\/[^\s]+)/),
    })

    const [server, localhost] = await startLocalhost()
    if (server) closePush(() => server.close())

    const cdp = new DevConnection({
      name: 'CDP',
      schema: chromiumConnectionSchema,
      wsEndpoint,
    })

    try {
      // 1. 获取 CDP 版本信息
      const versionResult = await cdp.send('Browser.getVersion')
      if (versionResult.error) {
        throw new Error(`Browser.getVersion failed: ${versionResult.error.message}`)
      }

      // 2. 找到 page target
      const targetsResult = await cdp.send('Target.getTargets')
      if (targetsResult.error) {
        throw new Error(`Target.getTargets failed: ${targetsResult.error.message}`)
      }

      const { targetInfos } = targetInfosSchema.parse(targetsResult.result ?? {})
      const pageTarget = targetInfos?.find((t) => t.type === 'page')
      if (!pageTarget) throw new Error('No page target found')

      // 3. Attach 到 page target (flatten 模式)
      const attachResult = await cdp.send('Target.attachToTarget', {
        targetId: pageTarget.targetId,
        flatten: true,
      })

      if (attachResult.error) {
        throw new Error(`Target.attachToTarget failed: ${attachResult.error.message}`)
      }

      const { sessionId } = sessionIdSchema.parse(attachResult.result)

      // 4. 导航到 localhost（secure context → userAgentData 可用）
      if (localhost) {
        try {
          await cdp.sendToSession(sessionId, 'Page.enable')
          await cdp.sendToSession(sessionId, 'Page.navigate', { url: localhost })

          // 等待页面加载完成
          await new Promise((resolve) => setTimeout(resolve, 1000))
        } catch {
          // 导航失败，继续用 about:blank
        }
      }

      // 5. 执行环境采集脚本（awaitPromise 处理 async 函数）
      const evalResult = await cdp.sendToSession(sessionId, 'Runtime.evaluate', {
        expression: `(${buildEnvScript.toString()})()`,
        returnByValue: true,
        awaitPromise: true,
      })

      if (evalResult.error) {
        throw new Error(`Runtime.evaluate failed: ${evalResult.error.message}`)
      }

      // 直接断言，这个数据已经通过浏览器匹配过了，层级很深，不要再用 zod 校验了
      const envValue = evalResult.result?.result as { value?: ShellEnvironment } | undefined
      if (!envValue?.value) throw new Error('Runtime.evaluate returned no value')

      const environment = envValue.value

      // 6. 关闭浏览器
      await cdp.send('Browser.close')
      cdp.destroy()

      // 从 CDP product 提取版本号
      const product = versionResult.result?.product
      const versionMath = product ? String(product).match(/\/([\d.]+)/) : null
      const version = versionMath ? versionMath[1] : ''

      return {
        cdp: {
          jsVersion: String(versionResult.result?.jsVersion ?? ''),
          product: String(versionResult.result?.product ?? ''),
          revision: String(versionResult.result?.revision ?? ''),
        },
        pid: childProcess.pid ?? null,
        spawnfile: executablePath,
        environment,
        version,
        wsEndpoint,
      }
    } finally {
      cdp.destroy()
    }
  }

  return await generateBrowserRuntimeInfo({ timeout, task })
}
