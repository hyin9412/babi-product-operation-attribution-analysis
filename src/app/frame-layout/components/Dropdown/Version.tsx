import React from 'react';

import {
  i18n,
  //@ts-ignore
} from '@babi/tools';
import { Dropdown, Menu } from '@byted-babi/babi-design';

import styles from './index.less?module';

const VersionDropdown = (): JSX.Element => {
  return (
    <div className={styles.menuItem}>
      <Dropdown
        trigger='click'
        droplist={
          <Menu className={styles.dropdownWrapper} style={{ width: 'auto' }}>
            <Menu.Item
              key='1'
              onClick={() => {
                window.TEA.event('click_navbar', {
                  title: i18n.t('Version', {}, '版本'),
                  value: i18n.t('Official_version', {}, '正式版'),
                });
                window.open('https://babi.bytedance.net/');
              }}
            >
              {i18n.t('Official_version', {}, '正式版')}
            </Menu.Item>
            <Menu.Item
              key='3'
              onClick={() => {
                window.TEA.event('click_navbar', {
                  title: i18n.t('Version', {}, '版本'),
                  value: i18n.t('Boe_version', {}, 'boe版'),
                });
                window.open('http://babi.boe.bytedance.net/');
              }}
            >
              {i18n.t('Boe_version', {}, 'boe版')}
            </Menu.Item>
          </Menu>
        }
      >
        <span className={styles.hover}>{i18n.t('Version', {}, '版本')}</span>
      </Dropdown>
    </div>
  );
};

export default VersionDropdown;
