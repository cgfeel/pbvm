import fs from 'node:fs/promises'
import path from 'node:path'

function isProcessAlive(pid: number) {
  try {
    // signal 0 不发送信号，仅检测进程是否存在，跨平台
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

async function tryCleanStaleLock(lockPath: string) {
  try {
    const content = await fs.readFile(lockPath, 'utf-8')
    const pid = Number(content)
    if (pid && !isProcessAlive(pid)) {
      await fs.unlink(lockPath).catch(() => {
        // nothing
      })
      return true
    }
  } catch {
    // 文件消失或读不到时忽略
  }
  return false
}

// 获取锁返回释放函数，超时抛错
export async function acquireLock(opts: LockOption = {}) {
  const { lockDir, retryDelay = 500, timeout = 60_000 } = opts
  const target = path.join(lockDir ?? process.cwd(), '.pbvm.lock')
  const start = Date.now()

  while (true) {
    try {
      await fs.writeFile(target, String(process.pid), { flag: 'wx' })
      return async () => {
        await fs.unlink(target).catch(() => {
          // nothing
        })
      }
    } catch (err) {
      if (err instanceof Error && 'code' in err && err.code === 'EEXIST') {
        if (Date.now() - start >= timeout) {
          throw new Error('Another pbvm operation is in progress, please try again later.')
        }

        const staleLock = await tryCleanStaleLock(target)
        if (staleLock) continue

        await new Promise((resolve) => setTimeout(resolve, retryDelay))
      } else {
        throw err instanceof Error
          ? err
          : new Error('The execution of acquireLock was interrupted by an exception.')
      }
    }
  }
}

//  等待锁释放（供只读操作使用），超时抛错
export async function waitForLock(opts: LockOption = {}) {
  const { lockDir, retryDelay = 500, timeout = 30_000 } = opts
  const target = path.join(lockDir ?? process.cwd(), '.pbvm.lock')
  const start = Date.now()

  while (true) {
    if (Date.now() - start >= timeout) {
      throw new Error('Another pbvm operation is in progress, please try again later.')
    }
    try {
      await fs.access(target)
    } catch (err) {
      if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
        return
      }

      throw err instanceof Error
        ? err
        : new Error('The execution of waitForLock was interrupted by an exception.')
    }

    const staleLock = await tryCleanStaleLock(target)
    if (staleLock) return

    await new Promise((resolve) => setTimeout(resolve, retryDelay))
  }
}

interface LockOption {
  lockDir?: string
  retryDelay?: number
  timeout?: number
}
