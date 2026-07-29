export const isDefined = <T>(value: T | undefined): value is T => value !== undefined

export const isKey = <T extends Record<string, unknown>>(key: unknown, data: T): key is keyof T =>
  isPropertyKey(key) && key in data

export const isPropertyKey = (value: unknown): value is PropertyKey =>
  ['number', 'string', 'symbol'].includes(typeof value)

export const objectKeys = <T extends object, K = keyof T>(obj: T) => Object.keys(obj) as K[]
export const objectValues = <T extends object, V = ValueOf<T>>(obj: T) => Object.values(obj) as V[]

export const syncSecureExecute = (call: () => void) => {
  try {
    call()
  } catch {
    // nothing
  }
}

export type ValueOf<T> = T[keyof T]
