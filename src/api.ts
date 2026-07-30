import { detectBrowserPlatform } from '@puppeteer/browsers'
import { openBrowser } from './bin/open.script.js'
import { findBrowserList } from './utils/manifest.js'

export async function launchBrowser({ target, url }: OpenBrowserOptions) {
  const platform = detectBrowserPlatform()
  let info = await findBrowserList(target, { platform })
  if (!info) {
    info = await findBrowserList(target, { store: true })
  }

  if (!info) {
    throw new Error(`Browser "${target}" not found. Run "pbvm list" to see available browsers.`)
  }

  openBrowser({ ...info, url })
}

export interface OpenBrowserOptions {
  target: string // {browser}@{buildId} or {alias}
  url?: string
}
