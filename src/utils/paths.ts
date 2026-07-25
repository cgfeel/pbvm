import path from 'node:path'
import { fileURLToPath } from 'node:url'
import envPaths from 'env-paths'

// cache（重点放浏览器二进制）：可删除、程序能重新下载，系统磁盘清理工具允许清空这个目录。
// data：存放实例元数据、运行状态、数据库；不能随意删除。
// config：用户自定义配置文件（代理、下载镜像源、默认模板等）。
// temp: 临时目录
const { cache, data, config, temp } = envPaths('pbvm')

export const BROWSER_CACHE_DIR = path.join(cache, 'browsers')
export const PBVM_PATHS = { cache, data, config, temp }

export const getRootPath = () => {
  const currentFile = fileURLToPath(import.meta.url)
  const currentDir = path.dirname(currentFile)
  return path.resolve(currentDir, '../../')
}
