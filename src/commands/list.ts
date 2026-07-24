import { Command } from 'commander'
import { logger } from '../utils/logger.js'

export function registerListCommand(program: Command) {
  program
    .command('list')
    .description('列出所有实例')
    .action(async () => {
      logger.info('正在获取实例列表...')
      logger.gray('暂无实例数据')
      console.log('📋 实例列表（待实现）')
    })
}
