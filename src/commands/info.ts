import { detectBrowserPlatform } from '@puppeteer/browsers'
import type { Command } from 'commander'
import { type AliasBrowserOpts } from '../bin/alias.script.js'
import { infoBrowser } from '../bin/info.script.js'
import { promptManifestOptions } from '../prompts/manifest.prompt.js'
import { infoBrowserSchema } from '../types/index.js'
import { logger } from '../utils/logger.js'
import { findBrowserList } from '../utils/manifest.js'

// 所有允许通过 alisa 操作的命令，都用 target: {browser}@{buildId}，否则分开作为参数
export function registerInfoCommand(program: Command) {
  program
    .command('info')
    .description('View locally stored browser information.')
    .option('-t, --target <target>', '{browser}@{buildId}')
    .option('-r, --runtime', '{browser}@{buildId}')
    .action(async function (opts: unknown) {
      const { runtime, target } = infoBrowserSchema.parse(opts)
      const selectItem = target ? await findBrowserList(target, { store: true }) : undefined

      let info: Omit<AliasBrowserOpts, 'alias'> | undefined | null = null
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

        info = { ...manifest, platform: manifest.platform ?? '' }
      }

      logger.newline()
      await infoBrowser({ ...info, runtime })
    })
}
