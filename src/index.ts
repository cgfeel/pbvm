import { Command } from 'commander'
import { registerAliasCommand } from './commands/alias.js'
import { registerClearCommand } from './commands/clear.js'
import { registerCreateCommand } from './commands/create.js'
import { registerInfoCommand } from './commands/info.js'
import { registerListCommand } from './commands/list.js'
import { registerMirrorCommand } from './commands/mirror.js'
import { registerOpenCommand } from './commands/open.js'
import { registerRemoveCommand } from './commands/remove.js'
import { registerRestoreCommand } from './commands/restore.js'
import { registerSearchCommand } from './commands/search.js'
import { registerStoreCommand } from './commands/store.js'
import { catchError } from './prompts/common.prompt.js'
import { printBanner, projectDesc } from './utils/logger.js'
import { getPackageVersion } from './utils/pkg.js'

const program = new Command()

async function bootstrap() {
  const { version } = await getPackageVersion()
  program
    .name('pbvm')
    .description(projectDesc)
    .version(version, '-v, --version', 'Output version number')

  registerAliasCommand(program)
  registerClearCommand(program)
  registerCreateCommand(program)
  registerInfoCommand(program)
  registerListCommand(program)
  registerMirrorCommand(program)
  registerOpenCommand(program)
  registerRemoveCommand(program)
  registerRestoreCommand(program)
  registerSearchCommand(program)
  registerStoreCommand(program)

  // 保留，为日后脚本自动化做准备
  // registerRunCommand(program)

  const args = process.argv.slice(2)
  const skipBannerFlags = ['-v', '--version', '-h', '--help']
  const needBanner = !args.some((arg) => skipBannerFlags.includes(arg))

  if (needBanner) printBanner()
  await program.parseAsync()
}

bootstrap().catch((err) => {
  catchError(err)
})
