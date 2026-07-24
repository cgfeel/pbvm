import { Command } from 'commander'
import { promptConfirm } from '../prompts/common.prompt.js'
import { promptCreateOptions } from '../prompts/create.prompt.js'
import { CreateOptions } from '../types/index.js'
import { logger } from '../utils/logger.js'

export function registerCreateCommand(program: Command) {
  program
    .command('create')
    .description('Download and install the specified browser.')
    .option('-b, --browser <browser>', "Browser's name")
    .option('-r, --revision <revision>', "Browser's buildId")
    .option('-a, --alias <alias>', "Browser's alias")
    .action(async function (opts: CreateOptions) {
      // 参数缺失则唤起交互
      const args = await promptCreateOptions(opts)
      const ok = await promptConfirm(
        `Create browser: ${args.browser}@${args.buildId}, alias: ${args.alias || 'Dynamic name'} ?`
      )
      if (!ok) {
        logger.warn('已取消创建')
        return
      }

      const spin = logger.spinner('正在初始化实例...')
      spin.start()

      // 模拟耗时业务逻辑，实际替换成你的代码
      await new Promise((resolve) => setTimeout(resolve, 1200))
      spin.succeed(logger.green(`✅ 实例创建完成 ${JSON.stringify(args)}`))
    })
}
