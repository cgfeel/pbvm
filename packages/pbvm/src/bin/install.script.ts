import { detectBrowserPlatform } from '@puppeteer/browsers'
import type { z } from 'zod'
import { install } from '../browser/browser.lock.js'
import { MirrorProvider } from '../mirror/mirror.provider.js'
import { createBrowserSchema } from '../types/index.js'
import { logger } from '../utils/logger.js'
import { checkoutInStore, logCurrentList } from '../utils/manifest.js'
import { baseInfo } from '../utils/paths.js'
import { removeBrowser } from './remove.script.js'

const installBrowserSchema = createBrowserSchema.required({
  alias: true,
  browser: true,
  buildId: true,
})

export async function installBrowser({
  store,
  mirror,
  rule,
  ...opts
}: z.infer<typeof installBrowserSchema>) {
  const { alias, browser, buildId } = opts
  const platform = detectBrowserPlatform()

  const found = await checkoutInStore({ ...opts, platform: platform ?? '' })
  const name = platform ? `${platform}:${browser}@${buildId}` : `${browser}@${buildId}`
  let aliasName = alias

  if (found) {
    logger.success(`Already installed: ${name}`)
  } else {
    logger.info('Start installing the browser to the global cache directory...')
    logger.newline()

    const onInterrupt = async () => {
      logger.newline()
      logger.warn('Installation interrupted, cleaning up incomplete resources...')

      logger.newline()
      await removeBrowser({ focus: true, browser, buildId, platform })

      logger.info('Cleanup complete.')
      logger.newline()
    }

    try {
      const result = await install(
        {
          ...baseInfo,
          downloadProgressCallback: 'default',
          browser,
          buildId,
          platform,
          providers: [new MirrorProvider({ path: mirror, rule })],
        },
        onInterrupt
      )

      if (!aliasName)
        aliasName = result.platform ? `${result.platform}-${result.buildId}` : result.buildId
    } catch (err) {
      // pbInstall reject 时（如下载中途网络断开、SIGINT 导致 socket 关闭）
      // 也需要清理残留的半成品文件
      logger.newline()
      logger.warn('Installation failed, cleaning up incomplete resources...')
      await removeBrowser({ focus: true, browser, buildId, platform }).catch(() => {
        // 清理过程中的二次错误忽略
      })
      logger.info('Cleanup complete.')
      logger.newline()
      const errTarget = err instanceof Error ? err : new Error('Installation failed.')
      throw errTarget
    }

    logger.success(`Installed success: ${name}`)
  }

  if (store) {
    logger.newline()
    return
  }

  const updateCurrent = await logCurrentList({ alias: aliasName, browser, buildId, platform })
  logger.newline()

  if (updateCurrent !== undefined) {
    logger.success(
      updateCurrent === aliasName
        ? `Successfully saved the log to the current directory.`
        : `The log has already been saved, alias is: ${updateCurrent}.`
    )
  } else {
    logger.warn(`Failed to save the log to the current directory.`)
  }

  logger.newline()
}
