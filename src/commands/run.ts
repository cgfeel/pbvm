import { input } from '@inquirer/prompts'
import type { Command } from 'commander'
import { catchError } from '../prompts/common.prompt.ts'
import type { RunOptions } from '../types/index.ts'
import { logger } from '../utils/logger.ts'

export function registerRunCommand(program: Command) {
  program
    .command('run')
    .description('运行指定实例')
    .option('--target <name>', '目标实例')
    .action(async (opts: RunOptions) => {
      let { target } = opts
      if (!target) {
        try {
          target = await input({
            message: logger.cyan('输入要运行的实例名称：'),
          })
        } catch (error) {
          catchError(error)
        }
      }
      logger.boot(`准备启动实例：${logger.bold(target)}`)
    })
}
