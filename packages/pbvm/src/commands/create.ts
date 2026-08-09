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
    .option('-m, --mirror <mirror>', 'Image file path')
    .option('-r, --rule  <rule>', 'Image rule like url search path: a=1&b=2')
    .option('-s, --store', 'Dynamic replacement of mirroring rules')
    .action(async function (opts: unknown) {
      // 参数缺失则唤起交互
      const { mirror, rule, store, ...options } = createBrowserSchema.parse(opts)
      const args = await promptCreateOptions(options)
      const ok = await promptConfirm(
        `Create browser: ${args.browser}@${args.buildId}, alias: ${args.alias || 'Dynamic name'} ?`
      )

      if (!ok) {
        logger.warn('Cancel operation.')
        logger.newline()
        return
      }

      await installBrowser({ ...args, mirror, rule, store })
    })
}
