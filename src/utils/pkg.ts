import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentFile = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFile)

export async function getPackageVersion() {
  const rootPath = path.resolve(currentDir, '../../')
  const pkgPath = path.join(rootPath, 'package.json')
  const pkgRaw = await fs.readFile(pkgPath, 'utf-8')
  return JSON.parse(pkgRaw) as { version: string }
}
