import { input, select } from '@inquirer/prompts'
import { Browser } from '@puppeteer/browsers'
import type { BrowserItemType, BrowserResultType } from '../types/index.js'
import { isKey } from '../utils/fields.js'
import { logger } from '../utils/logger.js'
import { promptAliasOptions } from './alias.prompt.js'

const browserTips = Object.freeze({
  chrome: "Chrome's buildId must be x.x.x.x",
  chromium: "Chromium's buildId must be revision number",
  firefox: "Firefox's buildId must be channel_version",
})

export async function promptCreateOptions(partial: BrowserItemType): Promise<BrowserResultType> {
  let { alias, browser, buildId } = partial

  if (!browser) {
    browser = await select({
      message: logger.cyan('browser: '),
      choices: [
        { name: 'chrome', value: Browser.CHROME },
        { name: 'chromium', value: Browser.CHROMIUM },
        { name: 'firefox', value: Browser.FIREFOX },
      ],
    })

    logger.newline()
  }

  if (!buildId) {
    while (true) {
      const browserKey = String(browser)
      buildId = await input({
        message: isKey(browserKey, browserTips)
          ? `${logger.gray(browserTips[browserKey])}\n${logger.cyan('buildId: ')}`
          : logger.cyan('buildId: '),
      })

      const value = buildId.trim()
      if (value) break

      logger.warn('buildId cannot be empty')
      logger.newline()
    }

    logger.newline()
  }

  if (!alias) {
    alias = (await promptAliasOptions({})).alias
  }

  return { alias, browser, buildId }
}
