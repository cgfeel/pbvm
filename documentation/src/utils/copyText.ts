export async function copyText(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Clipboard API 复制失败，尝试降级方案
    }
  }

  if (typeof document === 'undefined') return false
  const textarea = document.createElement('textarea')

  try {
    textarea.value = text
    textarea.style.cssText = 'position: fixed; left: -9999px; top: -9999px; opacity: 0;'
    textarea.setAttribute('readonly', 'readonly')
    document.body.appendChild(textarea)

    textarea.focus()
    textarea.select()

    return document.execCommand('copy')
  } catch {
    // execCommand copy failed
    return false
  } finally {
    textarea.remove()
  }
}
