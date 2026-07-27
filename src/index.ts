import { Command } from 'commander'
import { registerCreateCommand } from './commands/create.js'
import { registerListCommand } from './commands/list.js'
import { registerRemoveCommand } from './commands/remove.js'
import { registerSearchCommand } from './commands/search.js'
import { registerStoreCommand } from './commands/store.js'
import { catchError } from './prompts/common.prompt.js'
import { printBanner } from './utils/logger.js'
import { getPackageVersion } from './utils/pkg.js'

const program = new Command()

async function bootstrap() {
  const { version } = await getPackageVersion()
  program
    .name('pbvm')
    .description('pbvm 通过 @puppeteer/browsers 管理浏览器版本')
    .version(version, '-v, --version', '输出版本号')

  registerCreateCommand(program)
  registerListCommand(program)
  registerRemoveCommand(program)
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
