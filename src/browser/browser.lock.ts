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

  const onInterrupt = async () => {
    if (isInstalled) return
    await releaseLock()
    await interrupt()
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
    await releaseLock()
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
