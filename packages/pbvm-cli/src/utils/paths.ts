import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Browser } from '@puppeteer/browsers'
import envPaths from 'env-paths'

// cache: （重点放浏览器二进制）可删除、程序能重新下载，系统磁盘清理工具允许清空这个目录。
// data: （用户长期 profile）存放实例元数据、运行状态、数据库；不能随意删除。
// config: 用户自定义配置文件（代理、下载镜像源、默认模板等）。
// log: 日志
// temp: （info 临时检测）临时目录
const { cache, data, config, log, temp } = envPaths('pbvm')

export const PBVM_PATHS = { cache, data, config, log, temp }
export const baseInfo = { cacheDir: PBVM_PATHS.cache }

// 获取执行文件的信息
export async function getFileInfo(filePath: string): Promise<{
  exists: boolean
  createdAt?: Date
  error?: string
  size?: number
  modifiedAt?: Date
  isFile?: boolean
}> {
  try {
    const stat = await fs.stat(filePath)
    return {
      createdAt: stat.birthtime,
      exists: true,
      isFile: stat.isFile(),
      modifiedAt: stat.mtime,
      size: stat.size,
    }
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export function getProfileDir(browser: Browser, buildId: string) {
  return path.join(PBVM_PATHS.data, 'profiles', browser, buildId)
}

export function getTmpDir(browser: Browser, buildId: string) {
  return path.join(PBVM_PATHS.temp, 'profiles', `${browser}-${buildId}-${Date.now()}`)
}

// 获取安装包的根目录
export function getRootPath() {
  const currentFile = fileURLToPath(import.meta.url)
  const currentDir = path.dirname(currentFile)
  return path.resolve(currentDir, '../../')
}
