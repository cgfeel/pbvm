import type { Command } from 'commander'
import { installBrowser } from '../bin/install.script.js'
import { promptConfirm } from '../prompts/common.prompt.js'
import { promptCreateOptions } from '../prompts/create.prompt.js'
import { createBrowserSchema } from '../types/index.js'
import { logger } from '../utils/logger.js'

export function registerCreateCommand(program: Command) {
  program
    .command('create')
    .description('Download and install the specified browser.')
    .option('-b, --browser <browser>', "Browser's name")
    .option('-i, --build-id <buildId>', "Browser's buildId")
    .option('-a, --alias <alias>', "Browser's alias")
    .option('-s, --store', 'Only saved in the store directory')
    .action(async function (opts: unknown) {
      // 参数缺失则唤起交互
      const { store, ...options } = createBrowserSchema.parse(opts)
      const args = await promptCreateOptions(options)
      const ok = await promptConfirm(
        `Create browser: ${args.browser}@${args.buildId}, alias: ${args.alias || 'Dynamic name'} ?`
      )

      if (!ok) {
        logger.warn('Cancel operation.')
        logger.newline()
        return
      }

      await installBrowser({ ...args, store })
    })
}
