import type { Command } from 'commander'
import { listBrowser } from '../bin/list.js'

export function registerListCommand(program: Command) {
  program
    .command('ls')
    .description('List all installed browsers at the current directory.')
    .option('-a, --all', 'Display all platform browsers.')
    .action(listBrowser)
}
