import { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'adapters/reactRouterCompat';

import { IconFileIcon } from '@arco-design/iconbox-react-babi';
import {
  IconDynamicControl,
  IconMonitorGrowthAnalysis,
  IconPageEmpty,
  IconShoppingBag,
} from '@arco-design/iconbox-react-babi';
import { IconDown, IconRight, IconUp } from '@arco-design/iconbox-react-ve-o-design';
import { i18n } from '@babi/tools';
import { Link, Radio, Spin } from '@byted-babi/babi-design';
import { formatTime } from '@src/util/utils';
import dayjs from 'dayjs';

import { BudgetWindowResp } from 'APP/api-lib/budget/config/bytedance.babi.budget.config.model';
import { BusinessActivityDTO } from 'APP/api-lib/platform/microservice/dashboard';
import { activityTypeMapFn, EActivityTab, EActivityType } from 'APP/pages/Workbench/constants';
import { useModuleViewTrace, useMouseEnterTrace, workbenchEventReport } from 'APP/pages/Workbench/hooks/useTraceReport';
import { calculateTimeDistance } from 'APP/pages/Workbench/utils';
import { budgetTypeOps } from 'PAGES/BudgetNew/BasicConfig/BudgetWindow/constant';
import { BudgetAreaMap } from 'PAGES/BudgetNew/util/constant';

import { ScheduleDetailPopover } from './scheduleDetailPopover/index';

import styles from '../index.module.less';

interface IProps {
  budgetData: BudgetWindowResp[];
  activityData: BusinessActivityDTO[];
  loading: boolean;
  hasBudgetPermission: boolean;
}

export interface IExtraData {
  activity_id?: string;
  income_status?: string;
  cost_status?: string;
  [key: string]: string;
}

const Activity = (props: IProps) => {
  const { budgetData, activityData, loading, hasBudgetPermission } = props;
  // 活动标签页状态
  const [activeTab, setActiveTab] = useState(EActivityTab.pending);
  const [scrollPosition, setScrollPosition] = useState(0); // 活动列表滚动位置
  const [maxScroll, setMaxScroll] = useState(0); // 活动列表最大滚动位置
  const [contentHeight, setContentHeight] = useState(0); // 活动列表内容高度
  const [position, setPosition] = useState({
    isUp: true,
    isDown: false,
  });

  const history = useHistory();

  const { productActivityData, billActivityData } = useMemo(() => {
    const billActivityType = [
      EActivityType.monthlySettlement,
      EActivityType.monthlyBillAdjustment,
      EActivityType.externalCostEntry,
    ];
    const productActivityData: BusinessActivityDTO[] = [];
    const billActivityData: BusinessActivityDTO[] = [];
    const currentActivityData =
      activeTab === EActivityTab.pending ? activityData?.filter(item => item.need_process) : activityData;

    currentActivityData?.forEach(item => {
      if (billActivityType.includes(item.type as EActivityType)) {
        billActivityData.push(item);
      } else {
        productActivityData.push(item);
      }
    });

    return { productActivityData, billActivityData };
  }, [activityData, activeTab]);

  const activityRef = useRef<HTMLDivElement>(null);
  const budgetActivityListRef = useRef<HTMLDivElement>(null);
  const activityColumnsRef = useRef<HTMLDivElement>(null);

  useModuleViewTrace(activityRef, {
    module_name: i18n.t('k607888482', {}, '进行中的经营活动'),
  });
  useMouseEnterTrace(activityRef, {
    module_name: i18n.t('k607888482', {}, '进行中的经营活动'),
  });

  const empty = () => {
    return (
      <div className={styles.budgetLink} style={{ height: '100%', minHeight: 142 }}>
        <IconPageEmpty style={{ fontSize: '48px' }} />
        <div className={styles.budgetText}>{i18n.t('k2530972404', {}, '暂无活动')}</div>
      </div>
    );
  };

  const budgetLink = () => {
    return (
      <div className={styles.budgetLink} style={{ height: '100%', minHeight: 142 }}>
        <IconFileIcon style={{ fontSize: '48px' }} />
        <div className={styles.budgetText}>
          {i18n.t('Go_to', {}, '前往')}
          <Link
            onClick={() => {
              history.push('/finance/budgetNew/workbench/');
              workbenchEventReport(
                {
                  action: 'activityClick',
                  context: i18n.t('k2733360159', {}, '预算工作台'),
                },
                true,
              );
            }}
          >
            {i18n.t('k2733360159', {}, '预算工作台')}
          </Link>
          {i18n.t('view_all', {}, '查看全部')}
        </div>
      </div>
    );
  };

  // 初始化时计算最大滚动位置
  useEffect(() => {
    setTimeout(() => {
      if (budgetActivityListRef.current) {
        const element = budgetActivityListRef.current;
        setMaxScroll(element.scrollHeight - element.clientHeight);
      }
    });
    setPosition({
      isUp: true,
      isDown: false,
    });
    setScrollPosition(0);
  }, [budgetData, activeTab, loading]);

  useEffect(() => {
    setTimeout(() => {
      if (activityColumnsRef.current) {
        setContentHeight(activityColumnsRef.current.clientHeight - 62);
      }
    });
  }, [activityData, activeTab, loading]);

  const scrollContent = direction => {
    const element = budgetActivityListRef.current;
    if (!element) return;
    // 计算新位置
    let newPosition = scrollPosition;

    if (direction === 'up') {
      newPosition = Math.max(0, scrollPosition - contentHeight * 0.9);
    } else {
      newPosition = Math.min(maxScroll, scrollPosition + contentHeight * 0.9);
    }

    // 应用滚动
    element.scrollTo({
      top: newPosition,
      behavior: 'smooth',
    });

    setPosition({
      isUp: newPosition === 0,
      isDown: newPosition === maxScroll,
    });

    setScrollPosition(newPosition);
  };

  const prePage = () => {
    return (
      <div className={`${styles.prePageIcon} ${styles.pageIcon}`} onClick={() => scrollContent('up')}>
        <IconUp />
      </div>
    );
  };

  const nextPage = () => {
    return (
      <div className={`${styles.nextPageIcon} ${styles.pageIcon}`} onClick={() => scrollContent('down')}>
        <IconDown />
      </div>
    );
  };

  return (
    <div ref={activityRef} style={{ marginBottom: '16px' }}>
      <div className={styles.activityContent}>
        <div className={styles.activityHeader}>
          <div className={styles.activityHeaderTitle}>{i18n.t('k607888482', {}, '进行中的经营活动')}</div>
          <div id='workbenchPersonalGuideStep1'></div>
          <Radio.Group
            type='button'
            name='direction'
            value={activeTab}
            onChange={v => {
              setActiveTab(v);
              workbenchEventReport(
                {
                  action: 'activityTabChange',
                  context:
                    v === EActivityTab.pending
                      ? i18n.t('k2177823539', {}, '待我处理')
                      : i18n.t('k2532159766', {}, '全部活动'),
                },
                true,
              );
            }}
            options={[
              {
                label: i18n.t('k2177823539', {}, '待我处理'),
                value: EActivityTab.pending,
              },
              {
                label: i18n.t('k2532159766', {}, '全部活动'),
                value: EActivityTab.all,
              },
            ]}
          ></Radio.Group>
          <div id='workbenchPersonalGuideStep2'></div>
        </div>

        {!loading ? (
          <div className={styles.activityColumns} ref={activityColumnsRef}>
            {/* 商品栏 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className={styles.columnHeader}>
                <IconShoppingBag className={styles.columnIcon} />
                <span>{i18n.t('Product', {}, '商品')}</span>
              </div>
              <div id='workbenchPersonalGuideStep3' style={{ width: '100%' }}></div>
              <div className={styles.activityColumn} style={{ maxHeight: 576 }}>
                {productActivityData?.length
                  ? productActivityData?.map(item => {
                      const { title, type, begin_time, end_time, need_process, extra } = item || {};
                      const { activity_id } = (extra ? JSON.parse(extra) : {}) as IExtraData;
                      const babi_url = activityTypeMapFn({ activity_id, title })[type]?.url;
                      return (
                        <ScheduleDetailPopover
                          key={type + begin_time + end_time + title}
                          data={{
                            ...item,
                            babi_url,
                          }}
                        >
                          <Link
                            className={styles.activityItem}
                            onClick={() => {
                              history.push(babi_url);
                              workbenchEventReport(
                                {
                                  action: 'activityClick',
                                  context: activityTypeMapFn()[type]?.name,
                                },
                                true,
                              );
                            }}
                          >
                            <div className={styles.activityTitle}>
                              <span>{activityTypeMapFn()[type]?.name}</span>
                              <IconRight className={styles.arrowIcon} />
                            </div>
                            <div className={styles.activityTitleDesc}>{title}</div>
                            <div className={styles.activityDesc}>{activityTypeMapFn()[type]?.activityDesc}</div>
                            <div className={styles.activityDesc} style={{ marginTop: '2px' }}>
                              {`${formatTime(begin_time, 'YYYY-MM-DD HH:mm')} ~ ${formatTime(
                                end_time,
                                'YYYY-MM-DD HH:mm',
                              )}`}
                            </div>
                            <div className={styles.activityRemainContainer}>
                              <div className={styles.activityRemain}>
                                {i18n.t('k201746388', {}, '距结束')}
                                <span className={styles.remainHighlight}>{calculateTimeDistance(end_time)}</span>
                              </div>
                              {need_process && activeTab !== EActivityTab.pending && (
                                <div className={styles.activityRemainTag}>{i18n.t('k2177823539', {}, '待我处理')}</div>
                              )}
                            </div>
                          </Link>
                        </ScheduleDetailPopover>
                      );
                    })
                  : empty()}
              </div>
            </div>

            {/* 账单栏 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className={styles.columnHeader}>
                <IconMonitorGrowthAnalysis className={styles.columnIcon} />
                <span>{i18n.t('k6244822', {}, '账单')}</span>
              </div>
              <div className={styles.activityColumn} style={{ maxHeight: 576 }}>
                {billActivityData?.length
                  ? billActivityData?.map(item => {
                      const { title, type, begin_time, end_time, need_process, extra } = item || {};
                      const { income_status, cost_status } = (extra ? JSON.parse(extra) : {}) as IExtraData;
                      const babi_url = activityTypeMapFn({ income_status, cost_status })[type]?.url;
                      return (
                        <ScheduleDetailPopover
                          key={type + begin_time + end_time + title}
                          data={{
                            ...item,
                            babi_url,
                          }}
                        >
                          <Link
                            className={styles.activityItem}
                            onClick={() => {
                              history.push(babi_url);
                              workbenchEventReport(
                                {
                                  action: 'activityClick',
                                  context: activityTypeMapFn()[type]?.name,
                                },
                                true,
                              );
                            }}
                          >
                            <div className={styles.activityTitle}>
                              <span>{activityTypeMapFn()[type]?.name}</span>
                              <IconRight className={styles.arrowIcon} />
                            </div>
                            <div className={styles.activityTitleDesc}>{title}</div>
                            <div className={styles.activityDesc}>{activityTypeMapFn()[type]?.activityDesc}</div>
                            <div className={styles.activityDesc} style={{ marginTop: '2px' }}>
                              {`${formatTime(begin_time, 'YYYY-MM-DD HH:mm')} ~ ${formatTime(
                                end_time,
                                'YYYY-MM-DD HH:mm',
                              )}`}
                            </div>
                            <div className={styles.activityRemainContainer}>
                              <div className={styles.activityRemain}>
                                {i18n.t('k201746388', {}, '距结束')}
                                <span className={styles.remainHighlight}>{calculateTimeDistance(end_time)}</span>
                              </div>
                              {need_process && activeTab !== EActivityTab.pending && (
                                <div className={styles.activityRemainTag}>{i18n.t('k2177823539', {}, '待我处理')}</div>
                              )}
                            </div>
                          </Link>
                        </ScheduleDetailPopover>
                      );
                    })
                  : empty()}
              </div>
            </div>

            {/* 预算栏 */}
            {hasBudgetPermission && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={styles.columnHeader}>
                  <IconDynamicControl className={styles.columnIcon} />
                  <span>{i18n.t('budget_2', {}, '预算')}</span>
                </div>
                <div className={styles.budgetActivityListContainer}>
                  {activeTab !== EActivityTab.pending && !position.isUp && prePage()}
                  {activeTab !== EActivityTab.pending && maxScroll > 0 && !position.isDown && nextPage()}
                  <div
                    className={styles.budgetActivityList}
                    style={{ maxHeight: Math.max(contentHeight, 456) }}
                    ref={budgetActivityListRef}
                  >
                    <div
                      className={styles.budgetActivityListContent}
                      style={{ height: activeTab === EActivityTab.pending || !budgetData.length ? '100%' : 'unset' }}
                    >
                      {budgetData.length
                        ? activeTab === EActivityTab.pending
                          ? budgetLink()
                          : budgetData?.map(item => (
                              <Link
                                className={styles.activityItem}
                                key={item.id}
                                onClick={() => {
                                  history.push('/finance/budgetNew/workbench/');
                                  workbenchEventReport(
                                    {
                                      action: 'activityClick',
                                      context: i18n.t('k2384671865', {}, '预算主窗口'),
                                    },
                                    true,
                                  );
                                }}
                              >
                                <div className={styles.activityTitle}>
                                  <span>{i18n.t('k207276426', {}, '主窗口')}</span>
                                  <IconRight className={styles.arrowIcon} />
                                </div>
                                <div className={styles.activityTitleDesc}>
                                  {`${BudgetAreaMap[item.budget_area] || ''} -
                            ${budgetTypeOps.find(type => type.value === item.budget_type)?.label || ''}`}
                                </div>
                                <div className={styles.activityDesc}>{`${i18n.t(
                                  'k322010983',
                                  { placeholder0: item.budget_version },
                                  '{placeholder0} 预算版本',
                                )}`}</div>
                                <div className={styles.activityDesc} style={{ marginTop: '2px' }}>
                                  {`${i18n.t(
                                    'k1713601819',
                                    {
                                      placeholder0: item.effect_time
                                        ? dayjs(item.effect_time).format('YYYY-MM-DD HH:mm')
                                        : '-',
                                    },
                                    '{placeholder0} 开始',
                                  )}`}
                                </div>
                              </Link>
                            ))
                        : empty()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Spin loading={loading} className={styles.activitySpin} />
        )}
      </div>
    </div>
  );
};

export default Activity;
