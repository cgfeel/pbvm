import type { Command } from 'commander'
import { aliasBrowser, type RemoveBrowserOpts } from '../bin/alias.script.js'
import { promptAliasOptions } from '../prompts/alias.prompt.js'
import { promptManifestOptions } from '../prompts/manifest.prompt.js'
import { aliasBrowserSchema } from '../types/index.js'
import { logger } from '../utils/logger.js'
import { findBrowserList } from '../utils/manifest.js'

export function registerAliasCommand(program: Command) {
  program
    .command('alias')
    .description('Set browser alias.')
    .option('-p, --platform <platform>', "Platform's name.")
    .option('-t, --target <target>', '{browser}@{buildId} or {alias}')
    .action(async function (opts: unknown) {
      const { platform, target } = aliasBrowserSchema.parse(opts)
      const selectItem = target ? await findBrowserList(target, platform) : undefined

      let info: Omit<RemoveBrowserOpts, 'alias'> | undefined | null = null
      if (selectItem) {
        info = selectItem
        logger.info(
          `Found the browser: ${selectItem.browser}@${selectItem.buildId}, alias: ${selectItem.alias}`
        )
      } else {
        logger.info(
          target ? 'No browser found that can be modified. Please select:' : 'Select browser:'
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

      const { alias } = await promptAliasOptions({ require: true })
      await aliasBrowser({ ...info, alias })
    })
}
