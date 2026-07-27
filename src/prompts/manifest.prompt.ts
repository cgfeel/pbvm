import { select, Separator } from '@inquirer/prompts'
import { type Browser, type BrowserPlatform, detectBrowserPlatform } from '@puppeteer/browsers'
import type { z } from 'zod'
import { type globalResultSchema, removeResultSchema } from '../types/index.js'
import { isDefined, isKey, objectKeys } from '../utils/fields.js'
import { logger } from '../utils/logger.js'
import { currentBrowserList, formatList, getRecordList } from '../utils/manifest.js'

const manifestSchema = removeResultSchema.required({
  browser: true,
  buildId: true,
})

const renderGroup = (
  platform: BrowserPlatform,
  selectList?: SelectItemType[],
  current?: boolean
) => {
  const browserList = selectList?.map(({ browser }) => browser) ?? []
  const getBrowse = (type: unknown): type is Browser => browserList.some((item) => item === type)

  if (selectList && selectList.length > 0) {
    const sep = new Separator(
      current ? logger.bold(`${platform} (current):`) : logger.gray(`${platform}:`)
    )
    const options = formatList(selectList)
      .map((item) => {
        const reg = /.*revision:\s+([^@]+)@(.*)$/
        const match = item.match(reg)

        const browser = match ? match[1] : ''
        return match && getBrowse(browser)
          ? {
              name: current ? item.trim() : logger.gray(item.trim()),
              value: { buildId: match[2], browser, platform },
            }
          : undefined
      })
      .filter(isDefined)

    return { sep, options }
  }
  return null
}

export async function promptManifestOptions(
  partial: z.infer<typeof removeResultSchema>
): Promise<z.infer<typeof manifestSchema> | null> {
  let { browser, buildId, platform } = partial
  const items = await currentBrowserList()
  const filterList =
    !browser && !buildId && !platform
      ? items
      : items.filter((item) => {
          if (browser && item.browser !== browser) return false
          if (buildId && item.buildId !== buildId) return false
          if (platform && item.platform !== platform) return false
          return true
        })

  if (filterList.length === 0) return null
  if (browser && buildId && platform) return { browser, buildId, platform }

  const records = await getRecordList(filterList)
  const currentPlatform = detectBrowserPlatform()

  const currentChoices =
    currentPlatform && isKey(currentPlatform, records)
      ? renderGroup(currentPlatform, records[currentPlatform], true)
      : null

  const choices = currentChoices
    ? [currentChoices.sep, ...currentChoices.options, new Separator(' ')]
    : []

  const platformList = objectKeys(records)
  platformList.sort()

  const browserRecord = await select({
    message: logger.gray('Multiple browsers have been matched. Please select one for operation:'),
    choices: choices.concat(
      ...platformList.map((platform) => {
        const itemChoies =
          platform && platform !== currentPlatform && isKey(platform, records)
            ? renderGroup(platform, records[platform])
            : null
        return itemChoies ? [itemChoies.sep, ...itemChoies.options, new Separator(' ')] : []
      })
    ),
  })

  return browserRecord
}

type SelectItemType = z.infer<typeof globalResultSchema>
