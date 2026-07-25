import type { Command } from 'commander'
import { installBrowser } from '../bin/install-browser.ts'
import { promptConfirm } from '../prompts/common.prompt.ts'
import { promptCreateOptions } from '../prompts/create.prompt.ts'
import type { CreateOptions } from '../types/index.ts'
import { logger } from '../utils/logger.ts'

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
