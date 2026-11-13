import React from 'react';

import {
  i18n,
  //@ts-ignore
} from '@babi/tools';

import styles from './index.less?module';

const OperationDropdown = (): JSX.Element => {
  return (
    <div className={`${styles.hover} ${styles.menuItem}`}>
      <a
        href='/finance/flow/list'
        target='_blank'
        rel='noopener noreferrer'
        style={{ marginLeft: 5, color: 'inherit' }}
      >
        {i18n.t('Approval_Center', {}, '工单中心')}
      </a>
    </div>
  );
};

export default OperationDropdown;
