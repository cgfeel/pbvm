import fs from 'node:fs/promises'
import path from 'node:path'
import { detectBrowserPlatform, uninstall } from '@puppeteer/browsers'
import type { z } from 'zod'
import { removeResultSchema } from '../types/index.js'
import { logger } from '../utils/logger.js'
import { filterCurrentList } from '../utils/manifest.js'
import { baseInfo, PBVM_PATHS } from '../utils/paths.js'

const removeBrowserSchema = removeResultSchema.required({ browser: true, buildId: true })
const deleteBrowser = async ({
  browser,
  buildId,
  platform,
}: z.infer<typeof removeBrowserSchema>) => {
  if (platform) {
    try {
      logger.info('Start deleting the browser')
      await uninstall({ ...baseInfo, browser, buildId, platform })
    } catch {
      // nothing
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
    // nothine
  }

  logger.newline()
}

export async function removeBrowser(options: z.infer<typeof removeBrowserSchema>) {
  const platform = options.platform ?? detectBrowserPlatform()
  if (options.focus) {
    await deleteBrowser({ ...options, platform })
  }

  logger.info('Start to update browserlist.')
  logger.newline()

  if (platform) {
    await filterCurrentList({ ...options, platform })
  }

  logger.info('Update browserlist success.')
  logger.newline()
}
