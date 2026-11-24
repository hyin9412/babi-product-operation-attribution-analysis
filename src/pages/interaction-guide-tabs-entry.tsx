import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Tabs } from '@tod-m/materials/ve-o';
import '@arco-design/theme-ve-o-design/css/arco.css';
import './interaction-guide-tabs.css';

const sections = [
  { key: 'conclusion', title: '商品经营结论卡片' },
  { key: 'table', title: '表格' },
  { key: 'chart', title: '图表' },
  { key: 'topology', title: '拓扑图' },
  { key: 'filter', title: '全局筛选' },
];

function GuideTabs() {
  const [activeTab, setActiveTab] = useState(() => {
    const key = window.location.hash.slice(1);
    return sections.some(section => section.key === key) ? key : 'conclusion';
  });

  return <Tabs tabPosition="left" type="line" activeTab={activeTab}
    onChange={key => {
      setActiveTab(key);
      window.dispatchEvent(new CustomEvent('guide-tab-change', { detail: key }));
    }}>
    {sections.map(section => <Tabs.TabPane key={section.key} title={section.title} />)}
  </Tabs>;
}

createRoot(document.getElementById('guide-tabs')!).render(<GuideTabs />);
