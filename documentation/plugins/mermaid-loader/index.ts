import fs from 'node:fs'
import path from 'node:path'
import type { LoadContext, Plugin } from '@docusaurus/types'
// import { MermaidPreRenderPlugin } from 'mermaid-prerender'

export default function mermaidLoaderPlugin(context: LoadContext): Plugin {
  //   const output = 'mermaid'
  //   const { defaultLocale = 'en' } = context.siteConfig.i18n
  //   const { siteDir } = context

  return {
    name: 'mermaid-loader',
    configureWebpack(config) {
      //   const i18nDir = path.join(siteDir, 'i18n')
      //   const catalogues = fs
      //     .readdirSync(i18nDir, { withFileTypes: true })
      //     .filter((dirent) => dirent.isDirectory() && dirent.name !== defaultLocale)
      //     .map((dirent) => ({
      //       entry: path.join(
      //         siteDir,
      //         'i18n',
      //         `${dirent.name}/docusaurus-plugin-content-docs/current`
      //       ),
      //       name: dirent.name,
      //     }))

      //   config.plugins?.push(
      //     new MermaidPreRenderPlugin({
      //       catalogues: [...catalogues, { name: defaultLocale, entry: path.join(siteDir, 'docs') }],
      //       themes: [
      //         { name: 'light', theme: 'default' },
      //         { name: 'dark', theme: 'dark' },
      //       ],
      //       output,
      //     })
      //   )
      config.module?.rules?.unshift({
        test: /\.mmd$/,
        use: [{ loader: path.resolve(__dirname, 'loader.mjs') }],
        type: 'javascript/auto',
        enforce: 'pre',
      })
    },
  }
}
