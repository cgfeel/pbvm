import { select } from '@inquirer/prompts'
import type z from 'zod'
import type { mirrorSchema } from '../types/index.js'
import { logger } from '../utils/logger.js'

export async function promptMirrorOptions(partial: z.infer<typeof mirrorSchema>) {
  let { source } = partial
  if (!source) {
    source = await select({
      message: logger.cyan('Select a rule as the global mirror: '),
      choices: [
        { name: 'Use npmmirror as a global mirror', value: 'npmmirror' },
        { name: 'Disable global mirroring', value: '' },
      ],
    })

    logger.newline()
  }

  return { source }
}
