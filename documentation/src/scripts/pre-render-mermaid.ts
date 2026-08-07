/* eslint-disable no-console */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { MermaidConfig } from 'mermaid'
import type { MermaidRenderer } from 'mermaid-isomorphic'
import { createMermaidRenderer } from 'mermaid-isomorphic'
import { hashString } from './utils'

const ROOT = process.cwd()
const DOCS_DIR = join(ROOT, 'docs')
const I18N_DIR = join(ROOT, 'i18n')
const OUTPUT_DIR = join(ROOT, 'static', 'mermaid')
const TMP_DIR = join(ROOT, 'node_modules', '.cache', 'mermaid-pre-render')

// pnpm --filter documentation pre-render-mermaid -i 查看编译详细过程
// 加载本地 .env（gitignored），不依赖 Node --env-file 参数
{
  const envPath = join(ROOT, '.env')
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      const key = trimmed.slice(0, idx).trim()
      if (!process.env[key]) {
        process.env[key] = trimmed.slice(idx + 1).trim()
      }
    }
  }
}

const THEMES: ThemeEntry[] = [
  { name: 'light', mermaidTheme: 'default' },
  { name: 'dark', mermaidTheme: 'dark' },
]

const verbose = process.argv.includes('-i') || process.argv.includes('--info')

const launchOptions = process.env.CI
  ? {
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox'],
    }
  : process.env.CHROMIUM_PATH
    ? {
        executablePath: process.env.CHROMIUM_PATH,
      }
    : undefined

function groupBy<T>(arr: T[], fn: (item: T) => string): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      ;(acc[fn(item)] ??= []).push(item)
      return acc
    },
    {} as Record<string, T[]>
  )
}

/** 递归扫描 .md/.mdx，提取 ```mermaid 代码块 */
function extractBlock(dir: string, lang: string) {
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

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

/**
 * 纯 Node.js 渲染，无需浏览器/puppeteer。如果某些图渲染异常，切到 @mermaid-js/mermaid-cli（见文件末尾注释）。
 */
async function renderSvg(
  render: MermaidRenderer,
  source: string,
  theme: ThemeEntry['mermaidTheme']
) {
  const [result] = await render([source], { mermaidConfig: { theme } })
  if (result.status === 'fulfilled') return result.value.svg
  throw result.reason instanceof Error ? result.reason : new Error('renderSvg faild')
}

async function main() {
  const blocks: Block[] = [...extractBlock(DOCS_DIR, 'en')]
  if (existsSync(I18N_DIR)) {
    for (const langDir of readdirSync(I18N_DIR, { withFileTypes: true })) {
      if (!langDir.isDirectory()) continue
      const docsPath = join(I18N_DIR, langDir.name, 'docusaurus-plugin-content-docs', 'current')
      if (existsSync(docsPath)) {
        blocks.push(...extractBlock(docsPath, langDir.name))
      }
    }
  }

  const byLang = groupBy(blocks, (b) => b.lang)
  const langSummary = Object.entries(byLang)
    .map(([lang, list]) => `${lang}: ${list.length ?? 0}`)
    .join(', ')

  console.log(`Found ${blocks.length} blocks (${langSummary})`)
  if (blocks.length === 0) {
    console.log('No mermaid blocks found, exiting.')
    return
  }

  // 碰撞检测
  const seen = new Map<string, Block>()
  for (const b of blocks) {
    const prev = seen.get(b.hash)
    if (prev && prev.source !== b.source) {
      console.warn(`⚠ Hash collision: ${b.hash}`)
      console.warn(`  ${prev.file}`)
      console.warn(`  ${b.file}`)
    }
    seen.set(b.hash, b)
  }

  // 渲染
  ensureDir(TMP_DIR)
  ensureDir(OUTPUT_DIR)

  const total = blocks.length * THEMES.length
  const render = createMermaidRenderer(launchOptions ? { launchOptions } : undefined)

  const errors: string[] = []
  let count = 0

  for (const block of blocks) {
    for (const theme of THEMES) {
      const outDir = join(OUTPUT_DIR, block.lang, theme.name)
      ensureDir(outDir)

      const outFile = join(outDir, `${block.hash}.svg`)
      try {
        const svg = await renderSvg(render, block.source, theme.mermaidTheme)
        writeFileSync(outFile, svg, 'utf-8')

        if (verbose) console.log(`  ${block.lang}/${theme.name}/${block.hash}`)
        count++
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`✗ ${block.lang}/${theme.name}/${block.hash}  ${block.file}\n  ${msg}`)
      }
    }
  }

  rmSync(TMP_DIR, { recursive: true })

  if (errors.length > 0) {
    console.error(`\n${errors.length} failed:`)
    for (const e of errors) console.error(e)
  }

  console.log(`\nDone: ${count}/${total} → ${OUTPUT_DIR}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

interface Block {
  file: string
  hash: string
  lang: string
  source: string
}

interface ThemeEntry {
  name: 'light' | 'dark'
  mermaidTheme: NonNullable<MermaidConfig['theme']>
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
