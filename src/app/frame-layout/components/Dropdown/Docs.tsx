// @ts-ignore
import React, { FC } from 'react';

import { i18n } from '@babi/tools';

import styles from './index.less?module';

const DocsMenu: FC = (): JSX.Element => {
  return (
    <div className={styles.menuItem}>
      <a
        className={styles.hover}
        href={`https://cloud.bytedance.net/docs/product/BABI?x-resource-account=public`}
        target='_blank'
        rel='noopener noreferrer'
      >
        {i18n.t('help_center', {}, '帮助中心')}
      </a>
    </div>
  );
};

export default DocsMenu;
