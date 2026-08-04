import type { Command } from 'commander'
import { mirrorBrowser } from '../bin/mirror.script.js'
import { promptMirrorOptions } from '../prompts/mirror.prompt.js'
import { mirrorSchema } from '../types/index.js'

export function registerMirrorCommand(program: Command) {
  program
    .command('mirror')
    .description('Set browser download mirror.')
    .option('-s, --source <source>', 'Image name.')
    .option('-i, --init', 'Create a mirror source file in the current directory.')
    .action(async (opts: unknown) => {
      const options = mirrorSchema.parse(opts)
      const { source } = await promptMirrorOptions(options)

      await mirrorBrowser({ init: options.init, source })
    })
}
