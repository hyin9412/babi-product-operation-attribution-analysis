import React, { useEffect, useState } from 'react';

import { Actions, authInstance, Resource } from '@babi/tools';
import {
  RENDER_END,
  REQUEST_END,
  REQUEST_START,
  workspaceInstance,
  workspaceInteractionInstance,
} from '@src/util/perf';

import { budgetServiceClient } from 'APP/api-lib/budget/bytedance_babi_budget_service';
import { BudgetWindowResp } from 'APP/api-lib/budget/config/bytedance.babi.budget.config.model';
import { platformServiceClient } from 'APP/api-lib/platform/microservice/bytedance_babi_platform_service';
import { BusinessActivityDTO, RecentlyViewedDTO, SubcribeObjectDTO } from 'APP/api-lib/platform/microservice/dashboard';
import { EntityKey } from 'APP/pages/Workbench/constants';
import { CommonStatus } from 'PAGES/BudgetNew/BasicConfig/BudgetWindow/constant';

import Activity from './component/activity';
import RecentVisitCard from './component/recentVisitCard';
import SubscriptionCard from './component/subscriptionCard';

import styles from './index.module.less';

/**
 * 工作台左侧内容组件
 * 包含：进行中的经营活动、最近访问、我的订阅
 */
const LeftContent: React.FC = () => {
  const [recentVisit, setRecentVisit] = useState<RecentlyViewedDTO[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<SubcribeObjectDTO[]>([]);
  const [activityData, setActivityData] = useState<BusinessActivityDTO[]>([]);
  const [budgetData, setBudgetData] = useState<BudgetWindowResp[]>([]);
  const [loading, setLoading] = useState(false);

  const hasBudgetPermission = authInstance.auth({
    resource: Resource.budgetAreaBudgetSource,
    id: '*',
    action: Actions.budgetWindowStageRead,
  });

  const getRecentVisit = async () => {
    try {
      const res = await platformServiceClient.GetRecentlyViewed({});
      setRecentVisit(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const getSubscription = async () => {
    try {
      const res = await platformServiceClient.GetSubscribeCnt({});
      setSubscriptionData(res?.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getActivityData = async () => {
    try {
      setLoading(true);
      const res = await platformServiceClient.ListBusinessActivity({});
      setActivityData(res?.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getBudgetData = async () => {
    try {
      if (!hasBudgetPermission) {
        return;
      }
      const res = await budgetServiceClient.ListBudgetWindow({
        offset: 0,
        limit: 5000,
        status: [CommonStatus.EFFECT],
      });
      setBudgetData(res?.budget_window_list || []);
    } catch (err) {
      console.error(err);
    }
  };

  const getData = async () => {
    workspaceInstance.mark(REQUEST_START, { tags: { type: EntityKey.Personal } });
    await Promise.all([getActivityData(), getBudgetData(), getRecentVisit(), getSubscription()]);
    workspaceInstance.mark(REQUEST_END, { tags: { type: EntityKey.Personal } });
    workspaceInstance.mark(RENDER_END, { tags: { type: EntityKey.Personal } });
    workspaceInteractionInstance.mark(RENDER_END, { tags: { type: EntityKey.Personal } });
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className={styles.leftContent}>
      {/* 进行中的经营活动 */}
      <Activity
        budgetData={budgetData}
        activityData={activityData}
        loading={loading}
        hasBudgetPermission={hasBudgetPermission}
      />
      {/* 最近访问 */}
      <RecentVisitCard data={recentVisit} />
      {/* 我的订阅 */}
      <SubscriptionCard data={subscriptionData} />
    </div>
  );
};

export default LeftContent;
