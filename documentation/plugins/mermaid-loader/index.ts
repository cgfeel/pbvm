import path from 'node:path'
import type { Plugin } from '@docusaurus/types'
// import { plugin as MermaidPreRenderPlugin } from 'mermaid-prerender'

export default function mermaidLoaderPlugin(): Plugin {
  return {
    name: 'mermaid-loader',
    configureWebpack(config) {
      //   config.plugins?.push([new MermaidPreRenderPlugin()])
      config.module?.rules?.unshift({
        test: /\.mmd$/,
        use: [{ loader: path.resolve(__dirname, 'loader.mjs') }],
        type: 'javascript/auto',
        enforce: 'pre',
      })
    },
  }
}
