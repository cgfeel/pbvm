import type { ReactNode } from 'react'
import styles from './styles.module.css'

type FeatureItem = {
  icon: string
  title: string
  description: string
}

const FeatureList: FeatureItem[] = [
  {
    icon: '🧭',
    title: '多浏览器支持',
    description:
      '统一管理 Chrome、Chromium、Firefox 多个版本，通过简单别名切换，无需记住复杂的 buildId。',
  },
  {
    icon: '📦',
    title: '项目级清单',
    description:
      '每个项目通过 browserlist.json 声明所需浏览器，团队成员和 CI 环境一键同步，确保一致性。',
  },
  {
    icon: '🔒',
    title: 'Profile 隔离',
    description:
      '每个浏览器实例拥有独立的 profile 目录，cookies、偏好设置互不干扰，测试场景完全隔离。',
  },
  {
    icon: '⚡',
    title: '即装即用',
    description:
      '一条命令完成下载、安装、别名设置，启动浏览器时自动配置，禁用更新和干扰弹窗，开箱即用。',
  },
  {
    icon: '🌐',
    title: '跨平台',
    description:
      '支持 macOS、Linux、Windows，自动检测平台并匹配对应的浏览器二进制文件。',
  },
  {
    icon: '🛠️',
    title: '开发友好',
    description:
      '提供 JavaScript API 供程序化调用，支持 search 命令查询远程资源可用性，适合自动化流水线。',
  },
]

function Feature({ icon, title, description }: FeatureItem) {
  return (
    <div className={styles.card}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.desc}>{description}</p>
    </div>
  )
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className={styles.grid}>
        {FeatureList.map((props, idx) => (
          <Feature key={idx} {...props} />
        ))}
      </div>
    </section>
  )
}
