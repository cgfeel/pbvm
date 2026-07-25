import { detectBrowserPlatform, getInstalledBrowsers, install } from '@puppeteer/browsers'
import type { CreateResult } from '../types/index.js'
import { logger } from '../utils/logger.js'
import { BROWSER_CACHE_DIR } from '../utils/paths.js'
import { logStoreList } from '../utils/pkg.js'

const baseInfo = { cacheDir: BROWSER_CACHE_DIR }

export async function installBrowser(ops: CreateResult) {
  const { browser, buildId, platform = detectBrowserPlatform() } = ops
  const installed = await getInstalledBrowsers(baseInfo)
  const found = installed.find(
    (item) => item.browser === browser && item.buildId === buildId && item.platform === platform
  )

  const name = platform ? `${platform}:${browser}@${buildId}` : `${browser}@${buildId}`
  if (found) {
    logger.success(`Already installed: ${name}`)
    return
  }

  logger.info('Start installing the browser to the global cache directory...')
  logger.newline()

  await install({
    ...baseInfo,
    downloadProgressCallback: 'default',
    browser,
    buildId,
    platform,
  })

  logger.success(`Installed success: ${name}`)
  logger.newline()

  const update = await logStoreList({ browser, buildId, platform })
  if (update) {
    logger.success(`Log to store browserlist success.`)
  } else {
    logger.warn(`Log to store browserlist faild.`)
  }
}
