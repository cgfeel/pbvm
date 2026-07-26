import type { Command } from 'commander'
import { storeBrowser } from '../bin/store.js'

export function registerStoreCommand(program: Command) {
  program
    .command('store')
    .description('List all installed browsers in the cache directory store cache directory.')
    .action(storeBrowser)
}
