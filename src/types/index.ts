import { Browser, BrowserPlatform } from '@puppeteer/browsers'
import { z } from 'zod'

export const browserItemSchema = z.object({
  alias: z.string().optional(),
  browser: z.enum(Browser).optional(),
  buildId: z.string().min(1).optional(),
  platform: z.enum(BrowserPlatform).optional(),
})

export const browserResultSchema = browserItemSchema.required({
  alias: true,
  browser: true,
  buildId: true,
})

export const storeResultSchema = browserResultSchema
  .omit({
    alias: true,
    platform: true,
  })
  .extend({
    platform: z.enum(BrowserPlatform).or(z.literal('')),
  })

export interface CreateOptions extends BrowserItemType {}

export interface CreateResult extends Required<Omit<CreateOptions, 'platform'>> {
  platform?: BrowserPlatform
}

// run 命令参数类型
export interface RunOptions {
  target?: string
}

export type BrowserItemType = z.infer<typeof browserItemSchema>
export type BrowserResultType = z.infer<typeof browserResultSchema>
