// 仅 chrome, chromiun 支持
interface Navigator {
  deviceMemory?: number
  userAgentData?: UserAgentData
}

interface BaseRecord {
  brands: BrandsItem[]
  mobile: boolean
  platform: string // 'macOS'
}

interface UserAgentData extends BaseRecord {
  // 这里暂且约束泛型的范围为 ValidHint，如果后期需要增加检测的字段再添加
  getHighEntropyValues?: <T extends ValidHint>(
    hints: T[]
  ) => Promise<HighEntropyRecord<T> & BaseRecord>
}

type BrandsItem = {
  brand: string
  version: string
}

type HighEntropyRecord<T extends string> = {
  // 排除空字符
  [K in T as Exclude<K, ''>]: K extends keyof MapHintType ? MapHintType[K] : unknown
}

type MapHintType = {
  architecture: string // 'x86'
  bitness: string // '64'
  fullVersionList: BrandsItem[]
  model: string // ''
  platformVersion: string // '12.7.6'
}

type ValidHint = keyof MapHintType
