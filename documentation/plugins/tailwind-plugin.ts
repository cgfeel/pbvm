import type { Plugin } from '@docusaurus/types'

export default function tailwindPlugin(): Plugin {
  return {
    name: 'tailwind-plugin',
    configurePostCss(postcssOptions) {
      // 只保留 tailwind，移除其他 PostCSS 插件避免干扰（参考 docusaurus-tailwind-shadcn-template）
      postcssOptions.plugins = [require('@tailwindcss/postcss')]
      return postcssOptions
    },
  }
}
