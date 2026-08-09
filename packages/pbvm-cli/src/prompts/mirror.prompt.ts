import { select } from '@inquirer/prompts'
import type z from 'zod'
import type { mirrorSchema } from '../types/index.js'
import { logger } from '../utils/logger.js'

export async function promptMirrorOptions(partial: z.infer<typeof mirrorSchema>) {
  let { init, source } = partial
  if (!source) {
    const name = init ? 'current directory' : 'global'
    source = await select({
      message: logger.cyan(`Select a rule as the ${name} mirror: `),
      choices: [
        { name: `Use npmmirror as a ${name} mirror`, value: 'npmmirror' },
        { name: `Remove the image from the ${name}`, value: '' },
      ],
    })

    logger.newline()
  }

  return { source }
}
