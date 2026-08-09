import type { Command } from 'commander'
import { searchBrowser } from '../bin/search.script.js'
import { promptCreateOptions } from '../prompts/create.prompt.js'
import { createBrowserSchema } from '../types/index.js'

export function registerSearchCommand(program: Command) {
  program
    .command('search')
    .description('Query whether remote resources exist.')
    .option('-b, --browser <browser>', "Browser's name")
    .option('-i, --build-id <buildId>', "Browser's buildId")
    .option('-m, --mirror <mirror>', 'Image file path')
    .option('-r, --rule  <rule>', 'Image rule like url search path: a=1&b=2')
    .action(async function (opts: unknown) {
      const { mirror, rule, ...options } = createBrowserSchema.parse(opts)
      const args = await promptCreateOptions({ ...options, alias: 'search-tmp' })

      await searchBrowser({ ...args, mirror, rule })
    })
}
