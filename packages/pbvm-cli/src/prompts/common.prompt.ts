import { confirm } from '@inquirer/prompts'
import { logger } from '../utils/logger.js'

export function catchError(error: unknown) {
  if (error instanceof Error && error.name === 'ExitPromptError') {
    logger.info('Operation Interrupted.')
    logger.newline()
    process.exit(0)
  }

  if (error instanceof Error) {
    logger.error(error.message)
  } else {
    logger.error(String(error))
  }

  logger.newline()
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
