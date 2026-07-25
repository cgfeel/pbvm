import { Browser, BrowserPlatform } from '@puppeteer/browsers'
import { z } from 'zod'

const browserlistSchema = {
  platform: z.enum(BrowserPlatform).or(z.literal('')),
}

export const browserItemSchema = z.object({
  alias: z.string().optional(),
  browser: z.enum(Browser).optional(),
  buildId: z.string().min(1).optional(),
})

export const browserResultSchema = browserItemSchema.required({
  alias: true,
  browser: true,
  buildId: true,
})

export const currentResultSchema = browserResultSchema.extend(browserlistSchema)
export const storeResultSchema = browserResultSchema
  .omit({
    alias: true,
  })
  .extend(browserlistSchema)

export interface RunOptions {
  target?: string
}

export type BrowserItemType = z.infer<typeof browserItemSchema>
export type BrowserResultType = z.infer<typeof browserResultSchema>
export type StoreResultType = z.infer<typeof storeResultSchema>
