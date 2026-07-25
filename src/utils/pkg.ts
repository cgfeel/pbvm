import fs from 'node:fs/promises'
import path from 'node:path'
import type { BrowserPlatform } from '@puppeteer/browsers'
import z from 'zod'
import { type BrowserResultType, currentResultSchema, storeResultSchema } from '../types/index.js'
import { isDefined } from './fields.js'
import { getRootPath, PBVM_PATHS } from './paths.js'

const packageSchema = z.object({
  version: z.string(),
})

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
    throw error instanceof Error ? error : new Error('rootBrowserList faild')
  }
}

const updateBrowserItems = async (path: string, data: unknown[]) => {
  try {
    await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch {
    return false
  }
}

// 以当前执行的目录为准，可能不是项目根目录，也可能不存在 git，但这不重要
export async function currentBrowserList() {
  const rootPath = process.cwd()
  const listPath = path.join(rootPath, 'browserlist.json')
  const result = await getBrowserItems(listPath, currentResultSchema)
  return result
}

export async function getPackageVersion() {
  const rootPath = getRootPath()
  const pkgPath = path.join(rootPath, 'package.json')
  const pkgRaw = await fs.readFile(pkgPath, 'utf-8')
  const pkgResult = JSON.parse(pkgRaw) as unknown

  const { data, success } = packageSchema.safeParse(pkgResult)
  return success ? data : { version: '0.0.1' }
}

export async function logCurrentList({ alias, browser, buildId, platform }: CurrentListItem) {
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
}

export async function logStoreList({ browser, buildId, platform }: StoreListItem) {
  const list = await storeBrowserList()
  const index = list.find(
    (item) => item.browser === browser && item.buildId === buildId && item.platform === platform
  )

  if (!index) {
    const savePath = path.join(PBVM_PATHS.cache, 'browserlist.json')
    list.push({ platform: platform ?? '', browser, buildId })

    const result = await updateBrowserItems(savePath, list)
    return result
  }

  return true
}

export async function storeBrowserList() {
  const listPath = path.join(PBVM_PATHS.cache, 'browserlist.json')
  const result = await getBrowserItems(listPath, storeResultSchema)
  return result
}

type CurrentListItem = BrowserResultType & {
  platform?: BrowserPlatform
}

type StoreListItem = Omit<BrowserResultType, 'alias'> & {
  platform?: BrowserPlatform
}
