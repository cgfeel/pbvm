import { input, select } from '@inquirer/prompts'
import { CreateOptions } from '../types/index.js'
import { logger } from '../utils/logger.js'

const browserTips = Object.freeze({
  chrome: "Chrome's buildId must be x.x.x.x",
  chromium: "Chromium's buildId must be revision number",
  firefox: "Firefox's buildId must be channel_version",
})

export async function promptCreateOptions(
  partial: CreateOptions
): Promise<Required<CreateOptions>> {
  let { alias, browser, buildId } = partial
  if (!browser) {
    browser = await select({
      message: logger.cyan('browser: '),
      choices: [
        { name: 'chrome', value: 'chrome' },
        { name: 'chromium', value: 'chromium' },
        { name: 'firefox', value: 'firefox' },
      ],
    })
  }

  logger.newline()
  if (!buildId) {
    while (true) {
      buildId = await input({
        message:
          browser in browserTips
            ? `${logger.gray(browserTips[browser])}\n${logger.cyan('buildId: ')}`
            : logger.cyan('buildId: '),
      })

      const value = buildId.trim()
      if (value) break

      logger.warn('buildId cannot be empty')
      logger.newline()
    }
  }

  logger.newline()
  if (!alias) {
    alias = await input({
      message: `${logger.gray('It is helpful for future searches')}\n${logger.cyan('alias: ')} ${logger.gray(' [optional]')}`,
      default: '',
    })
  }

  logger.newline()
  return { alias, browser, buildId }
}
