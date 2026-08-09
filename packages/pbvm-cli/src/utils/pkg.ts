import fs from 'node:fs/promises'
import path from 'node:path'
import z from 'zod'
import { getRootPath } from './paths.js'

const packageSchema = z.object({
  version: z.string(),
})

export async function getPackageVersion() {
  const rootPath = getRootPath()
  const pkgPath = path.join(rootPath, 'package.json')
  const pkgRaw = await fs.readFile(pkgPath, 'utf-8')
  const pkgResult = JSON.parse(pkgRaw) as unknown

  const { data, success } = packageSchema.safeParse(pkgResult)
  return success ? data : { version: '0.0.1' }
}
