import React from 'react';

import {
  checkIsBoe,
  i18n,
  PermissionRender,
  Resource,
  //@ts-ignore
} from '@babi/tools';
import { Dropdown, Menu } from '@byted-babi/babi-design';

import { history } from 'APP/app';

import styles from './index.less?module';

const isDev = /localhost/.test(window.location.host);
const isBoe = checkIsBoe();

const OperationDropdown = (): JSX.Element => {
  return (
    <PermissionRender
      // @ts-ignore
      oneOfPerm
      requiredPermissions={[
        {
          resource: Resource.babi,
          action: 'tailor_read',
        },
      ]}
      otherwise={
        <div className={styles.menuItem}>
          <Dropdown
            trigger='click'
            droplist={
              <Menu className={styles.dropdownWrapper} style={{ width: 'auto' }}>
                <Menu.Item
                  key='6'
                  onClick={() => {
                    history.push('/finance/tool/currency');
                  }}
                >
                  {i18n.t('Currency_exchange_rate_conversion', {}, '货币汇率转换')}
                </Menu.Item>
              </Menu>
            }
          >
            <span className={`${styles.hover} ${styles.dropdown}`}>{i18n.t('tools', {}, '工具')}</span>
          </Dropdown>
        </div>
      }
    >
      <div className={`${styles.hover} ${styles.menuItem}`}>
        <a
          href={isDev || isBoe ? `http://tailor-boe.bytedance.net` : 'https://tailor.bytedance.net'}
          target='_blank'
          rel='noopener noreferrer'
          style={{ marginLeft: 5, color: 'inherit' }}
        >
          {i18n.t('Operating_platform', {}, '运营平台')}
        </a>
      </div>
    </PermissionRender>
  );
};

export default OperationDropdown;
