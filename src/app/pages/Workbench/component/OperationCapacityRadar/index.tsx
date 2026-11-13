import React, { useCallback, useMemo } from 'react';
import { useHistory } from 'adapters/reactRouterCompat';

import { IconRight } from '@arco-design/iconbox-react-ve-o-design';
import { i18n } from '@babi/tools';
import { Empty, Popover, Spin, Typography } from '@byted-babi/babi-design';

import { workbenchEventReport } from 'APP/pages/Workbench/hooks/useTraceReport';
import {
  businessAnalysisChildrenMetricCodeMapInfo,
  BusinessAnalysisChildrenMetricInfo,
  businessAnalysisMetricCodeMap,
  EBusinessAnalysisMetricCode,
} from 'PAGES/OperationCapacity/constants';
import {
  type IOperationDetailQuery,
  type IProductHealthDimension,
  type IProductHealthMetricDetail,
  useOperationDetailData,
} from 'PAGES/OperationCapacity/hooks';

import styles from './index.less?module';

const BUSINESS_PERFORMANCE_TEXT = i18n.t('business_performance', {}, '经营力表现');
const VIEW_DETAILS_TEXT = i18n.t('to_deal_with', {}, '去处理');
const DIMENSION_STATUS_TEXT = {
  qualified: i18n.t('k6168156', {}, '达标'),
  unqualified: i18n.t('k203532241', {}, '不达标'),
};
const ISSUE_EMPTY_TEXT = i18n.t('k2481066375', {}, '暂无指标');
const TOP_ISSUE_SEPARATOR = '；';
const OPERATION_CAPACITY_FROM_WORKSPACE = 'workspace';
const NO_PASS_REASON_LINE_SEPARATOR_REGEXP = /<br\s*\/>/i;

type DimensionPriorityTag = 'high' | 'medium';
type DimensionStatus = keyof typeof DIMENSION_STATUS_TEXT;
type WorkbenchIndicatorInfo = IProductHealthMetricDetail & Partial<BusinessAnalysisChildrenMetricInfo>;

interface WorkbenchDimensionInfo extends Omit<IProductHealthDimension, 'group_detail'> {
  group_detail?: WorkbenchIndicatorInfo[];
}

interface IOperationCapacityRadarProps {
  loading?: boolean;
  selectResourceId?: string;
  query?: IOperationDetailQuery;
  reloadCount?: number;
  resourceType?: string;
}

const formatOrder = (index: number) => String(index + 1).padStart(2, '0');

const getDimensionStatus = (item: WorkbenchDimensionInfo) => {
  return item.is_pass ? 'qualified' : 'unqualified';
};

const getDimensionIssueCount = (item: WorkbenchDimensionInfo) =>
  item.problem_count ?? item.group_detail?.filter(metricDetail => !metricDetail.is_pass).length ?? 0;

const getDimensionIndicatorCount = (item: WorkbenchDimensionInfo) => item.group_detail?.length ?? 0;

const getDimensionMeta = (metricGroup?: number) =>
  metricGroup ? businessAnalysisMetricCodeMap[metricGroup as EBusinessAnalysisMetricCode] : undefined;

const getEnrichedIndicator = (indicator?: WorkbenchIndicatorInfo) => {
  if (!indicator) {
    return undefined;
  }

  return {
    ...indicator,
    ...businessAnalysisChildrenMetricCodeMapInfo(indicator.metric_attr, indicator.check_period)[indicator.metric_code],
  };
};

const formatTopIssueReason = (reason?: React.ReactNode) => {
  if (!reason) {
    return '';
  }

  if (typeof reason !== 'string') {
    return React.isValidElement(reason) ? '' : String(reason);
  }

  return reason
    .split(NO_PASS_REASON_LINE_SEPARATOR_REGEXP)
    .map(reasonItem => reasonItem.trim())
    .filter(Boolean)
    .join(TOP_ISSUE_SEPARATOR);
};

const getTopIssueText = (status: DimensionStatus, indicators: WorkbenchIndicatorInfo[] = []) => {
  if (status === 'qualified') {
    return i18n.t('k2281271477', {}, '当前维度表现达标，暂无待处理问题。');
  }

  // 工作台空间有限，仅取前两个未达标指标；每个指标内的 noPassReason 可能由 `<br />` 拼接，统一压缩为分号分隔文案。
  const topIssueText = indicators
    .map(indicator => {
      const enrichedIndicator = getEnrichedIndicator(indicator);
      return formatTopIssueReason(enrichedIndicator?.reason || enrichedIndicator?.noPassReason);
    })
    .filter(Boolean)
    .join(TOP_ISSUE_SEPARATOR);

  return topIssueText || i18n.t('k207417372', {}, '当前维度存在未达标指标，建议前往详情处理。');
};

const getIssueRatio = (item: WorkbenchDimensionInfo) =>
  `${getDimensionIssueCount(item)}/${getDimensionIndicatorCount(item)}`;

const getIssueRatioPopoverContent = (dimensionName: string, item: WorkbenchDimensionInfo) => {
  const indicators = item.group_detail || [];

  return (
    <div className={styles.issue_ratio_popover}>
      <div className={styles.issue_ratio_popover_title}>{dimensionName || '-'}</div>
      <div className={styles.issue_ratio_popover_list}>
        {indicators.length > 0 ? (
          indicators.map((indicator, index) => {
            const enrichedIndicator = getEnrichedIndicator(indicator);
            const indicatorStatus = indicator.is_pass ? 'qualified' : 'unqualified';
            return (
              <div className={styles.issue_ratio_popover_item} key={`${indicator.metric_code}_${index}`}>
                <div className={styles.issue_ratio_popover_item_prefix}></div>
                <span className={styles.issue_ratio_popover_text}>
                  {enrichedIndicator?.name || indicator.metric_code}
                </span>
                <span
                  className={`${styles.issue_ratio_popover_tag} ${
                    indicatorStatus === 'qualified' ? styles.issue_ratio_popover_tag_qualified : ''
                  }`}
                >
                  {DIMENSION_STATUS_TEXT[indicatorStatus]}
                </span>
              </div>
            );
          })
        ) : (
          <div className={styles.issue_ratio_popover_item}>
            <span className={styles.issue_ratio_popover_text}>{ISSUE_EMPTY_TEXT}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const getPriorityTag = (status: DimensionStatus, dataIndex: number): DimensionPriorityTag | undefined => {
  if (status !== 'unqualified') {
    return undefined;
  }

  if (dataIndex < 2) {
    return 'high';
  }

  if (dataIndex === 2) {
    return 'medium';
  }

  return undefined;
};

const getWorkbenchDimensionInfo = (dimensionList?: IProductHealthDimension[]): WorkbenchDimensionInfo[] =>
  (dimensionList || []).map(item => ({
    metric_group: item.metric_group,
    is_pass: item.is_pass,
    problem_count: item.problem_count,
    group_detail: item.group_detail,
  }));

const OperationCapacityRadar = (props: IOperationCapacityRadarProps) => {
  const { loading, query, reloadCount, selectResourceId } = props;
  const history = useHistory();
  const operationDetailQuery = useMemo(() => query || { entityId: selectResourceId }, [query, selectResourceId]);
  const { detailValue, loading: detailLoading } = useOperationDetailData({
    query: operationDetailQuery,
    reloadCount: reloadCount || 0,
  });

  const dimensionInfo = useMemo(() => getWorkbenchDimensionInfo(detailValue.data), [detailValue.data]);

  const handleDetailClick = useCallback(
    (activeTab: number | undefined) => {
      // Radar 卡片复用顶部“查看详情”的埋点与跳转协议；参数仅由父级当前筛选态透传，避免从全局臆造。
      if (!selectResourceId) {
        return;
      }

      const params = {
        name: VIEW_DETAILS_TEXT,
        action: 'link_click',
        context: BUSINESS_PERFORMANCE_TEXT,
      };
      workbenchEventReport(params, true);
      history.push(
        `/finance/cockpit/operationCapacity/?activeTab=${activeTab}&id=${selectResourceId}&from=${OPERATION_CAPACITY_FROM_WORKSPACE}`,
      );
    },
    [history, selectResourceId],
  );

  const dimensionItem = useCallback(
    () =>
      dimensionInfo.map((item, index) => {
        const status = getDimensionStatus(item);
        const priorityTag = getPriorityTag(status, index);
        const priorityText =
          priorityTag === 'high'
            ? i18n.t('k6473861', {}, '高优')
            : priorityTag === 'medium'
            ? i18n.t('k6429808', {}, '中优')
            : undefined;
        const dimensionMeta = getDimensionMeta(item.metric_group);
        const firstUnqualifiedIndicators = item.group_detail?.filter(indicator => !indicator.is_pass).slice(0, 2) || [];
        const dimensionName = dimensionMeta?.name || '-';

        return (
          <div className={styles.dimension_card} key={`${item.metric_group}_${index}`}>
            <div className={styles.dimension_order}>{formatOrder(index)}</div>
            <div className={styles.dimension_content}>
              <div className={styles.dimension_header} onClick={() => handleDetailClick(item.metric_group)}>
                <div className={styles.dimension_title_group}>
                  <span className={styles.dimension_title}>{dimensionName}</span>
                  <span className={`${styles.status_tag} ${styles[`status_${status}`]}`}>
                    {DIMENSION_STATUS_TEXT[status]}
                  </span>
                  {priorityText ? (
                    <span
                      className={`${styles.priority_tag} ${priorityTag === 'medium' ? styles.priority_tag_medium : ''}`}
                    >
                      {priorityText}
                    </span>
                  ) : null}
                </div>
                <span className={styles.handle_link}>
                  {VIEW_DETAILS_TEXT}
                  <IconRight />
                </span>
              </div>
              <div className={styles.top_issue}>
                <span className={styles.top_issue_label}>{i18n.t('k2015657602', {}, 'Top 问题：')}</span>
                <div className={styles.top_issue_content}>
                  <Typography.Ellipsis showTooltip={{ color: '#fff', className: styles.top_issue_tooltip }}>
                    {getTopIssueText(status, firstUnqualifiedIndicators)}
                  </Typography.Ellipsis>
                </div>
              </div>
              <div className={styles.dimension_desc}>
                <span>{i18n.t('description__2', {}, '说明：')}</span>
                {/* 与经营力详情页共用 GetProductHealthInfo 的 group_detail 字段，hover 展示该维度下指标达标明细。 */}
                <Popover content={getIssueRatioPopoverContent(dimensionName, item)} position='top'>
                  <span className={styles.issue_ratio}>{getIssueRatio(item)}</span>
                </Popover>
                <span>{i18n.t('k3505633621', {}, '不达标/总指标数')}</span>
              </div>
            </div>
          </div>
        );
      }),
    [dimensionInfo, handleDetailClick],
  );

  return (
    <Spin loading={loading || detailLoading} className={styles.loading}>
      {dimensionInfo?.length > 0 ? <div className={styles.equal_container}>{dimensionItem()}</div> : <Empty />}
    </Spin>
  );
};

export default OperationCapacityRadar;
