import {
  captureEndpoint,
  DevConnection,
  generateBrowserRuntimeInfo,
  type ShellEnvironment,
  type LaunchOptions,
  type RuntimeOptions,
} from './base.browser.js'
import {
  capabilitiesSchema,
  firefoxConnectionSchema,
  innerResultSchema,
  type RemoteValue,
} from './browser.schema.js'
import { buildEnvScript } from './buildEnvScript.js'

function fromRemoteValue(item: RemoteValue): unknown {
  switch (item.type) {
    case 'array':
      return item.value.map(fromRemoteValue)
    case 'bigint':
      return BigInt(item.value)
    case 'boolean':
    case 'number':
    case 'string':
      return item.value
    case 'object':
    case 'map':
      return Object.fromEntries(item.value.map(([key, val]) => [key, fromRemoteValue(val)]))
    case 'null':
      return null
    case 'set':
      return new Set(item.value.map(fromRemoteValue))
    default:
      return undefined
  }
}

/**
 * 使用 Firefox headless + WebDriver BiDi 获取浏览器运行时信息。
 * 兼容任意 Firefox 版本。
 */
export async function getFirefoxRuntimeInfo(options: LaunchOptions) {
  const { args = [], executablePath, timeout } = options
  const browserArgs = ['-headless', '--remote-debugging-port=0', ...args, 'about:blank']

  const task: RuntimeOptions['task'] = async (boot) => {
    const childProcess = boot({ args: browserArgs, executablePath })
    const wsEndpoint = await captureEndpoint(childProcess, {
      closeTips: 'Firefox exited unexpectedly',
      outTips: 'Timeout waiting for Firefox WebDriver BiDi endpoint',
      match: (chunk) => chunk.toString().match(/WebDriver BiDi listening on (ws:\/\/[^\s]+)/),
    })

    // 链接 BiDi
    const bidi = new DevConnection({
      name: 'BiDi',
      schema: firefoxConnectionSchema,
      wsEndpoint: `${wsEndpoint}/session`,
    })

    try {
      // 1. 创建 WebDriver session
      const sessionResult = await bidi.send('session.new', {
        capabilities: {
          alwaysMatch: { acceptInsecureCerts: true },
        },
      })

      if (sessionResult.error) {
        throw new Error(`session.new failed: ${sessionResult.error}`)
      }

      const { capabilities } = capabilitiesSchema.parse(sessionResult.result)
      const version = capabilities?.browserVersion ?? ''

      // 2. 创建 browsing context
      const ctxResult = await bidi.send('browsingContext.create', { type: 'tab' })
      if (ctxResult.error) {
        throw new Error(`browsingContext.create failed: ${ctxResult.error}`)
      }

      const contextId = String(ctxResult.result?.context ?? '')

      // 3. 执行环境采集脚本
      const evalResult = await bidi.send('script.evaluate', {
        awaitPromise: true,
        expression: `(${buildEnvScript.toString()})()`,
        target: { context: contextId },
      })

      if (evalResult.error) {
        throw new Error(`script.evaluate failed: ${evalResult.error}`)
      }

      const innerResult = innerResultSchema.parse(evalResult.result)
      if (innerResult.type === 'exception') {
        throw new Error(`script.evaluate exception: ${innerResult.exceptionDetails?.text}`)
      }

      if (!innerResult.result) {
        throw new Error('script.evaluate returned no value')
      }

      // 直接断言，这个数据已经通过浏览器匹配过了，层级很深，不要再用 zod 校验了
      const envValue = fromRemoteValue(innerResult.result) as ShellEnvironment | undefined
      if (!envValue) {
        throw new Error('Failed to convert evaluate result')
      }

      // 4. 关闭浏览器
      await bidi.send('browser.close')
      bidi.destroy()

      return {
        environment: envValue,
        pid: childProcess.pid ?? null,
        spawnfile: executablePath,
        version,
        wsEndpoint,
      }
    } finally {
      bidi.destroy()
    }
  }

  return await generateBrowserRuntimeInfo({ timeout, task })
}
