import { detectBrowserPlatform } from '@puppeteer/browsers'
import type { Command } from 'commander'
import { clearBrowser } from '../bin/clear.script.js'
import { promptConfirm } from '../prompts/common.prompt.js'
import { promptManifestOptions } from '../prompts/manifest.prompt.js'
import { runBrowserSchema } from '../types/index.js'
import type { RemoveBrowserOpts } from '../types/index.js'
import { logger } from '../utils/logger.js'
import { findBrowserList } from '../utils/manifest.js'

export function registerClearCommand(program: Command) {
  program
    .command('clear')
    .description('Delete the specified browser profile folder and clear the cache.')
    .option('-t, --target <target>', '{browser}@{buildId}')
    .action(async (opts: unknown) => {
      const { target } = runBrowserSchema.parse(opts)
      const selectItem = target ? await findBrowserList(target, { store: true }) : undefined

      let info: Pick<RemoveBrowserOpts, 'browser' | 'buildId'> | undefined | null = null
      if (selectItem) {
        info = selectItem
        logger.info(`Found the browser: ${selectItem.browser}@${selectItem.buildId}`)
      } else {
        logger.info(
          target ? 'The specified browser was not found. Please select:' : 'Select browser:'
        )

        logger.newline()
        const manifest = await promptManifestOptions({
          platform: detectBrowserPlatform(),
          store: true,
        })

        if (!manifest) {
          logger.warn('No browser matching the operation requirements was found in the project.')
          logger.newline()
          return
        }

        info = { ...manifest }
      }

      logger.newline()
      const ok = await promptConfirm(
        `Clearing the ${info.browser}@${info.buildId} will remove: cookies, favorites, history, preferences, system trust, etc.`
      )

      if (!ok) {
        logger.warn('Cancel operation.')
        logger.newline()
        return
      }

      logger.newline()
      await clearBrowser(info)
    })
}
