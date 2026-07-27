import { DefaultProvider, detectBrowserPlatform, getInstalledBrowsers } from '@puppeteer/browsers'
import type { BrowserResultType } from '../types/index.js'
import { logger } from '../utils/logger.js'
import { baseInfo } from '../utils/paths.js'

const provider = new DefaultProvider()
const printLine = (title: string, desc: unknown) => {
  console.log(logger.gray(`  ${title}:`) + ` ${desc}`)
}

export async function searchBrowser({ browser, buildId }: BrowserResultType) {
  const platform = detectBrowserPlatform()
  if (!platform) {
    logger.error('Unable to retrieve platform.')
    process.exit(1)
  }

  const spin = logger.spinner(' Obtaining resource information...')
  spin.start()

  const url = await provider.getDownloadUrl({
    browser,
    buildId,
    platform,
  })

  const installed = await getInstalledBrowsers(baseInfo)
  const index = installed.findIndex(
    (item) => item.browser === browser && item.buildId === buildId && item.platform === platform
  )

  let res = await fetch(url, { method: 'HEAD' })
  if (res.status === 405 || res.status === 501) {
    res = await fetch(url, {
      method: 'GET',
      headers: {
        Range: 'bytes=0-0',
      },
    })
  }

  const size = Number(res.headers.get('content-length') ?? 0)
  const contentType = res.headers.get('content-type') ?? undefined
  const lastModified = res.headers.get('last-modified') ?? undefined
  const etag = res.headers.get('etag') ?? undefined
  const acceptRanges = res.headers.get('accept-ranges') === 'bytes'

  logger.newline()
  spin.succeed(logger.green('Completed, with the results as follows'))

  logger.newline()
  console.log(logger.bold('Browser info:'))

  logger.newline()
  printLine('platform', platform)
  printLine('browser', browser)
  printLine('buildId', buildId)
  printLine('installed', index > -1)

  logger.newline()
  console.log(logger.bold('Search info:'))

  logger.newline()
  printLine('exists', res.ok)
  printLine('url', res.url)
  printLine('status', res.status)
  printLine('redirected', res.redirected)

  if (!Number.isNaN(size) && size > 0) printLine('size', size)
  if (contentType) printLine('contentType', contentType)
  if (lastModified) printLine('lastModified', lastModified)
  if (etag) printLine('etag', etag)
  if (acceptRanges) printLine('acceptRanges', acceptRanges)

  logger.newline()
}
