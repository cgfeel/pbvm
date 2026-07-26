import { detectBrowserPlatform } from '@puppeteer/browsers'
import type { ListOptions } from '../types/index.js'
import { isKey, objectKeys } from '../utils/fields.js'
import { logger } from '../utils/logger.js'
import { currentBrowserList, formatList, getRecordList } from '../utils/manifest.js'

export async function listBrowser({ all }: ListOptions) {
  const items = await currentBrowserList()
  const currentPlatform = detectBrowserPlatform()
  const records = await getRecordList(items)

  if (currentPlatform) {
    console.log(logger.bold(`${currentPlatform} (current):`))
    const currentItems = isKey(currentPlatform, records) ? records[currentPlatform] : undefined

    logger.newline()
    if (!currentItems) {
      logger.info('No browsers installed locally. Run `pbvm create` to install one.')
    } else {
      formatList(currentItems).forEach((item) => console.log(item))
    }
  }

  logger.newline()
  if (!all) return

  const platformList = objectKeys(records)
  platformList.sort()

  platformList.forEach((platform) => {
    const currentItems =
      platform && platform !== currentPlatform && isKey(platform, records)
        ? records[platform]
        : undefined

    if (!currentItems) return

    console.log(logger.gray(`${platform}:`))
    logger.newline()

    formatList(currentItems).forEach((item) => console.log(logger.gray(item)))
    logger.newline()
  })
}
