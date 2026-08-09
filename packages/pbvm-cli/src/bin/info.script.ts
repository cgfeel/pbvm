import { Browser, computeExecutablePath } from '@puppeteer/browsers'
import type { z } from 'zod'
import { getExtraArgs } from '../browser/base.browser.js'
import { getChromiumRuntimeInfo } from '../browser/chromium.browser.js'
import { getFirefoxRuntimeInfo } from '../browser/firefox.browser.js'
import type { currentResultSchema, infoBrowserSchema } from '../types/index.js'
import { logger, printLine } from '../utils/logger.js'
import { baseInfo, getFileInfo, getProfileDir, getTmpDir } from '../utils/paths.js'

export async function infoBrowser({ browser, buildId, platform, runtime }: InfoBrowserOpts) {
  const executablePath =
    platform === ''
      ? ''
      : computeExecutablePath({
          ...baseInfo,
          browser,
          buildId,
          platform,
        })

  console.log(logger.bold('Static info:'))
  logger.newline()

  if (platform) printLine('platform', platform)
  printLine('browser', browser)
  printLine('buildId', buildId)

  if (executablePath) {
    printLine('executablePath', executablePath)
    printLine('profilePath', getProfileDir(browser, buildId))

    const fileInfo = await getFileInfo(executablePath)
    printLine('exists', fileInfo.exists)

    if (fileInfo.size) printLine('size', fileInfo.size)
    if (fileInfo.createdAt) printLine('createdAt', fileInfo.createdAt)
    if (fileInfo.error) printLine('error', fileInfo.error)
    logger.newline()
  }

  if (!runtime) return

  console.log(logger.bold('Runtime info:'))
  if (executablePath === '') {
    logger.newline()
    logger.error('No executable browser.')
    logger.newline()
    return
  }

  console.log(logger.gray('The following information comes from a headless browser'))
  logger.newline()

  const spin = logger.spinner('Obtaining browser information...')
  spin.start()

  // 目录会在调用过程中删除，这里不用做处理，暂且保留
  const profileDir = getTmpDir(browser, buildId)
  const extraArgs = getExtraArgs(browser, profileDir)
  const getBrowserRuntime =
    browser === Browser.FIREFOX ? getFirefoxRuntimeInfo : getChromiumRuntimeInfo

  const browserResult = await getBrowserRuntime({
    args: extraArgs,
    executablePath,
  })

  spin.succeed(logger.green('Completed, with the results as follows'))
  logger.newline()

  console.log(JSON.stringify(browserResult, null, 2))
  logger.newline()
}

export type InfoBrowserOpts = Omit<z.infer<typeof currentResultSchema>, 'alias'> &
  Pick<z.infer<typeof infoBrowserSchema>, 'runtime'>
