import type { Command } from 'commander'
import { installBrowser } from '../bin/install.script.js'
import { promptConfirm } from '../prompts/common.prompt.js'
import { promptCreateOptions } from '../prompts/create.prompt.js'
import { openBrowserSchema } from '../types/index.js'
import { logger } from '../utils/logger.js'
import { findBrowserList } from '../utils/manifest.js'

export function registerRunCommand(program: Command) {
  program
    .command('open')
    .description('Open the specified browser')
    .option('-t, --target <target>', '{browser}@{buildId} or {alias}')
    .option('-u, --url <url>', 'Visit the specified URL')
    .action(async (opts: unknown) => {
      const { target } = openBrowserSchema.parse(opts)
      let item = target ? await findBrowserList(target) : undefined
      if (!item) {
        const args = await promptCreateOptions({})
        const ok = await promptConfirm(
          `Create browser: ${args.browser}@${args.buildId}, alias: ${args.alias || 'Dynamic name'} ?`
        )

        if (!ok) {
          logger.warn('已取消创建')
          return
        }

        await installBrowser(args)
        item = {
          ...args,
          platform: '',
        }
      }
    })
}
