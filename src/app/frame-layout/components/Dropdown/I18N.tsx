import React, { useState } from 'react';

import { IconI18n } from '@arco-design/iconbox-react-babi';
//@ts-ignore
import { BABI_I18N_LOCAL_LANGUAGE, i18n } from '@babi/tools';
import { Dropdown, Menu } from '@byted-babi/babi-design';

import styles from './index.less?module';

const I18NDropdown = (): JSX.Element => {
  const [selectedKeys, setSelectedKeys] = useState([localStorage.getItem(BABI_I18N_LOCAL_LANGUAGE) || 'zh']);

  const onClickMenuItem = key => {
    setSelectedKeys([key]);
  };

  return (
    <div className={`${styles.hover} ${styles.menuItem}`}>
      <Dropdown
        trigger='click'
        droplist={
          <Menu
            className={styles.dropdownWrapper}
            style={{ width: 'auto' }}
            selectedKeys={selectedKeys}
            onClickMenuItem={onClickMenuItem}
          >
            <Menu.Item
              key='zh'
              onClick={() => {
                window.TEA.event('click_navbar', {
                  title: 'i18n',
                  value: i18n.t('chinese', {}, '中文'),
                });
                localStorage.setItem(BABI_I18N_LOCAL_LANGUAGE, 'zh');
                document.cookie = `locale=zh; domain=${window.location.hostname}; path=/`;
                // i18n.setLang('zh');
                window.location.reload();
              }}
            >
              {i18n.t('Chinese_', {}, '简体中文')}
            </Menu.Item>
            <Menu.Item
              key='en'
              onClick={() => {
                window.TEA.event('click_navbar', {
                  title: 'i18n',
                  value: i18n.t('English', {}, '英文'),
                });
                localStorage.setItem(BABI_I18N_LOCAL_LANGUAGE, 'en');
                document.cookie = `locale=en; domain=${window.location.hostname}; path=/`;
                // i18n.setLang('en');
                window.location.reload();
              }}
            >
              {i18n.t('English', {}, 'English')}
            </Menu.Item>
          </Menu>
        }
      >
        <div style={{ fontSize: 0, display: 'flex', alignItems: 'center' }}>
          <IconI18n
            width='16px'
            height='16px'
            className={window.location.hostname !== 'babi.bytedance.net' ? styles.i18n : ''}
          />
        </div>
      </Dropdown>
    </div>
  );
};

export default I18NDropdown;
