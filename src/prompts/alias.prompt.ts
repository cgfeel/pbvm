import { input } from '@inquirer/prompts'
import type { BrowserItemType, BrowserResultType } from '../types/index.js'
import { logger } from '../utils/logger.js'

export async function promptAliasOptions(
  partial: AliasOptionType
): Promise<Pick<BrowserResultType, 'alias'>> {
  let { alias, require } = partial
  if (!alias) {
    const tips = require ? '' : ` ${logger.gray(' [optional]')}`
    while (true) {
      alias = await input({
        message: `${logger.gray('It is helpful for future searches')}\n${logger.cyan('alias: ')}${tips}`,
        default: '',
      })

      const value = alias.trim()
      if (value || !require) break

      logger.warn('alias cannot be empty')
      logger.newline()
    }

    logger.newline()
  }

  return { alias }
}

type AliasOptionType = Pick<BrowserItemType, 'alias'> & {
  require?: boolean
}
