import chalk from 'chalk'
import ora from 'ora'

/**
 * 获取字符串在终端的可视宽度
 * 中文/全角符号 = 2，其余 = 1
 */
function getDisplayWidth(str: string): number {
  let width = 0
  for (const char of str) {
    // 中日韩统一表意文字 + 全角符号区间
    const code = char.codePointAt(0)!
    if ((code >= 0x4e00 && code <= 0x9fff) || (code >= 0xff00 && code <= 0xffef)) {
      width += 2
    } else {
      width += 1
    }
  }
  return width
}

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

/**
 * 根据可视宽度补齐空格，实现终端对齐
 * @param str 原始字符串
 * @param targetWidth 目标可视宽度
 */
export function padEndByDisplayWidth(str: string, targetWidth: number): string {
  const w = getDisplayWidth(str)
  return w >= targetWidth ? str : str + ' '.repeat(targetWidth - w)
}
