import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

const sidebars: SidebarsConfig = {
  docSidebar: [
    'intro',
    'source',
    {
      type: 'category',
      label: 'Commands',
      collapsed: false,
      items: [
        'commands/create',
        'commands/list',
        'commands/open',
        'commands/info',
        'commands/alias',
        'commands/search',
        'commands/clear',
        'commands/remove',
        'commands/restore',
        'commands/mirror',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      collapsed: false,
      items: [
        'concepts/browserlist',
        'concepts/store-and-cache',
        'concepts/monorepo',
        'concepts/commander',
      ],
    },
  ],
}

export default sidebars
