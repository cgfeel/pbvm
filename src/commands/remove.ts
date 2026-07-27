import type { Command } from 'commander'
import { removeBrowser } from '../bin/remove.script.js'
import { promptConfirm } from '../prompts/common.prompt.js'
import { promptManifestOptions } from '../prompts/manifest.prompt.js'
import { removeResultSchema } from '../types/index.js'
import { logger } from '../utils/logger.js'

export function registerRemoveCommand(program: Command) {
  program
    .command('remove')
    .description('Delete browser.')
    .option('-p, --platform <platform>', "Platform's name.")
    .option('-b, --browser <browser>', "Browser's name")
    .option('-i, --build-id <buildId>', "Browser's buildId")
    .option('-f, --force <force>', 'Simultaneously delete the browsers under the cache directory')
    .option('-s, --store', 'Only delete local store browser')
    .action(async function (opts: unknown) {
      const options = removeResultSchema.parse(opts)
      logger.info(
        options.store
          ? 'Remove the browser from the local store.'
          : 'Remove the browser from the browserlist.'
      )

      logger.newline()
      const info = await promptManifestOptions(options)

      if (!info) {
        logger.warn('No browser matching the operation requirements was found in the project.')
        logger.newline()
        return
      }

      let { focus, store } = options
      if (focus === undefined && !store) {
        focus = await promptConfirm('Should the store be deleted as well?')
      } else if (store) {
        focus = true
      }

      const ok = await promptConfirm(
        `Remove browser: ${info.platform}:${info.browser}@${info.buildId}?`
      )

      if (!ok) {
        logger.warn('Cancel operation.')
        logger.newline()
        return
      }

      await removeBrowser({ ...info, focus, store })
    })
}
