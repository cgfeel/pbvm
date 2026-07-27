import { spawn } from 'node:child_process'
import path from 'node:path'
import { Browser } from '@puppeteer/browsers'
import type { z } from 'zod'
import { openBrowserSchema, globalResultSchema } from '../types/index.js'
import { logger } from '../utils/logger.js'
import { checkoutInStore } from '../utils/manifest.js'
import { PBVM_PATHS } from '../utils/paths.js'
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
  const profileDir = path.join(PBVM_PATHS.data, 'profiles', browser, buildId)
  const extraArgs =
    browser === Browser.FIREFOX
      ? ['--profile', profileDir]
      : ['--no-sandbox', `--user-data-dir=${profileDir}`]

  spawn(executablePath, extraArgs.concat(url ? [url] : []), {
    detached: true,
    stdio: 'ignore',
  }).unref()

  logger.success('Successfully open browser')
  logger.newline()
}

export type OpenBrowserOpts = z.infer<typeof openOptsSchema>
