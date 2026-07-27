import { detectBrowserPlatform, getInstalledBrowsers, install } from '@puppeteer/browsers'
import type { BrowserResultType } from '../types/index.js'
import { logger } from '../utils/logger.js'
import { logCurrentList } from '../utils/manifest.js'
import { baseInfo } from '../utils/paths.js'
import { removeBrowser } from './remove.script.js'

export async function installBrowser({ alias, browser, buildId }: BrowserResultType) {
  const platform = detectBrowserPlatform()
  const installed = await getInstalledBrowsers(baseInfo)
  const found = installed.find(
    (item) => item.browser === browser && item.buildId === buildId && item.platform === platform
  )

  const name = platform ? `${platform}:${browser}@${buildId}` : `${browser}@${buildId}`
  let aliasName = alias

  if (found) {
    logger.success(`Already installed: ${name}`)
  } else {
    logger.info('Start installing the browser to the global cache directory...')
    logger.newline()

    let isInstalled = false
    const onInterrupt = async () => {
      if (isInstalled) return
      logger.newline()
      logger.warn('Installation interrupted, cleaning up incomplete resources...')
      logger.newline()
      await removeBrowser({ focus: true, browser, buildId, platform })
      logger.info('Cleanup complete.')
      logger.newline()
      process.exit(1)
    }

    process.once('SIGINT', onInterrupt)
    process.once('SIGTERM', onInterrupt)

    try {
      const result = await install({
        ...baseInfo,
        downloadProgressCallback: 'default',
        browser,
        buildId,
        platform,
      })

      isInstalled = true
      if (!aliasName)
        aliasName = result.platform ? `${result.platform}-${result.buildId}` : result.buildId
    } catch (err) {
      const errTarget = err instanceof Error ? err : new Error('Installation failed.')
      throw errTarget
    } finally {
      process.off('SIGINT', onInterrupt)
      process.off('SIGTERM', onInterrupt)
    }

    logger.success(`Installed success: ${name}`)
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
