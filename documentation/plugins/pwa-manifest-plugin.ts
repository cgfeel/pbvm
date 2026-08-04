import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from '@docusaurus/types'

export default function pwaManifestPlugin(): Plugin {
  return {
    name: 'pwa-manifest-plugin',
    async loadContent() {
      const { name = 'pbvm', description = '' } = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf-8')
      ) as unknown as { description?: string; name?: string }

      const baseUrl = process.env.BASE_URL ?? '/pbvm/'
      const display = 'standalone' as const

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
  }
}
