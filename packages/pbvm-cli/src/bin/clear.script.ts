import fs from 'node:fs/promises'
import type { RemoveBrowserOpts } from '../types/index.js'
import { logger } from '../utils/logger.js'
import { getProfileDir } from '../utils/paths.js'

export async function clearBrowser({
  browser,
  buildId,
}: Pick<RemoveBrowserOpts, 'browser' | 'buildId'>) {
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
  }
}
