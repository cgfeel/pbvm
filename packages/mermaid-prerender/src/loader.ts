import { getRenderer, hashString, loadDotEnv } from './utils.js'

export default async function mermaidLoader(
  this: MiniLoaderContext<MermaidLoaderOptions>,
  source: string
) {
  const callback = this.async()
  const root = process.cwd()
  loadDotEnv(root)

  const hash = hashString(source.trim())
  const options = this.getOptions()
  const output = (options.output ?? 'mermaid/index/').replace(/\/?$/, '/')

  const isProd = this.mode === 'production' || process.env.NODE_ENV === 'production'
  if (!isProd) {
    callback(null, `export default ${JSON.stringify(source)}`)
    return
  }

  const renderer = await getRenderer()
  Promise.all([
    renderer([source], { mermaidConfig: { theme: 'default' } }),
    renderer([source], { mermaidConfig: { theme: 'dark' } }),
  ])
    .then(([light, dark]) => {
      const darkResult = dark[0]
      const lightResult = light[0]

      if (darkResult.status === 'fulfilled') {
        this.emitFile(`${output}${hash}-dark.svg`, darkResult.value.svg)
      }

      if (lightResult.status === 'fulfilled') {
        this.emitFile(`${output}${hash}.svg`, lightResult.value.svg)
      }

      callback(null, `export default ${JSON.stringify(`/${output}${hash}.svg`)}`)
    })
    .catch((err) => {
      /* eslint-disable no-console */
      console.error('[mermaid-loader] render error:', err instanceof Error ? err.message : err)
      callback(null, `export default ${JSON.stringify(source)}`)
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

  /**
   * 编译模式，只读
   */
  readonly mode: 'development' | 'production' | 'none'
}

interface MermaidLoaderOptions {
  output?: string
}
