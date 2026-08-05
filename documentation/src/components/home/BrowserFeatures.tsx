import type { FC, PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'
import Wraper from './Wraper'
import { t } from '../../utils/i18n'

const styles = tv({
  slots: {
    desc: 'text-xl',
    grid: 'shrink-0 flex flex-wrap gap-6',
    item: 'p-8 flex-col items-start gap-4',
    selector: 'flex flex-col gap-6',
    title: 'text-3xl mb-0 max-md:text-2xl max-sm:text-xl',
  },
})

const { desc, grid, selector, title } = styles()

const BrowserFeatures: FC<PropsWithChildren> = ({ children }) => (
  <Wraper>
    <div className={selector()}>
      <div>
        <div className={desc()}>
          {t('home.features.desc')}
        </div>
        <h2 className={title()}>
          {t('home.features.title')}
        </h2>
      </div>
      <div className={grid()}>{children}</div>
    </div>
  </Wraper>
)

export default BrowserFeatures
