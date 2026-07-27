import { detectBrowserPlatform } from '@puppeteer/browsers'
import type { Command } from 'commander'
import { type OpenBrowserOpts, openBrowser } from '../bin/open.script.js'
import { promptManifestOptions } from '../prompts/manifest.prompt.js'
import { openBrowserSchema } from '../types/index.js'
import { logger } from '../utils/logger.js'
import { findBrowserList } from '../utils/manifest.js'

export function registerOpenCommand(program: Command) {
  program
    .command('open')
    .description('Open the specified browser')
    .option('-t, --target <target>', '{browser}@{buildId} or {alias}')
    .option('-u, --url <url>', 'Visit the specified URL')
    .action(async (opts: unknown) => {
      const { target, url } = openBrowserSchema.parse(opts)
      const platform = detectBrowserPlatform()

      let selectItem = target ? await findBrowserList(target, platform) : undefined
      let info: Omit<OpenBrowserOpts, 'alias'> | undefined | null = null

      if (selectItem) {
        info = selectItem
        logger.info(
          `Found the browser: ${selectItem.browser}@${selectItem.buildId}, alias: ${selectItem.alias}`
        )
      } else {
        logger.info(
          target ? 'No browser found that can be open. Please select:' : 'Select browser:'
        )

        logger.newline()
        const manifest = await promptManifestOptions({ platform })

        if (!manifest) {
          logger.warn('No browser matching the operation requirements was found in the project.')
          logger.newline()
          return
        }

        info = { ...manifest, platform: manifest.platform ?? '' }
      }

      logger.newline()
      await openBrowser({ ...info, url })
    })
}
