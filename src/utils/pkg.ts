import fs from 'node:fs/promises'
import path from 'node:path'
import z from 'zod'
import { type BrowserResultType, browserResultSchema, storeResultSchema } from '../types/index.js'
import { isDefined } from './fields.js'
import { BROWSER_CACHE_DIR, getRootPath } from './paths.js'

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

export async function getPackageVersion() {
  const rootPath = getRootPath()
  const pkgPath = path.join(rootPath, 'package.json')
  const pkgRaw = await fs.readFile(pkgPath, 'utf-8')
  const pkgResult = JSON.parse(pkgRaw) as unknown

  const { data, success } = packageSchema.safeParse(pkgResult)
  return success ? data : { version: '0.0.1' }
}

export async function logStoreList({
  browser,
  buildId,
  platform,
}: Omit<BrowserResultType, 'alias'>) {
  const list = await storeBrowserList()
  const index = list.find(
    (item) => item.browser === browser && item.buildId === buildId && item.platform === platform
  )

  if (!index) {
    const savePath = path.join(BROWSER_CACHE_DIR, 'browserlist.json')
    list.push({ platform: platform ?? '', browser, buildId })

    const result = await updateBrowserItems(savePath, list)
    return result
  }

  return true
}

export async function rootBrowserList() {
  const rootPath = getRootPath()
  const listPath = path.join(rootPath, 'browserlist.json')
  const result = await getBrowserItems(listPath, browserResultSchema)
  return result
}

export async function storeBrowserList() {
  const listPath = path.join(BROWSER_CACHE_DIR, 'browserlist.json')
  const result = await getBrowserItems(listPath, storeResultSchema)
  return result
}
