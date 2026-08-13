import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'
import { detectForceDark, resetForceDarkSVG } from './utils/preventMermaid'

// 缓存是永久的，切夜间后新插入的图会一直用加载时的 false → 全部靠 attributes
// 修复是微任务级的，肉眼大概率无感，但如果引擎的改写有明显的闪烁帧，用户会看到图闪一下再恢复。
if (ExecutionEnvironment.canUseDOM) {
  let engineActive: boolean | undefined
  let probing = false

  const probe = async () => {
    if (probing) return
    probing = true

    const dark = await detectForceDark()
    probing = false

    if (dark !== engineActive) {
      engineActive = dark
      resetForceDarkSVG()
    }
  }

  window.addEventListener('focus', probe)
  window.addEventListener('visibilitychange', () => {
    if (!document.hidden) probe()
  })

  probe()
}
