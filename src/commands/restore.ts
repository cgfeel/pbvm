import { detectBrowserPlatform } from '@puppeteer/browsers'
import type { Command } from 'commander'
import { installBrowser } from '../bin/install.script.js'
import { removeBrowser } from '../bin/remove.script.js'
import { promptConfirm } from '../prompts/common.prompt.js'
import { promptCreateOptions } from '../prompts/create.prompt.js'
import { browserItemSchema } from '../types/index.js'
import { logger } from '../utils/logger.js'

export function registerRestoreCommand(program: Command) {
  program
    .command('restore')
    .description('Reinstall the browser.')
    .option('-b, --browser <browser>', "Browser's name")
    .option('-i, --build-id <buildId>', "Browser's buildId")
    .option('-a, --alias <alias>', "Browser's alias")
    .action(async function (opts: unknown) {
      // 和创建的命令一致，提供的参数匹配到现有的浏览器就删除后重转，没有匹配到就创建
      const args = await promptCreateOptions(browserItemSchema.parse(opts))
      const ok = await promptConfirm(
        `Reinstall the browser: ${args.browser}@${args.buildId}, alias: ${args.alias || 'Dynamic name'} ?`
      )

      if (!ok) {
        logger.warn('Cancel operation.')
        logger.newline()
        return
      }

      await removeBrowser({ ...args, focus: true, platform: detectBrowserPlatform() })
      await installBrowser(args)
    })
}
