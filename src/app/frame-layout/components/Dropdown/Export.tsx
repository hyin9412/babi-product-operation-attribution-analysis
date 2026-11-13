import React from 'react';

import {
  i18n,
  //@ts-ignore
} from '@babi/tools';

import styles from './index.less?module';

export default function ExportMenu() {
  return (
    <div className={styles.menuItem} key='export'>
      <a className={styles.hover} href={`/finance/export`} target='_blank' rel='noopener noreferrer'>
        {i18n.t('Export_records', {}, '导出记录')}
      </a>
    </div>
  );
}
