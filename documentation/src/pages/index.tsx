import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import BrowserFeatures from '@site/src/components/home/BrowserFeatures'
import Header from '@site/src/components/home/Header'
import InstallBar from '@site/src/components/home/InstallBar'
import Layout from '@theme/Layout'
import type { ReactNode } from 'react'
import ChromeIcon from '../../static/img/chrome-browser.svg'
import ChromiumIcon from '../../static/img/chromium-browser.svg'
import FirefoxIcon from '../../static/img/firefox-browser.svg'
import WhiteCard from '../components/card/WhiteCard'
import BottomStart from '../components/home/BottomStart'
import BrowserCard from '../components/home/BrowserCard'
import BuildTools from '../components/home/BuildTools'
import DevEnvironment from '../components/home/DevEnvironment'
import { BuildScript, CreateScript } from '../components/home/Script'
import System from '../components/home/System'
import Terminal from '../components/home/Terminal'
import { objectEntries } from '../utils/fields'

const browserItems = Object.freeze({
  chrome: <ChromeIcon />,
  chromium: <ChromiumIcon />,
  firefox: <FirefoxIcon />,
})

const chromeTags = [
  { alias: 'mobile-test', version: '114.0.5734.0', active: true },
  { alias: 'bug-repro', version: '130.0.6723.116' },
] as const

const chromiumTags = [
  { alias: 'old-device', version: '998119' },
  { alias: 'automatization', version: '121231', active: true },
  { alias: 'compatibility-test', version: '1012729' },
] as const

const firefoxTags = [
  { alias: 'style-consistency', version: 'firefox@stable_129.0.2', active: true },
] as const

const browserTags = Object.freeze({
  chrome: chromeTags,
  chromium: chromiumTags,
  firefox: firefoxTags,
})

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

      <BrowserFeatures>
        {objectEntries(browserItems).map(([name, val]) => (
          <WhiteCard key={name}>
            <BrowserCard
              logo={val}
              name={name}
              tags={name in browserTags ? browserTags[name] : []}
            />
          </WhiteCard>
        ))}
      </BrowserFeatures>

      <System />

      <DevEnvironment />

      <BuildTools subTitle="保障开发、构建与测试环境的一致性" title="可无缝集成到构建工具链中">
        <BuildScript />
      </BuildTools>

      <BuildTools subTitle="安装 pbvm，下载你的第一个浏览器" title="三分钟上手">
        <CreateScript />
      </BuildTools>

      <BottomStart />
    </Layout>
  )
}
