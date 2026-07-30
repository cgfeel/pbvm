import fs from 'node:fs/promises'
import path from 'node:path'
import { detectBrowserPlatform, uninstall } from '@puppeteer/browsers'
import type { RemoveBrowserOpts } from '../types/index.js'
import { logger } from '../utils/logger.js'
import { filterCurrentList } from '../utils/manifest.js'
import { baseInfo, PBVM_PATHS } from '../utils/paths.js'
import { clearBrowser } from './clear.script.js'

const deleteBrowser = async ({ browser, buildId, platform }: RemoveBrowserOpts) => {
  if (platform) {
    try {
      logger.info('Start deleting the browser')
      await uninstall({ ...baseInfo, browser, buildId, platform })
    } catch {
      logger.newline()
      logger.warn('Failed to delete the browser')
    }
  }

  try {
    const browserRoot = path.join(PBVM_PATHS.cache, browser)
    const files = await fs.readdir(browserRoot)
    for (const file of files) {
      if (file.startsWith(`${buildId}-`)) {
        await fs.rm(path.join(browserRoot, file), { recursive: true, force: true })
      }
    }
  } catch {
    logger.newline()
    logger.warn('Failed to delete the browser installation package')
  }

  logger.newline()
}

export async function removeBrowser(options: RemoveBrowserOpts) {
  const { focus, store, platform = detectBrowserPlatform() } = options
  if (focus) {
    await deleteBrowser({ ...options, platform })
    await clearBrowser(options)
  }

  if (!store && platform) {
    await filterCurrentList({ ...options, platform })
    logger.success('Update browserlist success.')
    logger.newline()
    return
  }

  if (focus) {
    logger.success('The browser has been successfully deleted.')
    logger.newline()
  } else {
    logger.info('Nothing has been deleted')
    logger.newline()
  }
}
