export interface CreateOptions {
  alias?: string
  browser?: 'chrome' | 'chromium' | 'firefox'
  buildId?: string
}

// run 命令参数类型
export interface RunOptions {
  target?: string
}
