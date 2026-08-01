import type { FC } from 'react'
import styles from './style.module.css'

const BrowserFeatures: FC = () => {
  return (
    <div className={styles.browser}>
      <div className={styles.browserBox}>
        <h2>统一管理 Chrome、Chromium、Firefox 多个版本</h2>
      </div>
    </div>
  )
}

export default BrowserFeatures
