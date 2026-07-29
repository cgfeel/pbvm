import { spawn } from 'node:child_process'
import type { z } from 'zod'
import { getExtraArgs } from '../browser/base.browser.js'
import { openBrowserSchema, globalResultSchema } from '../types/index.js'
import { logger } from '../utils/logger.js'
import { checkoutInStore } from '../utils/manifest.js'
import { getProfileDir } from '../utils/paths.js'
import { installBrowser } from './install.script.js'

const openOptsSchema = globalResultSchema.extend({
  url: openBrowserSchema.shape.url,
})

export async function openBrowser({ url, ...opts }: OpenBrowserOpts) {
  const { alias, browser, buildId } = opts
  let info = await checkoutInStore(opts)
  if (!info) {
    await installBrowser({ ...opts, alias: alias ?? '' })
    info = await checkoutInStore(opts)
  }

  if (!info) {
    logger.warn('No browser capable of running was found.')
    logger.newline()
    return
  }

  const { executablePath } = info
  const profileDir = getProfileDir(browser, buildId)
  const extraArgs = getExtraArgs(browser, profileDir)

  spawn(executablePath, extraArgs.concat(url ? [url] : []), {
    detached: true,
    stdio: 'ignore',
  }).unref()

  logger.success('Successfully open browser')
  logger.newline()
}

export type OpenBrowserOpts = z.infer<typeof openOptsSchema>
