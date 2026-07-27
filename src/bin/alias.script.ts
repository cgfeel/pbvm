import path from 'node:path'
import type { z } from 'zod'
import type { currentResultSchema } from '../types/index.js'
import { logger } from '../utils/logger.js'
import { currentBrowserList, updateBrowserItems } from '../utils/manifest.js'

export async function aliasBrowser(options: RemoveBrowserOpts) {
  const { browser, buildId, platform } = options
  const list = await currentBrowserList()
  const index = await list.findIndex(
    (item) => item.browser === browser && item.buildId === buildId && item.platform === platform
  )

  if (index === -1) {
    list.push(options)
  } else {
    list.splice(index, 1, options)
  }

  const savePath = path.join(process.cwd(), 'browserlist.json')
  await updateBrowserItems(savePath, list)

  logger.success('Successfully set alias')
  logger.newline()
}

export type RemoveBrowserOpts = z.infer<typeof currentResultSchema>
