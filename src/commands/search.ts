import type { Command } from 'commander'
import { searchBrowser } from '../bin/search.script.js'
import { promptCreateOptions } from '../prompts/create.prompt.js'
import { browserItemSchema } from '../types/index.js'

export function registerSearchCommand(program: Command) {
  program
    .command('search')
    .description('Query whether remote resources exist.')
    .option('-b, --browser <browser>', "Browser's name")
    .option('-i, --build-id <buildId>', "Browser's buildId")
    .action(async function (opts: unknown) {
      const options = browserItemSchema.parse(opts)
      const args = await promptCreateOptions({ ...options, alias: 'search-tmp' })

      await searchBrowser(args)
    })
}
