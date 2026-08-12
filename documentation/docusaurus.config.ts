import fs from 'node:fs'
import path from 'node:path'

const envPath = path.resolve(__dirname, '.env')
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath)
}

import type * as Preset from '@docusaurus/preset-classic'
import type { Config } from '@docusaurus/types'
import { themes as prismThemes } from 'prism-react-renderer'

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...) - 1

const rootPkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../packages/pbvm-cli/package.json'), 'utf-8')
) as unknown as {
  name?: string
  description?: string
}

const config: Config = {
  title: rootPkg?.name ?? 'pbvm',
  tagline: rootPkg?.description ?? 'pbvm documentation',
  favicon: 'img/favicon.svg',
  stylesheets: [
    {
      href: `${process.env.BASE_URL ?? '/pbvm/'}font/local/font.css?family=Inter:wght@400;500;600;700;800&display=swap`,
      type: 'text/css',
    },
  ],

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://cgfeel.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: process.env.BASE_URL ?? '/pbvm/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'cgfeel', // Usually your GitHub org/user name.
  projectName: 'pbvm', // Usually your repo name.

  plugins: [
    './plugins/tailwind-plugin.ts',
    './plugins/pwa-manifest-plugin.ts',
    './plugins/mermaid-loader.ts',
    [
      '@docusaurus/plugin-pwa',
      {
        debug: process.env.NODE_ENV !== 'production',
        offlineModeActivationStrategies: ['appInstalled', 'standalone', 'queryString'],
      },
    ],
  ],
  clientModules: ['./src/pwaTracking.ts'],
  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        docsRouteBasePath: '/', // 匹配 docs-as-homepage
        indexBlog: false, // blog 已禁用
        indexDocs: true,
        indexPages: false,
        language: ['en', 'zh'], // 中文分词 + 英文 stemming
        hashed: true, // PWA 长缓存
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 8,
        searchBarPosition: 'right', // 导航栏左侧，Docs 旁
        searchBarShortcut: true,
        searchBarShortcutHint: true,
      },
    ],
  ],

  onBrokenLinks: 'throw',
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-Hans'],
    localeConfigs: {
      en: {
        htmlLang: 'en-US',
        label: 'English',
      },
      'zh-Hans': {
        htmlLang: 'zh-Hans',
        label: '中文',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/cgfeel/pbvm/edit/main/documentation/',
        },
        blog: false,
        // blog: {
        //   showReadingTime: true,
        //   feedOptions: {
        //     type: ['rss', 'atom'],
        //     xslt: true,
        //   },
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        //   // Useful options to enforce blogging best practices
        //   onInlineTags: 'warn',
        //   onInlineAuthors: 'warn',
        //   onUntruncatedBlogPosts: 'warn',
        // },
        theme: {
          customCss: './src/css/custom.css',
        },
        ...(process.env.GA4_TRACKING_ID
          ? {
              gtag: {
                trackingID: process.env.GA4_TRACKING_ID,
                anonymizeIP: true,
              },
            }
          : {}),
      } satisfies Preset.Options,
    ],
  ],

  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        'http-equiv': 'Content-Security-Policy',
        content:
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://www.googletagmanager.com; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data: https:; " +
          "font-src 'self' data:; " +
          "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://unpkg.com;",
      },
    },
    // 防止手机浏览器强制深色模式（三重保护：CSS forced-color-adjust + color-scheme + 厂商 meta）
    {
      tagName: 'meta',
      attributes: {
        name: 'color-scheme',
        content: 'light dark',
      },
    },
    // UC 浏览器：禁止强制夜间模式
    // {
    //   tagName: 'meta',
    //   attributes: {
    //     name: 'browsermode',
    //     content: 'application',
    //   },
    // },
    // QQ 浏览器 X5 内核：禁止强制夜间模式
    {
      tagName: 'meta',
      attributes: {
        name: 'x5-page-mode',
        content: 'no-night',
      },
    },
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: rootPkg?.name ?? 'pbvm',
      logo: {
        alt: rootPkg?.description ?? 'pbvm documentation',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'search',
          position: 'right',
          className: 'navbar-search-link',
        },
        // { to: '/blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/cgfeel/pbvm',
          label: 'GitHub',
          position: 'right',
          className: 'navbar-github-link',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      // style: 'dark',
      links: [
        // {
        //   title: 'Docs',
        //   items: [
        //     {
        //       label: '文档',
        //       to: '/',
        //     },
        //   ],
        // },
        // {
        //   title: 'Community',
        //   items: [
        //     {
        //       label: 'Stack Overflow',
        //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
        //     },
        //     {
        //       label: 'Discord',
        //       href: 'https://discordapp.com/invite/docusaurus',
        //     },
        //     {
        //       label: 'X',
        //       href: 'https://x.com/docusaurus',
        //     },
        //   ],
        // },
        // {
        //   title: 'More',
        //   items: [
        //     // {
        //     //   label: 'Blog',
        //     //   to: '/blog',
        //     // },
        //     {
        //       label: 'GitHub',
        //       href: 'https://github.com/cgfeel/pbvm',
        //     },
        //   ],
        // },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} pbvm. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
}

export default config
