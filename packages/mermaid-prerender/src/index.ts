/**
 * djb2 32-bit hash — Node.js 与浏览器行为完全一致。
 * 组件里有一份相同的实现，两边同步。
 */
export function hashString(str: string) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i)
    hash = hash >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}
