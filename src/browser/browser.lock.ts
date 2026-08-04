import {
  getInstalledBrowsers as pbGetInstalledBrowsers,
  install as pbInstall,
  uninstall as pbUninstall,
} from '@puppeteer/browsers'
import type {
  GetInstalledBrowsersOptions,
  InstallOptions,
  UninstallOptions,
} from '@puppeteer/browsers'
import { acquireLock, waitForLock } from '../utils/lock.js'
import { PBVM_PATHS } from '../utils/paths.js'

export async function getInstalledBrowsers(opts: GetInstalledBrowsersOptions) {
  await waitForLock({ lockDir: PBVM_PATHS.cache })
  return await pbGetInstalledBrowsers(opts)
}

export async function install(
  opts: InstallOptions & { unpack?: true },
  interrupt: () => Promise<void>
) {
  const releaseLock = await acquireLock({ lockDir: PBVM_PATHS.cache })
  let isInstalled = false
  let isInterrupted = false

  const onInterrupt = async () => {
    if (isInterrupted || isInstalled) return
    isInterrupted = true

    // 先释放锁再执行清理，否则 interrupt 回调里的 removeBrowser → uninstall
    // 会尝试 acquireLock 同一把锁，形成死锁，导致 process.exit(1) 永远执行不到
    await releaseLock()

    try {
      await interrupt()
    } catch {
      // 中断清理过程中的错误忽略，确保 process.exit 一定执行
    }

    process.exit(1)
  }

  process.once('SIGINT', onInterrupt)
  process.once('SIGTERM', onInterrupt)

  try {
    const result = await pbInstall(opts)
    isInstalled = true
    return result
  } finally {
    process.off('SIGINT', onInterrupt)
    process.off('SIGTERM', onInterrupt)
    if (!isInterrupted) {
      await releaseLock()
    }
  }
}

export async function uninstall(opts: UninstallOptions) {
  const releaseLock = await acquireLock({ lockDir: PBVM_PATHS.cache })
  try {
    await pbUninstall(opts)
  } finally {
    await releaseLock()
  }
}
