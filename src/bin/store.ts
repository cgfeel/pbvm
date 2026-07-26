import { detectBrowserPlatform } from '@puppeteer/browsers'
import { isKey } from '../utils/fields.js'
import { logger } from '../utils/logger.js'
import { formatList, getRecordList, storeBrowserList } from '../utils/manifest.js'

export async function storeBrowser() {
  const items = await storeBrowserList()
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
}
