import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type z from 'zod'
import { mirrorFile } from '../mirror/mirror.provider.js'
import type { mirrorSchema } from '../types/index.js'
import { isKey } from '../utils/fields.js'
import { logger } from '../utils/logger.js'
import { PBVM_PATHS } from '../utils/paths.js'

const sourceMap = Object.freeze({
  npmmirror: 'npmmirror.json',
})

const disableMirror = async ({ init }: MirrorOptions) => {
  const dest = init ? process.cwd() : PBVM_PATHS.config
  await fs.promises.rm(path.join(dest, mirrorFile), { force: true })
}

const enableMirror = async ({ init, source }: MirrorOptions) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const src = path.resolve(__dirname, '../public/mirror', source)

  const dest = init ? process.cwd() : PBVM_PATHS.config
  const target = path.join(dest, mirrorFile)

  await fs.promises.mkdir(dest, { recursive: true })
  await fs.promises.copyFile(src, target)
}

export async function mirrorBrowser(options: MirrorOptions) {
  const { source } = options
  const file = isKey(source, sourceMap) ? sourceMap[source] : ''

  if (source && file === '') {
    logger.error('The set mirror rule file does not exist.')
    logger.newline()
    return
  }

  try {
    if (source) {
      await enableMirror({ ...options, source: file })
    } else {
      await disableMirror(options)
    }
    logger.success(`Successfully ${source ? 'enabled' : 'disabled'} the mirror.`)
  } catch (error) {
    logger.error(
      `The mirroring setup failed: ${error instanceof Error ? error.message : String(error)}`
    )
  }
  logger.newline()
}

type MirrorOptions = Pick<z.infer<typeof mirrorSchema>, 'init'> & {
  source: string
}
