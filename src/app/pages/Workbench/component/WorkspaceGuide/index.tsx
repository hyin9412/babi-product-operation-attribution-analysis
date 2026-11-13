import { useEffect, useMemo, useState } from 'react';

import XGuide from '@tod-m/materials/es/XGuide';

import { EntityKey, workbenchGuideSteps } from '../../constants';

import '@tod-m/materials/es/XGuide/style/index.less';
import styles from './index.module.less';

const WorkspaceGuide = (props: { currentTab: string | undefined }) => {
  const { currentTab } = props;
  // 二级产品线和产品线共用一个引导
  const guideTab = useMemo(() => {
    return currentTab === EntityKey.Personal ? currentTab : 'second_product_line_and_product_line';
  }, [currentTab]);

  const [guideVisible, setGuideVisible] = useState(false);
  useEffect(() => {
    setGuideVisible(localStorage.getItem(`workspace_${guideTab}_guide_visible`) !== 'false');
  }, [guideTab]);

  const steps = useMemo(() => {
    return workbenchGuideSteps(currentTab);
  }, [currentTab]);

  const visibleGuideTab = [EntityKey.Personal, EntityKey.ProductLine, EntityKey.SecondProductLine];

  if (!visibleGuideTab.includes(currentTab as EntityKey)) {
    return <></>;
  }

  return guideVisible ? (
    <div className={styles.workspaceGuide}>
      <XGuide
        type='tip'
        steps={steps}
        onClose={() => {
          setGuideVisible(false);
          try {
            localStorage.setItem(`workspace_${guideTab}_guide_visible`, 'false');
          } catch (e) {
            console.error(e);
          }
        }}
        afterStepChange={(_, step) => {
          const dom = document.getElementById((step?.selector as string)?.replace('#', ''));
          if (!dom) return;
          if (dom.getBoundingClientRect().top >= window.innerHeight - 300) {
            document.body.scrollTop = document.body.scrollTop + dom.getBoundingClientRect().top - 300;
          } else if (dom.getBoundingClientRect().top < 300) {
            document.body.scrollTop = document.body.scrollTop - Math.abs(dom.getBoundingClientRect().top) - 300;
          }
        }}
        mask={false}
        showStepInfo={currentTab === EntityKey.Personal}
        hotspot
      />
    </div>
  ) : (
    <></>
  );
};

export default WorkspaceGuide;
