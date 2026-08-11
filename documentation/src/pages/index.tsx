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
import { t } from '../utils/i18n'

const browserItems = Object.freeze({
  chrome: <ChromeIcon />,
  chromium: <ChromiumIcon />,
  firefox: <FirefoxIcon />,
})

const chromeTags = [
  { alias: 'mobile-test', version: '114.0.5734.0', active: true },
  { alias: 'bug-repro', version: '130.0.6723.116' },
] as const

const chromiumTags = [{ alias: 'automatization', version: '121231', active: true }] as const

const firefoxTags = [
  { alias: 'style-consistency', version: 'stable_129.0.2', active: true },
  { alias: 'mac-stable_131.0.3', version: 'stable_131.0.3' },
] as const

const browserTags = Object.freeze({
  chrome: chromeTags,
  chromium: chromiumTags,
  firefox: firefoxTags,
})

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout title={siteConfig.title} description={t('home.meta.description')}>
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

      <BuildTools subTitle={t('home.buildtools.sub1')} title={t('home.buildtools.title1')}>
        <BuildScript />
      </BuildTools>

      <BuildTools subTitle={t('home.buildtools.sub2')} title={t('home.buildtools.title2')}>
        <CreateScript />
      </BuildTools>

      <BottomStart />
    </Layout>
  )
}
