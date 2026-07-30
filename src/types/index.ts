import { Browser, BrowserPlatform } from '@puppeteer/browsers'
import { z } from 'zod'

export const aliasBrowserSchema = z.object({
  target: z.string().optional(),
  platform: z.enum(BrowserPlatform).optional(),
})

export const browserItemSchema = z.object({
  alias: z.string().optional(),
  browser: z.enum(Browser).optional(),
  buildId: z.string().min(1).optional(),
})

const browserlistSchema = {
  platform: z.enum(BrowserPlatform).or(z.literal('')),
}

export const browserResultSchema = browserItemSchema.required({
  alias: true,
  browser: true,
  buildId: true,
})

export const createBrowserSchema = z.object({
  ...browserItemSchema.shape,
  store: z.boolean().optional(),
})

export const currentResultSchema = browserResultSchema.extend(browserlistSchema)
export const globalResultSchema = currentResultSchema.partial({ alias: true })

export const infoBrowserSchema = z.object({
  target: z.string().optional(),
  runtime: z.boolean().optional(),
})

export const openBrowserSchema = z.object({
  target: z.string().optional(),
  url: z.url().optional(),
})

export const removeResultSchema = browserItemSchema.omit({ alias: true }).extend({
  focus: z.boolean().optional(),
  platform: z.enum(BrowserPlatform).optional(),
  store: z.boolean().optional(),
})

export const removeBrowserSchema = removeResultSchema.required({ browser: true, buildId: true })

export const runBrowserSchema = z.object({
  target: z.string().optional(),
})

export interface ListOptions {
  all?: boolean
  store?: boolean
}

export type BrowserItemType = z.infer<typeof browserItemSchema>
export type BrowserResultType = z.infer<typeof browserResultSchema>
export type CreateBrowserType = z.infer<typeof createBrowserSchema>
export type OpenBrowserType = z.infer<typeof openBrowserSchema>
export type RemoveBrowserOpts = z.infer<typeof removeBrowserSchema>
export type RunOptions = z.infer<typeof runBrowserSchema>
