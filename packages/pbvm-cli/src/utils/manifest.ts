import fs from 'node:fs/promises'
import path from 'node:path'
import { detectBrowserPlatform, type BrowserPlatform } from '@puppeteer/browsers'
import { type z } from 'zod'
import { getInstalledBrowsers } from '../browser/browser.lock.js'
import {
  type BrowserResultType,
  type globalResultSchema,
  currentResultSchema,
  removeResultSchema,
} from '../types/index.js'
import { isDefined } from './fields.js'
import { acquireLock, waitForLock } from './lock.js'
import { padEndByDisplayWidth } from './logger.js'
import { baseInfo } from './paths.js'

const filterResultSchema = removeResultSchema.required({ platform: true })

const getBrowserItems = async <T extends z.ZodType>(
  listPath: string,
  schema: T
): Promise<z.infer<T>[]> => {
  try {
    const content = await fs.readFile(listPath, 'utf-8')
    const result = JSON.parse(content) as unknown

    return !Array.isArray(result)
      ? []
      : result
          .map((item) => {
            const { data, success } = schema.safeParse(item)
            return success ? data : undefined
          })
          .filter(isDefined)
  } catch (error) {
    if (error instanceof Object && error !== null && 'code' in error && error.code === 'ENOENT') {
      return []
    }
    throw error instanceof Error ? error : new Error('Failed to read browser list')
  }
}

export async function checkoutInStore({
  browser,
  buildId,
  platform,
}: z.infer<typeof globalResultSchema>) {
  const installed = await getInstalledBrowsers(baseInfo)
  return installed.find(
    (item) => item.browser === browser && item.buildId === buildId && item.platform === platform
  )
}

// 以当前执行的目录为准，可能不是项目根目录，也可能不存在 git，但这不重要
// 调用前请先确保操作是否需要加加锁
export async function currentBrowserList() {
  const rootPath = process.cwd()
  const listPath = path.join(rootPath, 'browserlist.json')
  const result = await getBrowserItems(listPath, currentResultSchema)
  return result
}

// priority {browser}@{buildId} or {alias}
export async function findBrowserList(target: string, info: BrowserListInfo = {}) {
  const { platform: orgPlatform, store } = info
  const platform = store ? detectBrowserPlatform() : orgPlatform
  const getList = store ? storeBrowserList : currentBrowserList

  if (!store) await waitForLock()
  const list = await getList()

  if (list.length === 0) return undefined
  const [, browser, buildId] = target.includes('@') ? (target.match(/^([^@]+)@(.*)$/) ?? []) : []

  return list.find((item) => {
    if (platform && item.platform !== platform) return false
    return buildId ? item.browser === browser && item.buildId === buildId : item.alias === target
  })
}

export async function filterCurrentList({
  browser,
  buildId,
  platform,
}: z.infer<typeof filterResultSchema>) {
  const releaseLock = await acquireLock()
  try {
    const list = await currentBrowserList()
    const filtered = list.filter(
      (item) => item.browser !== browser || item.buildId !== buildId || item.platform !== platform
    )

    if (filtered.length !== list.length) {
      const savePath = path.join(process.cwd(), 'browserlist.json')
      await updateBrowserItems(savePath, filtered)
    }
  } finally {
    releaseLock()
  }
}

export function formatList<T extends z.infer<typeof globalResultSchema>>(list: T[]) {
  const maxAliasLength =
    'alias' in list[0] ? Math.max(...list.map((item) => (item?.alias ?? '').length)) : 0

  const formatRecords = list.map(({ alias, browser, buildId }) =>
    alias && maxAliasLength > 0
      ? `  ${padEndByDisplayWidth(alias, maxAliasLength)}  →  revision: ${browser}@${buildId}`
      : `  revision: ${browser}@${buildId}`
  )

  return formatRecords.sort((a, b) => a.localeCompare(b))
}

export async function getRecordList<T extends z.infer<typeof globalResultSchema>>(list: T[]) {
  const records: Partial<Record<BrowserPlatform, T[]>> = {}
  if (list.length === 0) return records

  list.forEach((item) => {
    const { platform } = item
    if (platform) {
      if (platform in records) {
        records[platform]?.push(item)
      } else {
        records[platform] = [item]
      }
    }
  })
  return records
}

// 关于 alias 同名保存，目前不做检查，放行操作，当使用 alias 启动的时候取第一条，或者用 browser, buildId 启动
// 因为要做重名排查就要加锁，避免多进程下同时写入，目前没必要
export async function logCurrentList({ alias, browser, buildId, platform }: CurrentListItem) {
  const releaseLock = await acquireLock()
  try {
    const list = await currentBrowserList()
    const index = list.find(
      (item) => item.browser === browser && item.buildId === buildId && item.platform === platform
    )

    if (!index) {
      // 这里存储的 alias 已经在外部处理过了，要避免空字符
      const savePath = path.join(process.cwd(), 'browserlist.json')
      list.push({ platform: platform ?? '', alias, browser, buildId })

      const result = await updateBrowserItems(savePath, list)
      return result ? alias : undefined
    }

    return index.alias
  } finally {
    releaseLock()
  }
}

export async function storeBrowserList() {
  const index = await getInstalledBrowsers(baseInfo)
  return index.map((item) => ({ ...item, alias: '' }))
}

// 执行写入前请确保有加锁，由于 browserlist.json 文件写入非常小，而锁默认超时 1 分钟
// 所以目前暂且不用考虑锁是否会和其他进程锁冲突
export async function updateBrowserItems(path: string, data: unknown[]) {
  try {
    await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch {
    return false
  }
}

type BrowserListInfo = {
  platform?: BrowserPlatform
  store?: boolean
}

type CurrentListItem = BrowserResultType & {
  platform?: BrowserPlatform
}
