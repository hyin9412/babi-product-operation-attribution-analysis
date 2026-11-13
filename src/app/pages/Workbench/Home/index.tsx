import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Actions, authInstance, i18n, Resource } from '@babi/tools';
import { Skeleton } from '@byted-babi/babi-design';

import WorkspaceGuide from 'APP/pages/Workbench/component/WorkspaceGuide';
import { usePageScrollTrace, workbenchEventReport } from 'APP/pages/Workbench/hooks/useTraceReport';
import ErrorBoundary from 'APP/public/component/ErrorBoundary';

import { EntityKey } from '../constants';
import { WorkbenchProvider } from '../index';
import PersonalContent from '../PersonalContent';
import { useGetEntityOptions } from '../utils';
import TabList from './TabList';
import WorkbenchContent from '../../../../adapters/DeferredWorkbenchContent';

import styles from './index.less?module';

const getTabList = ({
  productLineList,
  productList,
  appList,
  secondProductLineList,
  hasServiceTreePermission,
  secondProductList,
  subProductList,
}: {
  productLineList: any[];
  productList: any[];
  appList: any[];
  secondProductLineList: any[];
  hasServiceTreePermission: boolean;
  secondProductList: any[];
  subProductList: any[];
}) => {
  const list = [
    {
      title: i18n.t('personal_view', {}, '个人视图'),
      key: EntityKey.Personal,
    },
  ];
  if (productLineList.length) {
    list.push({
      title: i18n.t('k2242282276', {}, '产品线视图'),
      key: EntityKey.ProductLine,
    });
  }
  if (secondProductLineList.length) {
    list.push({
      title: i18n.t('k2303326191', {}, '二级产品线视图'),
      key: EntityKey.SecondProductLine,
    });
  }
  if (secondProductList.length) {
    list.push({
      title: i18n.t('k2541031931', {}, '产品视图'),
      key: EntityKey.SecondProduct,
    });
  }
  if (subProductList.length) {
    list.push({
      title: i18n.t('k2249656843', {}, '子产品视图'),
      key: EntityKey.SubProduct,
    });
  }
  if (productList.length) {
    list.push({
      title: i18n.t('k2541029914', {}, '商品视图'),
      key: EntityKey.Product,
    });
  }
  if (hasServiceTreePermission) {
    list.push({
      title: i18n.t('k2248585408', {}, '服务树视图'),
      key: EntityKey.ServiceTree,
    });
  }
  if (appList.length) {
    list.push({
      title: i18n.t('k2237904924', {}, 'APP视图'),
      key: EntityKey.APP,
    });
  }
  return list;
};

const Workbench = () => {
  // const productLineList = getWorkspaceReadList('business', WorkspacePermissionKey.departmentWorkspaceRead);
  // const productList = getWorkspaceReadList('product', WorkspacePermissionKey.productWorkspaceRead);
  // const appList = getWorkspaceReadList('app', WorkspacePermissionKey.appWorkspaceRead);
  const { productLineRes, productRes, appRes, secondProductLineRes, secondProductRes, subProductRes, loading } =
    useGetEntityOptions([
      EntityKey.APP,
      EntityKey.ProductLine,
      EntityKey.Product,
      EntityKey.SecondProductLine,
      EntityKey.SecondProduct,
      EntityKey.SubProduct,
    ]);

  const hasServiceTreePermission = authInstance.auth({
    resource: Resource.serviceTreeNode,
    id: '*',
    action: Actions.serviceTreeWorkspaceRead,
  });

  const tabList = useMemo(
    () =>
      getTabList({
        productLineList: productLineRes ?? [],
        productList: productRes ?? [],
        appList: appRes ?? [],
        secondProductLineList: secondProductLineRes ?? [],
        hasServiceTreePermission,
        secondProductList: secondProductRes ?? [],
        subProductList: subProductRes ?? [],
      }),
    [
      productLineRes,
      productRes,
      appRes,
      secondProductLineRes,
      hasServiceTreePermission,
      secondProductRes,
      subProductRes,
    ],
  );
  const [currentTab, setCurrentTab] = useState<EntityKey>();

  useEffect(() => {
    if (!loading) {
      const lastTab = localStorage.getItem('workbench_role_tab');
      const hasLastTab = tabList.some(item => item.key === lastTab);

      if (lastTab && hasLastTab) {
        changeTab(lastTab);
      } else if (tabList.length > 0) {
        changeTab(tabList[0].key);
      }
    }
  }, [tabList]);

  const changeTab = (v: string) => {
    localStorage.setItem('workbench_role_tab', v);
    setCurrentTab(v as EntityKey);
    workbenchEventReport({ action: 'role_tab_change' }, true);
  };

  const workbenchRef = useRef<HTMLDivElement>(null);
  usePageScrollTrace(workbenchRef);

  return (
    <WorkbenchProvider
      value={{
        currentTab,
        changeTab,
        productLineRes: productLineRes ?? [],
        productRes: productRes ?? [],
        appRes: appRes ?? [],
        secondProductLineRes: secondProductLineRes ?? [],
        subProductRes: subProductRes ?? [],
        secondProductRes: secondProductRes ?? [],
        loading,
      }}
    >
      {currentTab ? (
        <div ref={workbenchRef} className={styles.workbench_wrapper}>
          <div className={styles.workbench_header_bg}></div>
          <TabList tabList={tabList} />
          {currentTab === EntityKey.Personal ? <PersonalContent /> : <WorkbenchContent />}
          <WorkspaceGuide currentTab={currentTab} />
        </div>
      ) : (
        <Skeleton
          text={{
            rows: 10,
          }}
        />
      )}
    </WorkbenchProvider>
  );
};

export default ErrorBoundary(Workbench);
