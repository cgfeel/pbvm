import fs from 'node:fs'
import path from 'node:path'
import { Browser, BrowserPlatform } from '@puppeteer/browsers'
import { DefaultProvider, type BrowserProvider, type DownloadOptions } from '@puppeteer/browsers'
import z from 'zod'
import { escapeRegExp, isDefined } from '../utils/fields.js'
import { logger } from '../utils/logger.js'
import { PBVM_PATHS } from '../utils/paths.js'

const mirrorFile = '.browsermr'

const findBrowserMirror = (dest: string) => {
  const target = path.join(dest, mirrorFile)
  return fs.existsSync(target) ? target : undefined
}

const checkoutBrowser = (mirror: unknown) => {
  const schema = z.partialRecord(z.enum(Browser), z.object({ mirror: z.url() }).loose())
  const { data, success } = schema.safeParse(mirror)
  return success ? data : null
}

const extractItem = (platform: BrowserPlatform, record: Record<string, unknown>) => {
  const schema = z.partialRecord(z.enum(BrowserPlatform), z.unknown())
  const list = Object.entries(record)
    .map(([keyname, item]) => {
      const { data, success } = schema.safeParse(item)
      return success ? ([keyname, String(data[platform] ?? '')] as const) : undefined
    })
    .filter(isDefined)

  return Object.fromEntries(list)
}

// firefox 的 buildId 需要包含 channel_，其他都没有，如果需要保留用 <channelId>
const getBuildId = (id: string) => (id.includes('_') ? id.split('_')[1] : id)

const replaceURL = (url: string, tags: Record<string, string>) => {
  return Object.entries(tags).reduce((current, [keyname, val]) => {
    const ref = new RegExp(`<${escapeRegExp(keyname)}>`, 'g')
    return current.replace(ref, val)
  }, url)
}

// 固定标签：<platform>, <browser>, <buildId>, <channelId>, <lang>, <ext>
// 自定义 <suffix>
class MirrorProvider extends DefaultProvider implements BrowserProvider {
  #name = `MirrorProvider`
  #path = ''
  #rule: Record<string, string> | undefined

  constructor({ path, rule }: MirrorProviderProps) {
    super()
    this.#path = path ?? ''

    const params = rule ? new URLSearchParams(rule).entries() : []
    this.#rule = Object.fromEntries(params)
  }

  supports({ browser, buildId }: DownloadOptions) {
    // firefox 镜像资源是可以没有 channel，但是下载不带 channel 执行就会存在问题
    if (browser === Browser.FIREFOX && !buildId.includes('_')) return false
    if (!this.#path) {
      this.#path = findBrowserMirror(process.cwd()) ?? findBrowserMirror(PBVM_PATHS.config) ?? ''
    } else {
      if (!fs.existsSync(this.#path)) return false
    }

    return this.#path !== ''
  }

  getDownloadUrl(options: DownloadOptions) {
    const { browser, buildId, platform } = options
    const mirrorMap = this.#readMirrorMap()

    const data = checkoutBrowser(mirrorMap)
    const fallback = data?.[browser]

    if (!data || !fallback) return super.getDownloadUrl(options)

    // 原则上来上 browser 和 platform 应该是固定值，但镜像存在的意义就是替换固定值
    const baseConfig = {
      browser: browser.toString(),
      platform: platform.toString(),
    }

    const tags = {
      ...baseConfig,
      ...extractItem(platform, fallback),
      ...this.#rule,
      buildId: getBuildId(buildId),
      channelId: buildId,
      lang: 'zh-CN', // firefox 专属，目前统一 zh-CN
    }

    const url = replaceURL(fallback.mirror, tags)
    logger.info(`Use mirror URL: ${url}`)
    logger.newline()

    return new URL(url)
  }

  getName(): string {
    return this.#name
  }

  #readMirrorMap() {
    try {
      const data = fs.readFileSync(this.#path, 'utf8')
      return JSON.parse(data) as unknown
    } catch {
      return null
    }
  }
}

export { MirrorProvider, mirrorFile }

interface MirrorProviderProps {
  path?: string
  rule?: string
}
