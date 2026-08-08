import path from 'node:path'
import type { Plugin } from '@docusaurus/types'

export default function mermaidLoaderPlugin(): Plugin {
  return {
    name: 'mermaid-loader',
    configureWebpack(config) {
      config.module?.rules?.unshift({
        test: /\.mmd$/,
        use: [{ loader: path.resolve(__dirname, 'loader.mjs') }],
        type: 'javascript/auto',
        enforce: 'pre',
      })
    },
  }
}
