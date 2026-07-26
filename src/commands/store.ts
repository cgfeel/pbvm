import type { Command } from 'commander'
import { listBrowser } from '../bin/list.js'
import type { ListOptions } from '../types/index.js'

export function registerStoreCommand(program: Command) {
  program
    .command('store')
    .description('List all installed browsers in the cache directory store cache directory.')
    .action(async (opts: ListOptions) => {
      listBrowser({ all: Boolean(opts), store: true })
    })
}
