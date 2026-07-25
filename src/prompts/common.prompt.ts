import { confirm } from '@inquirer/prompts'
import { logger } from '../utils/logger.ts'

export function catchError(error: unknown) {
  if (error instanceof Error && error.name === 'ExitPromptError') {
    logger.info('操作中断')
    process.exit(0)
  }

  if (error instanceof Error) {
    logger.error(error.message)
  }
  process.exit(1)
}

/**
 * 通用确认弹窗
 */
export async function promptConfirm(message: string, defaultValue = true) {
  try {
    return await confirm({ default: defaultValue, message })
  } catch (error) {
    catchError(error)
  }
}
