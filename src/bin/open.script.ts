import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Browser } from '@puppeteer/browsers'
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

const beforeFirefoxSpawn = async (profileDir: string) => {
  await mkdir(profileDir, { recursive: true })
  await writeFile(
    path.join(profileDir, 'user.js'),
    [
      // 屏蔽自动更新
      'user_pref("app.update.enabled", false);',
      'user_pref("app.update.auto", false);',
      'user_pref("app.update.service.enabled", false);',

      // 屏蔽设置为默认浏览器
      'user_pref("browser.shell.checkDefaultBrowser", false);',
    ].join('\n'),
    'utf-8'
  )

  return { ...process.env, MOZ_APP_NO_UPDATE: '1' }
}

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

  const browserEnv = browser === Browser.FIREFOX ? await beforeFirefoxSpawn(profileDir) : undefined
  spawn(executablePath, extraArgs.concat(url ? [url] : []), {
    detached: true,
    env: browserEnv,
    stdio: 'ignore',
  }).unref()

  logger.success('Successfully open browser')
  logger.newline()
}

export type OpenBrowserOpts = z.infer<typeof openOptsSchema>
