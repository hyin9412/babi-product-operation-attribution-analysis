import React from 'react';

import LeftContent from './LeftContent';
import RightContent from './RightContent';

import styles from './index.module.less';

/**
 * 工作台个人视图页面
 * 包含左右两部分内容
 */
const PersonalContent: React.FC = () => {
  return (
    <div className={styles.container}>
      <LeftContent />
      <RightContent />
    </div>
  );
};

export default PersonalContent;
