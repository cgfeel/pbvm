import { hashString } from './index.js'
import { createLogger } from './logger.js'
import type { CompilerMode, MermaidTheme, TargetType } from './types.js'
import { allowProcess, closeWorker, DEFAULT_THEMES, getRenderer, loadDotEnv } from './utils.js'

export default async function mermaidLoader(
  this: MiniLoaderContext<MermaidLoaderOptions>,
  source: string
) {
  // 环境允许
  const callback = this.async()
  if (!allowProcess(this)) {
    callback(null, `export default ${JSON.stringify(source)}`)
    return
  }

  // 获取主题
  const options = this.getOptions()
  const { defaultTheme = 'default' } = options

  const themes = (options.themes ?? DEFAULT_THEMES).filter((item) => item.name && item.theme)
  if (themes.length === 0) {
    callback(null, `export default ${JSON.stringify(source)}`)
    return
  }

  // 加在变量和 logger
  const root = process.cwd()
  const logger = createLogger('mermaid-loader')
  loadDotEnv(root)

  const hash = hashString(source.trim())
  const output = (options.output ?? 'mermaid/index/').replace(/\/?$/, '/')

  const renderer = await getRenderer()
  Promise.all(themes.map((item) => renderer([source], { mermaidConfig: { theme: item.theme } })))
    .then((results) => {
      results.forEach(([item], idx) => {
        if (item.status === 'fulfilled') {
          const { name, theme } = themes[idx]
          const suffix = theme === defaultTheme ? '' : `-${name}`
          this.emitFile(`${output}${hash}${suffix}.svg`, item.value.svg)
        }
      })

      // 始终返回无后缀的 path，由业务来决定调用
      callback(null, `export default ${JSON.stringify(`/${output}${hash}.svg`)}`)
    })
    .catch((err) => {
      logger.error('render error:', err instanceof Error ? err.message : err)
      callback(null, `export default ${JSON.stringify(source)}`)
    })
    .finally(() => {
      closeWorker()
    })
}

mermaidLoader.raw = true

/**
 * Loader 异步回调函数类型
 */
type LoaderCallback = (
  err: Error | null,
  content?: string | Buffer,
  sourceMap?: string | Record<string, unknown> | Buffer,
  meta?: Record<string, unknown>
) => void

/**
 * Webpack / Rspack 通用 LoaderContext 最小子集
 * 仅包含你用到的：getOptions / async / emitFile / mode
 */
interface MiniLoaderContext<Options = Record<string, unknown>> {
  /**
   * 获取 loader 的配置项（module.rules.use[].options）
   */
  getOptions: () => Options

  /**
   * 标记异步 loader，返回回调函数
   * 只能调用一次
   */
  async: () => LoaderCallback

  /**
   * 发射静态资源到输出目录（dist）
   * @param name 输出文件名，支持 [contenthash] 占位符
   * @param content 文件内容 string / Buffer
   * @param sourceMap 可选资源 sourcemap
   * @param assetInfo 资产附加元信息
   */
  emitFile: (
    name: string,
    content: string | Buffer,
    sourceMap?: string | Buffer,
    assetInfo?: Record<string, unknown>
  ) => void

  mode: Readonly<CompilerMode>
  target?: TargetType
}

interface MermaidLoaderOptions {
  defaultTheme?: MermaidTheme['theme']
  output?: string
  themes?: MermaidTheme[]
}
