import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
// import BrowserFeatures from '@site/src/components/home/BrowserFeatures'
import Header from '@site/src/components/home/Header'
import HomepageFeatures from '@site/src/components/home/HomepageFeatures'
import InstallBar from '@site/src/components/home/InstallBar'
import CodeBlock from '@theme/CodeBlock'
import Layout from '@theme/Layout'
import type { ReactNode } from 'react'
import Terminal from '../components/home/Terminal'
import styles from './index.module.css'

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

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title={siteConfig.title}
      description="基于 @puppeteer/browsers 的浏览器版本管理器，统一管理 Chrome、Chromium、Firefox 多个版本"
    >
      <Header>
        <Terminal />
        <InstallBar />
      </Header>

      {/* <BrowserFeatures /> */}

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
