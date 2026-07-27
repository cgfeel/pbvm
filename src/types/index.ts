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
export const globalResultSchema = currentResultSchema.partial({ alias: true })
export const removeResultSchema = browserItemSchema.omit({ alias: true }).extend({
  focus: z.boolean().optional(),
  platform: z.enum(BrowserPlatform).optional(),
})

export const openBrowserSchema = z.object({
  target: z.string().optional(),
  url: z.url().optional(),
})

export interface ListOptions {
  all?: boolean
  store?: boolean
}

export interface RunOptions {
  target?: string
}

export type BrowserItemType = z.infer<typeof browserItemSchema>
export type BrowserResultType = z.infer<typeof browserResultSchema>
export type OpenBrowserType = z.infer<typeof openBrowserSchema>
