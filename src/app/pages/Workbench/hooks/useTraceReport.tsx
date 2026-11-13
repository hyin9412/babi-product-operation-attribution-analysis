import { useEffect, useRef } from 'react';

import { i18n } from '@babi/tools';
import debounce from 'lodash/debounce';
import throttled from 'lodash/throttle';

import { EntityKey } from 'APP/pages/Workbench/constants';

export const tabNameMap = {
  [EntityKey.APP]: i18n.t('k2237904924', {}, 'APP视图'),
  [EntityKey.Product]: i18n.t('k2541029914', {}, '商品视图'),
  [EntityKey.ProductLine]: i18n.t('k2242282276', {}, '产品线视图'),
  [EntityKey.SecondProductLine]: i18n.t('k2303326191', {}, '二级产品线视图'),
  [EntityKey.SubProduct]: i18n.t('k2249656843', {}, '子产品视图'),
  [EntityKey.SecondProduct]: i18n.t('k2541031931', {}, '产品视图'),
  [EntityKey.ServiceTree]: i18n.t('k2248585408', {}, '服务树视图'),
  [EntityKey.Personal]: i18n.t('personal_view', {}, '个人视图'),
};

export const subTabNameMap = {
  summary: i18n.t('data_overview', {}, '数据概览'),
  detail: i18n.t('insight_report', {}, '洞察报告'),
};

export const workbenchEventReport = (
  params: {
    name?: string;
    action?: string;
    travel_tab?: string;
    context?: string;
    value?: string;
  },
  reportTabs: boolean,
) => {
  const tab = localStorage.getItem('workbench_role_tab');
  const subtab = localStorage.getItem(`workbench_role_tab_sub_${tab}`);

  window.TEA.event('workbench_events', {
    role_tab: reportTabs && tab ? tabNameMap[tab] : undefined,
    role_sub_tab: reportTabs && subtab ? subTabNameMap[subtab] : undefined,
    ...params,
  });
};

export const useModuleViewTrace = (
  componentRef: React.RefObject<HTMLElement> | undefined,
  params: { module_name: string },
  chartHeight?: number,
) => {
  const isView = useRef(false);
  const fullView = useRef(false);

  const eventReport = debounce(() => {
    if (!componentRef?.current) {
      return;
    }

    // height: 此元素的高度  top: 距离浏览器顶部的高度
    const { height, top } = componentRef.current.getBoundingClientRect();

    // 浏览器高度
    const totalHeight = window.innerHeight || document.documentElement.clientHeight;

    const tab = localStorage.getItem('workbench_role_tab');
    const subtab = localStorage.getItem(`workbench_role_tab_sub_${tab}`);

    if ((top >= 0 && top - totalHeight < 0) || (top < 0 && top + height > 0)) {
      if (!isView.current) {
        isView.current = true;
        window.TEA.event('page_module_view', {
          pathname: window.location.pathname,
          role_tab: tab ? tabNameMap[tab] : undefined,
          role_sub_tab: subtab ? subTabNameMap[subtab] : undefined,
          ...params,
        });
      }

      if (!fullView.current) {
        const checkHeight = chartHeight || height;
        if ((top > 48 && totalHeight - top >= checkHeight) || (top < 48 && height > totalHeight && top + height > 48)) {
          fullView.current = true;
          window.TEA.event('page_module_full_view', {
            pathname: window.location.pathname,
            role_tab: tab ? tabNameMap[tab] : undefined,
            role_sub_tab: subtab ? subTabNameMap[subtab] : undefined,
            ...params,
          });
        }
      }
    } else {
      isView.current = false;
    }
  }, 300);

  useEffect(() => {
    window.addEventListener(
      'scroll',
      () => {
        eventReport();
      },
      true,
    );
    eventReport();
  }, []);
};

export const useMouseClickTrace = (
  componentRef: React.RefObject<HTMLElement> | undefined,
  params: { module_name: string },
) => {
  useEffect(() => {
    if (!componentRef?.current) {
      return;
    }
    const enterReport = debounce(event => {
      const targetType = ['A', 'BUTTON', 'INPUT'];

      let target = event.target;

      let found = false;
      if (target?.tagName == 'svg' && target?.classList?.contains('force-icon')) {
        found = true;
      } else {
        for (let i = 0; i < 3; i++) {
          if (!target) {
            break;
          }
          if (
            targetType.includes(target.tagName) ||
            Array.from(target.classList)?.some(
              (className: string) => className?.includes('arco-input') || className?.includes('arco-select'),
            )
          ) {
            found = true;
            break;
          }
          target = target.parentNode;
        }
      }

      if (!found) {
        return;
      }

      const tab = localStorage.getItem('workbench_role_tab');
      const subtab = localStorage.getItem(`workbench_role_tab_sub_${tab}`);

      window.TEA.event('workbench_events', {
        action: 'mouse_click',
        context: i18n.t('visual_dashboard', {}, '可视化看板'),
        role_tab: tab ? tabNameMap[tab] : undefined,
        role_sub_tab: subtab ? subTabNameMap[subtab] : undefined,
        ...params,
      });
    }, 300);

    componentRef.current.addEventListener('click', enterReport, true);

    return () => {
      componentRef?.current?.removeEventListener('click', enterReport, true);
    };
  }, []);
};

let lastEnterModule = '';

export const useMouseEnterTrace = (
  componentRef: React.RefObject<HTMLElement> | undefined,
  params: { module_name: string },
) => {
  useEffect(() => {
    if (!componentRef?.current) {
      return;
    }
    const enterReport = debounce(() => {
      if (lastEnterModule === params.module_name) {
        return;
      } else {
        lastEnterModule = params.module_name;

        const tab = localStorage.getItem('workbench_role_tab');
        const subtab = localStorage.getItem(`workbench_role_tab_sub_${tab}`);

        window.TEA.event('workbench_events', {
          action: 'mouse_enter',
          role_tab: tab ? tabNameMap[tab] : undefined,
          role_sub_tab: subtab ? subTabNameMap[subtab] : undefined,
          ...params,
        });
      }
    }, 300);

    componentRef.current.addEventListener('mouseenter', enterReport, true);

    return () => {
      componentRef?.current?.removeEventListener('mouseenter', enterReport, true);
    };
  }, []);
};

export const usePageScrollTrace = (PageMainRef: React.RefObject<HTMLElement> | undefined) => {
  const lastRate = useRef(0);

  const eventReport = throttled(() => {
    const tab = localStorage.getItem('workbench_role_tab');
    const subtab = localStorage.getItem(`workbench_role_tab_sub_${tab}`);

    if (!PageMainRef?.current) {
      return;
    }

    const { height, top } = PageMainRef.current.getBoundingClientRect?.();
    const totalHeight = window.innerHeight || document.documentElement.clientHeight;

    const rate = Math.round((Math.abs(top) / (height - totalHeight)) * 100) / 100;
    if (rate === lastRate.current) {
      return;
    }
    lastRate.current = rate;

    window.TEA.event('page_scroll_rate', {
      pathname: window.location.pathname,
      rate: Math.round((Math.abs(top) / (height - totalHeight)) * 100) / 100,
      height: totalHeight,
      role_tab: tab ? tabNameMap[tab] : undefined,
      role_sub_tab: subtab ? subTabNameMap[subtab] : undefined,
    });
  }, 1000);

  useEffect(() => {
    window.addEventListener(
      'scroll',
      () => {
        eventReport();
      },
      true,
    );
  }, []);
};
