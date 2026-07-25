import type { Command } from 'commander'
import { installBrowser } from '../bin/install-browser.js'
import { promptConfirm } from '../prompts/common.prompt.js'
import { promptCreateOptions } from '../prompts/create.prompt.js'
import type { CreateOptions } from '../types/index.js'
import { logger } from '../utils/logger.js'

export function registerCreateCommand(program: Command) {
  program
    .command('create')
    .description('Download and install the specified browser.')
    .option('-p, --platform <platform>', 'System')
    .option('-b, --browser <browser>', "Browser's name")
    .option('-r, --revision <revision>', "Browser's buildId")
    .option('-a, --alias <alias>', "Browser's alias")
    .action(async function (opts: CreateOptions) {
      // 参数缺失则唤起交互
      const args = await promptCreateOptions(opts)
      if (!args.platform) {
        logger.error('Please select platform.')
        return
      }

      const ok = await promptConfirm(
        `Create browser: ${args.platform}:${args.browser}@${args.buildId}, alias: ${args.alias || 'Dynamic name'} ?`
      )

      if (!ok) {
        logger.warn('已取消创建')
        return
      }

      installBrowser(args)
    })
}
