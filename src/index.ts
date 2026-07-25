import { Command } from 'commander'
import { registerCreateCommand } from './commands/create.ts'
import { registerListCommand } from './commands/list.ts'
import { registerRunCommand } from './commands/run.ts'
import { catchError } from './prompts/common.prompt.ts'
import { printBanner } from './utils/logger.ts'
import { getPackageVersion } from './utils/pkg.ts'

const program = new Command()

async function bootstrap() {
  const { version } = await getPackageVersion()
  program
    .name('pbvm')
    .description('pbvm 通过 @puppeteer/browsers 管理浏览器版本')
    .version(version, '-v, --version', '输出版本号')

  registerCreateCommand(program)
  registerListCommand(program)
  registerRunCommand(program)

  const args = process.argv.slice(2)
  const skipBannerFlags = ['-v', '--version', '-h', '--help']
  const needBanner = !args.some((arg) => skipBannerFlags.includes(arg))

  if (needBanner) printBanner()
  await program.parseAsync()
}

bootstrap().catch((err) => {
  catchError(err)
})
