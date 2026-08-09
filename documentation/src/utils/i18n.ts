import { translate } from '@docusaurus/Translate'

export const defaultTheme = 'default'
export const themeMode = {
  dark: 'dark',
  light: 'default',
}

// 也可以通过原生组件实现，但是这样只能作为组件交付，函数即可用于组件，也可以用于非组件场景
// import Translate from '@docusaurus/Translate'
// <Translate id="home.hero.slogan" /> or <Translate id="home.buildtools.sub1">Default Text</Translate>
export function t(id: string) {
  return translate({ id, message: id })
}
