import fs from 'node:fs/promises'
import path from 'node:path'
import { detectBrowserPlatform, uninstall } from '@puppeteer/browsers'
import type { z } from 'zod'
import { removeResultSchema } from '../types/index.js'
import { logger } from '../utils/logger.js'
import { filterCurrentList } from '../utils/manifest.js'
import { baseInfo, getProfileDir, PBVM_PATHS } from '../utils/paths.js'

const removeBrowserSchema = removeResultSchema.required({ browser: true, buildId: true })
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

const deleteProfile = async ({ browser, buildId }: RemoveBrowserOpts) => {
  const profileDir = getProfileDir(browser, buildId)
  try {
    logger.info('Start cleaning up the profile directory.')
    logger.newline()

    await fs.rm(profileDir, {
      force: true,
      maxRetries: 5,
      recursive: true,
      retryDelay: 200,
    })

    logger.success('The profile directory has been deleted.')
    logger.newline()
  } catch {
    logger.warn('Failed to delete the profile directory')
    logger.newline()
    // throw error instanceof Error ? error : new Error('Failed to delete the profile directory')
  }
}

export async function removeBrowser(options: RemoveBrowserOpts) {
  const { focus, store, platform = detectBrowserPlatform() } = options
  if (focus) {
    await deleteBrowser({ ...options, platform })
    await deleteProfile({ ...options, platform })
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

type RemoveBrowserOpts = z.infer<typeof removeBrowserSchema>
