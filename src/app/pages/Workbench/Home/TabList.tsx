import React, { useContext } from 'react';

import { i18n } from '@babi/tools';
import { Tabs } from '@byted-babi/babi-design';

import { WorkbenchContext } from '../index';

import styles from './index.less?module';

interface ITabListProps {
  tabList: {
    title: string;
    key: string;
  }[];
}

const TabList = (props: ITabListProps) => {
  const { tabList } = props;

  const { currentTab, changeTab } = useContext(WorkbenchContext);

  return (
    <>
      <Tabs
        className={styles.workbench_tabs}
        activeTab={currentTab}
        onChange={changeTab}
        extra={<div>{i18n.t('k3800447145', {}, '👏 Hi，欢迎使用BABI')}</div>}
      >
        {tabList.map(tab => (
          <Tabs.TabPane key={tab.key} title={tab.title}></Tabs.TabPane>
        ))}
      </Tabs>
    </>
  );
};

export default TabList;
