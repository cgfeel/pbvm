import { spawn } from 'node:child_process'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
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

/**
 * 从 Firefox executablePath 推导 distribution/ 目录路径
 *
 * macOS:  Firefox.app/Contents/MacOS/firefox → Firefox.app/Contents/Resources/distribution/
 * Linux:  <dir>/firefox                   → <dir>/distribution/
 * Windows:<dir>/firefox.exe               → <dir>/distribution/
 */
const getFirefoxDistributionDir = (executablePath: string): string => {
  if (os.platform() === 'darwin') {
    // executablePath 在 Firefox.app/Contents/MacOS/firefox
    // policy 需要放在 Firefox.app/Contents/Resources/distribution/
    const macosDir = path.dirname(executablePath)
    return path.join(macosDir, '..', 'Resources', 'distribution')
  }
  // linux / win32：distribution/ 与可执行文件同级
  return path.join(path.dirname(executablePath), 'distribution')
}

const beforeFirefoxSpawn = async (profileDir: string, executablePath: string) => {
  await mkdir(profileDir, { recursive: true })
  await rm(path.join(profileDir, 'compatibility.ini'), { force: true })

  // user.js — 在 profile 层面屏蔽更新和默认浏览器提示
  await writeFile(
    path.join(profileDir, 'user.js'),
    [
      // 屏蔽自动更新
      'user_pref("app.update.enabled", false);',
      'user_pref("app.update.auto", false);',
      'user_pref("app.update.background.enabled", false);',
      'user_pref("app.update.service.enabled", false);',
      'user_pref("app.update.silent", false);',

      // 屏蔽设置为默认浏览器
      'user_pref("browser.shell.checkDefaultBrowser", false);',
    ].join('\n'),
    'utf-8'
  )

  // policies.json — 企业策略硬阻断更新（比 user.js 更早生效，更可靠）
  const distributionDir = getFirefoxDistributionDir(executablePath)
  await mkdir(distributionDir, { recursive: true })
  await writeFile(
    path.join(distributionDir, 'policies.json'),
    JSON.stringify(
      {
        policies: {
          DisableAppUpdate: true,
          DisableSystemAddonUpdate: true,
          DisableFirefoxStudies: true,
          DisableTelemetry: true,
        },
      },
      null,
      2
    ),
    'utf-8'
  )
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

  if (browser === Browser.FIREFOX) {
    await beforeFirefoxSpawn(profileDir, executablePath).catch(() => {
      // nothing
    })
  }

  spawn(executablePath, extraArgs.concat(url ? [url] : []), {
    detached: true,
    stdio: 'ignore',
  }).unref()

  logger.success('Browser opened successfully.')
  logger.newline()
}

export type OpenBrowserOpts = z.infer<typeof openOptsSchema>
