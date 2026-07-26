import { detectBrowserPlatform, getInstalledBrowsers, install } from '@puppeteer/browsers'
import type { BrowserResultType } from '../types/index.js'
import { logger } from '../utils/logger.js'
import { logCurrentList, logStoreList } from '../utils/manifest.js'
import { PBVM_PATHS } from '../utils/paths.js'

const baseInfo = { cacheDir: PBVM_PATHS.cache }

export async function installBrowser(ops: BrowserResultType) {
  const { alias, browser, buildId } = ops
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

    const result = await install({
      ...baseInfo,
      downloadProgressCallback: 'default',
      browser,
      buildId,
      platform,
    })

    if (!aliasName)
      aliasName = result.platform ? `${result.platform}-${result.buildId}` : result.buildId

    logger.success(`Installed success: ${name}`)
  }

  // 之前写入过也返回正常 true
  const updateStore = await logStoreList({ browser, buildId, platform })
  const updateCurrent = await logCurrentList({ alias: aliasName, browser, buildId, platform })

  logger.newline()
  if (updateStore) {
    logger.success(`Successfully saved the log to the store.`)
  } else {
    logger.warn(`Failed to save the log to the store.`)
  }

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
