# mermaid-prerender

构建时（build-time）将 Mermaid 图表预渲染为 SVG，避免浏览器端运行时加载 mermaid 库，优化页面首屏加载速度。

## 原理

`mermaid-isomorphic` 在 Node.js Worker 线程中启动无头浏览器，将 Mermaid 源码渲染为 SVG 文件。构建时完成渲染，页面只需要引用生成的 SVG 即可，客户端零 JS 开销。

## 安装

```bash
pnpm add -D mermaid-prerender mermaid
```

仅限 Node.js ≥ 22、pnpm ≥ 9。

## 使用方式

提供两种构建时接入方式，按场景选择：

| 方式       | 适用场景                                                 |
| ---------- | -------------------------------------------------------- |
| **Loader** | 项目中直接 `import` `.mmd` 文件作为组件引用              |
| **Plugin** | 从 Markdown 文件的 ` ```mermaid ` 代码块中自动提取并渲染 |

两者都在 **生产构建**，且 **target 不是 node** 时才会执行渲染。开发模式下直接透传源码，保证热更新速度。

为了适配不同的环境使用，项目中提供了一个完整的渲染组件，可参考：<https://github.com/cgfeel/pbvm/tree/main/documentation/src/theme/Mermaid>

---

## Loader

### 用途

将 `.mmd`（或任意配置了该 loader 的文件）中的 Mermaid 源码渲染成 SVG，并返回 SVG 的文件路径。适合在组件中 import mermaid 文件，直接作为图片引用。

### 配置

**rspack / webpack：**

```js
// rspack.config.js / webpack.config.js
export default {
  module: {
    rules: [
      {
        test: /\.mmd$/,
        use: [
          {
            loader: 'mermaid-prerender/loader',
            options: {
              defaultTheme: 'default', // 默认主题，对应无后缀的 SVG
              output: 'mermaid/', // SVG 输出目录，相对于 output.path
              themes: [
                { name: 'light', theme: 'default' },
                { name: 'dark', theme: 'dark' },
              ],
            },
          },
        ],
      },
    ],
  },
}
```

### options

| 字段           | 类型                                | 默认值                                                                   | 说明                                                                                               |
| -------------- | ----------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `defaultTheme` | `string`                            | `'default'`                                                              | 默认主题名称，生成的 SVG 不带主题后缀，由业务方决定使用哪个                                        |
| `output`       | `string`                            | `'mermaid/index/'`                                                       | SVG 输出目录，相对于 webpack/rspack 的 `output.path`。loader 会通过 `emitFile` 将 SVG 输出到该目录 |
| `themes`       | `{ name: string; theme: string }[]` | `[{ name: 'light', theme: 'default' }, { name: 'dark', theme: 'dark' }]` | 主题列表。`name` 作为文件名后缀，`theme` 对应 Mermaid 主题                                         |

### 运行时行为

- **生产构建 && 非 node target**：渲染 SVG 并通过 `emitFile` 输出，返回 SVG 路径字符串
- **开发模式 / node target**：直接透传原始 Mermaid 源码

### 输出文件

假设源码 hash 为 `a1b2c3d4`，默认输出：

```
/mermaid/index/a1b2c3d4.svg        ← defaultTheme（无后缀）
/mermaid/index/a1b2c3d4-dark.svg   ← dark 主题
```

Loader 始终返回无后缀的路径，由业务代码决定引用哪个主题的 SVG。

### 在组件中使用

```tsx
import diagramUrl from './flowchart.mmd'

// diagramUrl = "/mermaid/index/a1b2c3d4.svg"
function MyDiagram() {
  return <img src={diagramUrl} alt="flowchart" />
}
```

---

## Plugin

### 用途

扫描 Markdown 文件中的 ` ```mermaid ` 代码块，批量渲染为 SVG 文件，输出到构建目录。适合 Docusaurus 等文档站点，自动将文档中的 mermaid 图表预渲染为静态 SVG。

### 配置

**Docusaurus 示例：**

```js
// docusaurus.config.js
import MermaidPreRenderPlugin from 'mermaid-prerender/plugin'

export default {
  plugins: [
    function mermaidPrerenderPlugin() {
      return {
        name: 'mermaid-prerender',
        configureWebpack() {
          return {
            plugins: [
              new MermaidPreRenderPlugin({
                catalogues: [
                  { entry: 'docs', name: 'zh-Hans' },
                  { entry: 'i18n/en/docusaurus-plugin-content-docs/current', name: 'en' },
                ],
                defaultLocale: 'zh-Hans',
                output: 'mermaid',
                themes: [
                  { name: 'light', theme: 'default' },
                  { name: 'dark', theme: 'dark' },
                ],
              }),
            ],
          }
        },
      }
    },
  ],
}
```

**通用 webpack / rspack 示例：**

```js
// webpack.config.js
import MermaidPreRenderPlugin from 'mermaid-prerender/plugin'

export default {
  plugins: [
    new MermaidPreRenderPlugin({
      catalogues: [{ entry: 'docs', name: 'default' }],
    }),
  ],
}
```

### options

| 字段            | 类型                                | 默认值                                                                   | 说明                                                                                                                 |
| --------------- | ----------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `catalogues`    | `{ entry: string; name: string }[]` | **必填**                                                                 | 扫描目录列表。`entry` 为 Markdown 文件所在目录，`name` 为语言标识                                                    |
| `defaultLocale` | `string`                            | 无                                                                       | 默认语言。当构建输出目录直接是 `/build`（非 `/build/{locale}`）时使用该语言匹配 `catalogues`；不指定时所有语言都编译 |
| `output`        | `string`                            | `'mermaid'`                                                              | SVG 输出目录，相对于 `output.path`                                                                                   |
| `themes`        | `{ name: string; theme: string }[]` | `[{ name: 'light', theme: 'default' }, { name: 'dark', theme: 'dark' }]` | 同 loader 的主题配置                                                                                                 |

### 语言匹配逻辑

Plugin 根据 webpack 的 `output.path` 推断当前构建的语言：

- `/build/zh-Hans` → 语言 `zh-Hans`，只渲染 `catalogues` 中 `name === 'zh-Hans'` 的目录
- `/build`（一级目录）→ 使用 `defaultLocale` 匹配
- 未匹配到且无 `defaultLocale` → 所有语言都编译

这样确保 Docusaurus 按语言分别构建时，只渲染当前语言的图表，不会重复工作。

**不需要多语言的普通项目**：不提供 `defaultLocale`，所有 `catalogues` 都会被编译，SVG 统一输出到 `output` 目录下，结构为 `{output}/{catalogue.name}/{theme}/{hash}.svg`。

### 输出目录结构

```
/build/mermaid/{lang}/{theme}/{hash}.svg
```

例如：

```
build/mermaid/zh-Hans/light/a1b2c3d4.svg
build/mermaid/zh-Hans/dark/a1b2c3d4.svg
build/mermaid/en/light/e5f6g7h8.svg
build/mermaid/en/dark/e5f6g7h8.svg
```

### 去重

同一语言内，相同源码的代码块只会渲染一次（按 `source + hash` 去重）。

---

## 环境变量

Loader 和 Plugin 都会自动加载项目根目录的 `.env` 和 `.env.local` 文件。以下环境变量会影响行为：

| 环境变量        | 说明                                                                                 |
| --------------- | ------------------------------------------------------------------------------------ |
| `CI`            | 设为任意值时使用 `/usr/bin/chromium-browser --no-sandbox` 启动浏览器（适配 CI 环境） |
| `CHROMIUM_PATH` | 自定义 Chromium 可执行文件路径                                                       |

---

## CI 环境

在 CI 中需要安装 Chromium：

```Dockerfile
# 以 Ubuntu 为例
RUN apt-get update && apt-get install -y chromium-browser
```

设置 `CI=true` 后，worker 会自动使用 `--no-sandbox` 模式启动 Chromium。

---

## 与 mermaid-isomorphic 的关系

本包依赖 `mermaid-isomorphic` 完成实际渲染。`mermaid-isomorphic` 在 Worker 线程中管理 Puppeteer 浏览器实例，本包负责：

- **Worker 池管理**：复用 Worker 实例，引用计数归零时自动销毁
- **构建工具集成**：Loader 通过 `emitFile` 输出资源，Plugin 通过 `afterEmit` hook 批量写入
- **Hash 去重**：相同源码 → 相同输出文件名，避免重复渲染
- **多主题输出**：一次渲染输出多个主题的 SVG

## License

MIT
