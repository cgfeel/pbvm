const isVerbose = () => process.argv.includes('--verbose')
export function createLogger(tag: string) {
  const tagName = `[${tag}]`
  return {
    error: (...args: unknown[]) => console.error(tagName, ...args),
    info: (...args: unknown[]) => console.info(tagName, ...args),
    log: (...args: unknown[]) => console.log(tagName, ...args),
    success: (...args: unknown[]) => console.log(tagName, ...args),
    warn: (...args: unknown[]) => console.warn(tagName, ...args),

    // 仅在 --verbose 时输出
    verbose: (...args: unknown[]) => {
      if (isVerbose()) console.log(tagName, ...args)
    },

    // 无前缀输出，用于缩进详情
    raw: {
      log: (...args: unknown[]) => console.log(...args),
      error: (...args: unknown[]) => console.error(...args),
      verbose: (...args: unknown[]) => {
        if (isVerbose()) console.log(...args)
      },
    },
  }
}

export type Logger = ReturnType<typeof createLogger>
