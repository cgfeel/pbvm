import fs from 'node:fs'
import path from 'node:path'
import type { LoadContext, Plugin } from '@docusaurus/types'

export default function pwaManifestPlugin(context: LoadContext): Plugin {
  const baseUrl = context.baseUrl
  const display = 'standalone' as const

  return {
    name: 'pwa-manifest-plugin',
    async loadContent() {
      const { name = 'pbvm', description = '' } = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, '../../packages/pbvm-cli/package.json'), 'utf-8')
      ) as unknown as { description?: string; name?: string }

      const manifest = {
        background_color: '#ffffff',
        theme_color: '#1a1a1a',
        short_name: 'pbvm',
        scope: baseUrl,
        start_url: baseUrl,
        icons: [
          { src: 'img/icon-192.png', sizes: '192x192', type: 'image/png' },
          {
            src: 'img/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        description,
        display,
        name,
      }

      const staticDir = path.resolve(__dirname, '../static')
      fs.mkdirSync(staticDir, { recursive: true })
      fs.writeFileSync(
        path.join(staticDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2),
        'utf-8'
      )

      return manifest
    },
    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'link',
            attributes: {
              rel: 'manifest',
              href: `${baseUrl}manifest.json`,
            },
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'apple-touch-icon',
              href: `${baseUrl}img/icon-192.png`,
            },
          },
          {
            tagName: 'meta',
            attributes: {
              name: 'apple-mobile-web-app-capable',
              content: 'yes',
            },
          },
          {
            tagName: 'meta',
            attributes: {
              name: 'mobile-web-app-capable',
              content: 'yes',
            },
          },
          {
            tagName: 'script',
            attributes: { type: 'text/javascript' },
            innerHTML: `window.__BASE_URL__='${process.env.BASE_URL ?? '/pbvm/'}'`,
          },
          {
            tagName: 'script',
            attributes: {
              type: 'text/javascript',
              src: `${baseUrl}js/locale-redirect.js`,
            },
          },
        ],
      }
    },
  }
}
