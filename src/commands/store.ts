import type { Command } from 'commander'
import { logger } from '../utils/logger.ts'

// test fix-3
export function registerListCommand(program: Command) {
  program
    .command('store')
    .description('List all installed browsers in the cache directory store cache directory.')
    .action(async () => {
      logger.info('正在获取实例列表...')
      logger.gray('暂无实例数据')
      console.log('📋 实例列表（待实现）')
    })
}
