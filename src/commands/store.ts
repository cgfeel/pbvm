import type { Command } from 'commander'
import { listBrowser } from '../bin/list.script.js'

export function registerStoreCommand(program: Command) {
  program
    .command('store')
    .description('List all installed browsers in the store directory.')
    .option('-a, --all', 'Display all platform browsers.')
    .action(async (opts: unknown) => {
      listBrowser({ ...(typeof opts === 'object' && opts !== null ? opts : {}), store: true })
    })
}
