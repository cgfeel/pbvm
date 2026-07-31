import { useCallback, useState, type ReactNode } from 'react'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import HomepageFeatures from '@site/src/components/HomepageFeatures'
import CodeBlock from '@theme/CodeBlock'
import Layout from '@theme/Layout'
import clsx from 'clsx'
import styles from './index.module.css'

const PKG_MANAGERS = [
  { key: 'npm', label: 'npm', cmd: 'npm install -g pbvm-cli' },
  { key: 'pnpm', label: 'pnpm', cmd: 'pnpm add -g pbvm-cli' },
] as const

const INSTALL_CODE = `# npm
npm install -g pbvm-cli

# pnpm
pnpm add -g pbvm-cli`

const QUICKSTART_CODE = `# 安装 Chrome 并设置别名
pbvm create -b chrome -i 134.0.6998.35 -a prod

# 查看已安装的浏览器
pbvm ls

# 以别名打开浏览器
pbvm open -t prod

# 查看浏览器详细信息（含运行时）
pbvm info -t prod -r

# 查询远程是否有可用版本
pbvm search -b firefox -i stable_136.0.0`

function InstallBar() {
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)

  const copy = useCallback(() => {
    navigator.clipboard.writeText(PKG_MANAGERS[active].cmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [active])

  return (
    <div className={styles.installBar}>
      <div className={styles.installTabs}>
        {PKG_MANAGERS.map((pkg, i) => (
          <button
            key={pkg.key}
            type="button"
            className={clsx(styles.installTab, i === active && styles.installTabActive)}
            onClick={() => setActive(i)}
          >
            {pkg.label}
          </button>
        ))}
      </div>
      <div className={styles.installCmd}>
        <code className={styles.installCode}>{PKG_MANAGERS[active].cmd}</code>
        <button type="button" className={styles.copyBtn} onClick={copy}>
          {copied ? '✓ Copied' : '📋'}
        </button>
      </div>
    </div>
  )
}

function HomepageHeader() {
  return (
    <header className={styles.hero}>
      <div className={clsx('container', styles.heroContainer)}>
        <div className={styles.heroLeft}>
          <span className={styles.badge}>
            <span className={styles.badgeDot} />
            v1.0 已发布
          </span>
          <h1 className={styles.heroTitle}>
            浏览器版本<br />
            <span className={styles.heroGradient}>管理从未如此简单</span>
          </h1>
          <p className={styles.heroSubtitle}>
            基于 @puppeteer/browsers，一条命令安装、切换、管理多个浏览器版本，
            为开发与自动化测试而生。
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.btnPrimary} to="/intro">
              快速开始 →
            </Link>
            <Link className={styles.btnGhost} to="/commands/create">
              命令参考
            </Link>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.terminal}>
            <div className={styles.terminalBar}>
              <span className={styles.terminalDot} />
              <span className={styles.terminalDot} />
              <span className={styles.terminalDot} />
              <span className={styles.terminalTitle}>Terminal</span>
            </div>
            <div className={styles.terminalBody}>
              <div>
                <span className={styles.terminalPrompt}>$ </span>
                <span className={styles.terminalCmd}>pbvm create -b chrome -i 134.0.6998.35 -a prod</span>
              </div>
              <div>
                <span className={styles.terminalComment}># Downloading Chrome 134.0.6998.35...</span>
              </div>
              <div>
                <span className={styles.terminalOut}>✅ Installed success: mac_arm:chrome@134.0.6998.35</span>
              </div>
              <div>
                <span className={styles.terminalOut}>✅ Successfully saved the log to the current directory.</span>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <span className={styles.terminalPrompt}>$ </span>
                <span className={styles.terminalCmd}>pbvm open -t prod</span>
              </div>
              <div>
                <span className={styles.terminalOut}>✅ Browser opened successfully.</span>
              </div>
            </div>
          </div>
          <InstallBar />
        </div>
      </div>
    </header>
  )
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title={siteConfig.title}
      description="基于 @puppeteer/browsers 的浏览器版本管理器，统一管理 Chrome、Chromium、Firefox 多个版本"
    >
      <HomepageHeader />
      <HomepageFeatures />

      <section className={styles.quickstart}>
        <div className="container">
          <p className={styles.sectionLabel}>Quick Start</p>
          <h2 className={styles.sectionTitle}>三分钟上手</h2>
          <p className={styles.sectionSub}>安装 pbvm，下载你的第一个浏览器</p>

          <div style={{ maxWidth: 640, margin: '0 auto 2rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>安装</p>
            <div className={styles.codeCard}>
              <CodeBlock language="bash">{INSTALL_CODE}</CodeBlock>
            </div>
          </div>

          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>常用命令</p>
            <div className={styles.codeCard}>
              <CodeBlock language="bash">{QUICKSTART_CODE}</CodeBlock>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className="container">
          <h2 className={styles.ctaTitle}>准备好开始了吗？</h2>
          <p className={styles.ctaSub}>安装 pbvm，享受流畅的浏览器版本管理体验。</p>
          <Link className={styles.btnPrimary} to="/intro">
            阅读文档 →
          </Link>
        </div>
      </section>
    </Layout>
  )
}
