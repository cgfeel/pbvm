import chalk from 'chalk'
import ora from 'ora'

const { bold, cyan, gray, green } = chalk

export const logger = {
  boot: (msg: string) => console.log(chalk.yellowBright(`🚀 ${msg}`)),
  error: (msg: string) => console.log(chalk.red(`❌ ${msg}`)),
  info: (msg: string) => console.log(chalk.blue(`ℹ ${msg}`)),
  success: (msg: string) => console.log(chalk.green(`✅ ${msg}`)),
  warn: (msg: string) => console.log(chalk.yellow(`⚠️ ${msg}`)),

  newline: () => console.log(''),
  spinner: (text?: string) => ora({ color: 'cyan', text }),

  bold,
  cyan,
  gray,
  green,
}

export function printBanner() {
  const text = `
${chalk.green.bold('  ██████╗ ██████╗ ██╗   ██╗███╗   ███╗')}
${chalk.green.bold('  ██╔══██╗██╔══██╗██║   ██║████╗ ████║')}
${chalk.green.bold('  ██████╔╝██████╔╝██║   ██║██╔████╔██║')}
${chalk.green.bold('  ██╔═══╝ ██╔══██╗╚██╗ ██╔╝██║╚██╔╝██║')}
${chalk.green.bold('  ██║     ██████╔╝ ╚████╔╝ ██║ ╚═╝ ██║')}
${chalk.green.bold('  ╚═╝     ╚═════╝   ╚═══╝  ╚═╝     ╚═╝')}
${chalk.gray('  ─── PBVM · 浏览器版本管理工具  · 基于 Puppeteer Browsers ───')}
`
  console.log(text)
}
