import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import type { MermaidRenderer } from 'mermaid-isomorphic'
import { hashString } from './index.js'
import { createLogger } from './logger.js'
import type { CompilerMode, MermaidTheme, TargetType } from './types.js'
import { allowProcess, closeWorker, DEFAULT_THEMES, getRenderer, loadDotEnv } from './utils.js'

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

/** 递归扫描 .md/.mdx，提取 ```mermaid 代码块 */
function extractBlocks(dir: string, lang: string) {
  const blocks: Block[] = []
  if (!existsSync(dir)) return blocks

  function walk(d: string) {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (/\.(?:md|mdx)$/.test(entry.name)) {
        const content = readFileSync(full, 'utf-8')
        const regex = /```mermaid\r?\n([\s\S]*?)```/g
        let match
        while ((match = regex.exec(content)) !== null) {
          const source = match[1].trim()
          blocks.push({ file: full, hash: hashString(source), lang, source })
        }
      }
    }
  }

  walk(dir)
  return blocks
}

/**
 * 纯 Node.js 渲染，无需浏览器/puppeteer。如果某些图渲染异常，切到 @mermaid-js/mermaid-cli（见文件末尾注释）。
 */
async function renderSvg(render: MermaidRenderer, source: string, theme: MermaidTheme['theme']) {
  const [result] = await render([source], { mermaidConfig: { theme } })
  if (result.status === 'fulfilled') return result.value.svg
  throw result.reason instanceof Error ? result.reason : new Error('renderSvg failed')
}

class MermaidPreRenderPlugin {
  #options: MermaidPreRenderOptions

  constructor(options: MermaidPreRenderOptions) {
    this.#options = options
  }

  apply(compiler: CompilerType) {
    const pluginName = 'MermaidPreRenderPlugin'
    const logger = createLogger(pluginName)
    const root = process.cwd()

    compiler.hooks.afterEmit.tapAsync(pluginName, async (_, callback) => {
      let renderStarted = false
      try {
        if (!allowProcess(compiler.options)) return
        const {
          catalogues: allCatalogues,
          defaultLocale,
          output: putdir = 'mermaid',
          themes: themeItems = DEFAULT_THEMES,
        } = this.#options

        const outPath = compiler.options.output?.path ?? ''
        if (outPath === '') return

        // 根据语言匹配编译，如果没有配置默认语言，就全部编译
        const rel = relative(root, outPath)
        const segments = rel.split('/')
        const currentLocale = segments.length <= 1 ? defaultLocale : segments.slice(-1)[0]

        const catalogues = currentLocale
          ? allCatalogues.filter(({ name }) => name === currentLocale)
          : allCatalogues

        if (catalogues.length === 0) return

        // 获取 theme
        const output = putdir.replace(/^\/+/, '')
        const outputDir = join(outPath, output)
        const themes = themeItems.filter((item) => item.name && item.theme)

        // output & env
        if (themes.length === 0) return
        loadDotEnv(root)

        // 扫描
        const allBlocks = catalogues.reduce<Block[]>((current, { entry, name }) => {
          const dir = resolve(root, entry)
          extractBlocks(dir, name).forEach((item) => {
            if (!current.some(({ hash, source }) => hash === item.hash && source === item.source)) {
              current.push(item)
            }
          })
          return current
        }, [])

        if (allBlocks.length === 0) return

        // 渲染
        const total = allBlocks.length * themes.length
        logger.log(`rendering ${allBlocks.length} blocks × ${themes.length} themes → ${outputDir}`)

        const render = await getRenderer()
        renderStarted = true
        ensureDir(outputDir)

        let count = 0
        for (const block of allBlocks) {
          for (const item of themes) {
            const langDir = join(outputDir, block.lang, item.name)
            ensureDir(langDir)

            try {
              const svg = await renderSvg(render, block.source, item.theme)
              const svgFile = join(langDir, `${block.hash}.svg`)

              writeFileSync(svgFile, svg, 'utf-8')
              logger.raw.verbose(`  ${block.lang}/${item.name}/${block.hash}`)
              count++
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err)
              logger.raw.error(`  ✗ ${block.lang}/${item.name}/${block.hash}  ${block.file}`)
              logger.raw.error(`    ${msg}`)
            }
          }
        }
        logger.log(`Done: ${count}/${total}`)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        logger.error(`error:`, msg)
      } finally {
        if (renderStarted) closeWorker()
        callback()
      }
    })
  }
}

export default MermaidPreRenderPlugin

interface Block {
  file: string
  hash: string
  lang: string
  source: string
}

interface Catalogue {
  entry: string
  name: string
}

// 根据编译的目录划分语言包，例如编译的入口是 /build/zh-Hans，那么语言就是 zh-Hans
// 当编译的目录是构建目录下的一级目录，例如 /build，那么就用默认语言
// 没有提供默认语言就所有语言都编译，例如在非 Docusaurus 的环境下
// 所以目录一定为 /{build}/{lang?}/mermaid/{lang}/{theme}/
// 第一个 {lang} 可选，第二个用于前一个不存在时区分各自语言
interface MermaidPreRenderOptions {
  catalogues: Catalogue[]
  defaultLocale?: string
  output?: string
  themes?: MermaidTheme[]
}

type CompilerType = {
  hooks: {
    afterEmit: { tapAsync: (name: string, fn: (_: unknown, callback: () => void) => void) => void }
  }
  options: {
    mode?: CompilerMode
    output?: { path?: string }
    target?: TargetType
  }
}

// ---------------------------------------------------------------------------
// 备选：如果 mermaid-isomorphic 对某些图类型不支持，切到 mermaid‑cli：
//
//   pnpm add -D @mermaid-js/mermaid-cli
//
// import { execSync } from 'node:child_process'
//
// function renderMmdCli(mmdFile: string, outFile: string, theme: string) {
//   const cfg = join(TMP_DIR, 'cfg.json')
//   writeFileSync(cfg, JSON.stringify({ theme }))
//   execSync(`npx mmdc -i "${mmdFile}" -o "${outFile}" -c "${cfg}" -q`, {
//     cwd: ROOT, stdio: 'pipe', timeout: 30_000,
//   })
// }
// ---------------------------------------------------------------------------
