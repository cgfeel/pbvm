import { detectBrowserPlatform } from '@puppeteer/browsers'
import type { z } from 'zod'
import { install } from '../browser/browser.lock.js'
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

export async function installBrowser({ store, ...opts }: z.infer<typeof installBrowserSchema>) {
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
        },
        onInterrupt
      )

      if (!aliasName)
        aliasName = result.platform ? `${result.platform}-${result.buildId}` : result.buildId
    } catch (err) {
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
