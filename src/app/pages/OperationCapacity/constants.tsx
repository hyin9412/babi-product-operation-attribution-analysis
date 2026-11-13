import type React from 'react';

import { IconChartBar, IconChartTrend } from '@arco-design/iconbox-react-babi';
import { IconHourglass, IconSettings, IconTarget } from '@arco-design/iconbox-react-ve-o-design';
import { i18n } from '@babi/tools';
import { Link, Tag, TodUserBlock } from '@byted-babi/babi-design';
import dayjs from 'dayjs';

import type { TrendDetail } from 'APP/api-lib/platform/microservice/entity_health';
import { EstimateCycleTypeEnum, IndicatorSourceEnum } from 'APP/api-lib/platform/microservice/entity_health';

import type { IProductHealthDimension } from '../../../adapters/operationCapacityHooks';

import styles from './index.less?module';

export enum QueryDataEnum {
  TotalScore = 1,
  DimensionInfo = 2,
  IndicatorInfo = 3,
}

export enum ScoreGrade {
  good = 'good',
  normal = 'normal',
  bad = 'bad',
  unknown = 'unknown',
}

export const scoreColor = {
  [ScoreGrade.good]: '#2a814b',
  [ScoreGrade.normal]: '#bd7e00',
  [ScoreGrade.bad]: '#d7312a',
  [ScoreGrade.unknown]: '#eaedf1',
};

export const indicatorSource = {
  [IndicatorSourceEnum.SourceBabi]: 'BABI',
  [IndicatorSourceEnum.SourceOfficialWebsite]: i18n.t('bytecloud_big_official_website', {}, '字节云-大官网'),
};

export const estimateCycle = {
  [EstimateCycleTypeEnum.Month]: i18n.t('monthly_2', {}, '月度'),
  [EstimateCycleTypeEnum.QuarterOrHalfYear]: i18n.t('quarterly/semi_annual', {}, '季度/半年'),
};

export enum EBusinessAnalysisMetricCode {
  /** 基础配置 */
  baseConfig = 1,
  /** 账单及时性 */
  billTimely = 2,
  /** 账单准确性 */
  billAccuracy = 3,
  /** 定价偏差度 */
  priceDeviation = 4,
  /** 定价稳定性 */
  priceStability = 5,
}

export const businessAnalysisMetricCodeMap = {
  [EBusinessAnalysisMetricCode.baseConfig]: {
    name: i18n.t('basic_configuration_2', {}, '基础配置'),
    icon: <IconSettings />,
  },
  [EBusinessAnalysisMetricCode.billTimely]: {
    name: i18n.t('k2035781357', {}, '账单及时性'),
    icon: <IconHourglass />,
  },
  [EBusinessAnalysisMetricCode.billAccuracy]: {
    name: i18n.t('k2333871737', {}, '账单准确性'),
    icon: <IconTarget />,
  },
  [EBusinessAnalysisMetricCode.priceDeviation]: {
    name: i18n.t('k2951384943', {}, '定价偏差度'),
    icon: <IconChartBar />,
  },
  [EBusinessAnalysisMetricCode.priceStability]: {
    name: i18n.t('k2044038694', {}, '定价稳定性'),
    icon: <IconChartTrend />,
  },
};

export enum EBusinessAnalysisChildrenMetricCode {
  /** 无定价为1计费项 */
  priceEqOneChargeItemCnt = 'price_eq_1_charge_item_cnt',
  /** 近半年听证次数 */
  priceChangeCnt6m = 'price_change_cnt_6m',
  /** 商品介绍文档完整 */
  productDocNormalFlag = 'product_doc_normal_flag',
  /** 监控报警合理 */
  monitorAlarmNormalFlag = 'monitor_alarm_normal_flag',
  /** 成本配置无异常 */
  costConfigNormalFlag = 'cost_config_normal_flag',
  /** T+1推量能力 */
  pushT1ReadyFlagLm = 'push_t1_ready_flag_lm',
  /** 近半年调账发起及时性 */
  adjustLaunchDelayAvg6m = 'adjust_launch_delay_avg_6m',
  /** 计量问题导致的调账 */
  adjustBizMonthCntMeter6m = 'adjust_biz_month_cnt_meter_6m',
  /** 定价偏差导致的调账 */
  adjustBizMonthCntPrice6m = 'adjust_biz_month_cnt_price_6m',
  /** 回溯或首次推量超时金额占比 */
  retrospectAmountRateLm = 'retrospect_amount_rate_lm',
  /** 月结异常账单修复情况 */
  monthlyBillRepairStatus = 'monthly_bill_repair_status',
  /** 有成本无收入或有收入无成本 */
  costIncomeFlag = 'cost_income_flag',
  /** 成本利润率 */
  costProfitRate = 'cost_profit_rate',
}

export type BusinessAnalysisMetricAttrValue = TrendDetail[] | undefined;

export interface BusinessAnalysisMetricAttr {
  price_eq_1_charge_item_cnt?: BusinessAnalysisMetricAttrValue;
  daily_unready_charge_item_cnt?: BusinessAnalysisMetricAttrValue;
  monthly_unready_charge_item_cnt?: BusinessAnalysisMetricAttrValue;
  daily_unready_charge_item_rate?: BusinessAnalysisMetricAttrValue;
  monthly_unready_charge_item_rate?: BusinessAnalysisMetricAttrValue;
  retrospect_amount_rate_lm?: BusinessAnalysisMetricAttrValue;
  retrospect_cnt_lm?: BusinessAnalysisMetricAttrValue;
  retrospect_total_amount_lm?: BusinessAnalysisMetricAttrValue;
  area?: BusinessAnalysisMetricAttrValue;
  price_change_cnt_6m?: BusinessAnalysisMetricAttrValue;
  cn_cost_profit_rate_6m?: BusinessAnalysisMetricAttrValue;
  non_cn_cost_profit_rate_6m?: BusinessAnalysisMetricAttrValue;
  cn_cost_profit_rate_mtd?: BusinessAnalysisMetricAttrValue;
  non_cn_cost_profit_rate_mtd?: BusinessAnalysisMetricAttrValue;
  cn_total_resource_cost_6m?: BusinessAnalysisMetricAttrValue;
  non_cn_total_resource_cost_6m?: BusinessAnalysisMetricAttrValue;
  bill_date?: BusinessAnalysisMetricAttrValue;
  daily_charge_item_cnt?: BusinessAnalysisMetricAttrValue;
  adjust_biz_month_price?: BusinessAnalysisMetricAttrValue;
  price_eq_1_charge_item_detail?: BusinessAnalysisMetricAttrValue;
  missing_monitor_alarm_detail?: BusinessAnalysisMetricAttrValue;
  adjust_biz_month_meter?: BusinessAnalysisMetricAttrValue;
  monthly_unfixed_amount_by_area?: BusinessAnalysisMetricAttrValue;
  [key: string]: BusinessAnalysisMetricAttrValue;
}

export interface BusinessAnalysisChildrenMetricInfo {
  metric_group: EBusinessAnalysisMetricCode;
  code: EBusinessAnalysisChildrenMetricCode;
  name: string;
  tooltipContent?: React.ReactNode;
  passCurrentData?: React.ReactNode;
  noPassCurrentData?: React.ReactNode;
  noPassReason?: React.ReactNode;
  target: React.ReactNode;
  defaultSuggestion?: React.ReactNode;
}

export type BusinessAnalysisChildrenMetricCodeMap = Record<
  EBusinessAnalysisChildrenMetricCode,
  BusinessAnalysisChildrenMetricInfo
>;

export type BusinessAnalysisTrendSeriesType = 'bar' | 'line';

export type BusinessAnalysisTrendAxisOrient = 'left' | 'right';

export type BusinessAnalysisTrendValueFormat = 'number' | 'percent';

export interface BusinessAnalysisTrendMetricConfig {
  /** 后端 trend.key，对应一条指标曲线/柱形。 */
  code: string;
  /** 图例、tooltip 展示名称。 */
  name: string;
  /** 比率类指标统一在 normalizeTrend 中转成百分比展示，避免图表组件感知业务原始值口径。 */
  isRate?: boolean;
  /** 同一 chart type 可按 axisId 拆成多个 series，实现同类型单轴/双轴/多轴配置。 */
  axisId?: string;
  /** 轴方向不再由 bar/line 写死，配置可决定左轴或右轴。 */
  axisOrient?: BusinessAnalysisTrendAxisOrient;
  /** 轴刻度展示格式；isRate 默认会走 percent，也可显式覆盖。 */
  valueFormat?: BusinessAnalysisTrendValueFormat;
  /** 折线虚线配置，透传给 VChart line.style.lineDash；仅对 line series 生效。 */
  lineDash?: number[];
  /** 图例展示顺序，默认由当前指标配置数组顺序生成。 */
  legendOrder?: number;
}

export type BusinessAnalysisChildrenMetricTrendConfig = Partial<
  Record<BusinessAnalysisTrendSeriesType, BusinessAnalysisTrendMetricConfig[]>
>;

const RATE_PERCENT_MULTIPLE = 100;
const METRIC_DISPLAY_DECIMAL_PLACES = 2;
const MONITOR_ALARM_RULE_DOC_URL = 'https://bytedance.larkoffice.com/docx/OqWjdIcv0ovx8Cx5K9eceAZknZn';

const getNumericMetricAttr = (value: string | number | undefined) => Number(value || 0);

const formatMetricAttrDisplayValue = (value: string | number | undefined) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return '-';
  }

  return numericValue.toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(numericValue) ? 0 : METRIC_DISPLAY_DECIMAL_PLACES,
    maximumFractionDigits: Number.isInteger(numericValue) ? 0 : METRIC_DISPLAY_DECIMAL_PLACES,
  });
};

const getPercentMetricAttr = (value: string | number | undefined) =>
  Number.isFinite(Number(value)) ? formatMetricAttrDisplayValue(Number(value) * RATE_PERCENT_MULTIPLE) : '-';

const isValidNonZeroMetricAttr = (value: string | number | undefined) => {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) && numericValue !== 0;
};

const renderPushT1ReadyNoPassReason = (dailyUnreadyChargeItemCount: number, monthlyUnreadyChargeItemCount: number) => {
  const hasDailyUnreadyChargeItem = dailyUnreadyChargeItemCount > 0;
  const hasMonthlyUnreadyChargeItem = monthlyUnreadyChargeItemCount > 0;

  if (hasDailyUnreadyChargeItem && hasMonthlyUnreadyChargeItem) {
    return `${i18n.t(
      'k832951013',
      {
        dailyUnreadyChargeItemCount: formatMetricAttrDisplayValue(dailyUnreadyChargeItemCount),
        monthlyUnreadyChargeItemCount: formatMetricAttrDisplayValue(monthlyUnreadyChargeItemCount),
      },
      '存在{dailyUnreadyChargeItemCount}个日计费项以及{monthlyUnreadyChargeItemCount}个月计费项推量延迟',
    )}`;
  }

  if (hasDailyUnreadyChargeItem) {
    return `${i18n.t(
      'k727311670',
      { dailyUnreadyChargeItemCount: formatMetricAttrDisplayValue(dailyUnreadyChargeItemCount) },
      '存在{dailyUnreadyChargeItemCount}个日计费项推量延迟',
    )}`;
  }

  if (hasMonthlyUnreadyChargeItem) {
    return `${i18n.t(
      'k1326427911',
      { monthlyUnreadyChargeItemCount: formatMetricAttrDisplayValue(monthlyUnreadyChargeItemCount) },
      '存在{monthlyUnreadyChargeItemCount}个月计费项推量延迟',
    )}`;
  }

  return '-';
};

export const costIncomeAreaNameMap: Record<string, string> = {
  ap: i18n.t('other_overseas', {}, '海外其他'),
  cn: i18n.t('china', {}, '中国'),
  eu: i18n.t('european_ttp', {}, '欧洲 TTP'),
  us: i18n.t('united_states', {}, '美国'),
  OCI: i18n.t('us_ttp', {}, '美国 TTP'),
  non_cn: i18n.t('k6486998', {}, '非中'),
};

export const getCostIncomeAreaName = (areaCode?: string) =>
  areaCode ? costIncomeAreaNameMap[areaCode] || areaCode : '';

const MONTH_DATE_LENGTH = 6;

const isSameMetricCheckPeriod = (metricDate?: TrendDetail['date'], checkPeriod?: string) => {
  const normalizedMetricDate = String(metricDate || '').replace(/\D/g, '');
  const normalizedTargetPeriod = String(checkPeriod || '').replace(/\D/g, '');

  if (!normalizedMetricDate || !normalizedTargetPeriod) {
    return false;
  }

  // 部分明细指标按月聚合返回 YYYYMM，而 check_period 已精确到日 YYYYMMDD，这里按月兼容匹配。
  if (normalizedMetricDate.length === MONTH_DATE_LENGTH && normalizedTargetPeriod.length > MONTH_DATE_LENGTH) {
    return normalizedMetricDate === normalizedTargetPeriod.slice(0, MONTH_DATE_LENGTH);
  }

  return normalizedMetricDate === normalizedTargetPeriod;
};

const PRICE_EQ_ONE_CHARGE_ITEM_DETAIL_SEPARATOR = ',';
const DETAIL_TAG_VISIBLE_LIMIT = 5;

const getDetailListBySeparator = (detail: string | number | undefined) =>
  String(detail || '')
    .split(PRICE_EQ_ONE_CHARGE_ITEM_DETAIL_SEPARATOR)
    .map(detailItem => detailItem.trim())
    .filter(Boolean);

const renderLineBreakDetailList = (detailList: string[]) =>
  detailList.length
    ? detailList.map((detailItem, detailIndex) => (
        <span key={`${detailItem}-${detailIndex}`}>
          {detailIndex > 0 && <br />}
          {detailItem}
        </span>
      ))
    : '-';

const renderDetailTagList = (detailList: string[]) =>
  detailList.length
    ? detailList.slice(0, DETAIL_TAG_VISIBLE_LIMIT).map((detailItem, detailIndex) => (
        <Tag key={`${detailItem}-${detailIndex}`} style={{ margin: '4px 3px' }}>
          {detailItem}
        </Tag>
      ))
    : '-';

const renderPriceEqOneChargeItemNoPassCurrentData = (
  chargeItemCount: string | number | undefined,
  chargeItemDetail: string | number | undefined,
) => {
  const detailList = getDetailListBySeparator(chargeItemDetail);

  return (
    <>
      {`${i18n.t(
        'k4269175511',
        { placeholder0: formatMetricAttrDisplayValue(chargeItemCount) },
        '{placeholder0}个计费项单价为1，包括',
      )}`}
      {renderDetailTagList(detailList)}
    </>
  );
};

const renderMissingMonitorAlarmNoPassCurrentData = (monitorAlarmDetail: string | number | undefined) => {
  const detailList = getDetailListBySeparator(monitorAlarmDetail);

  return (
    <>
      {`${i18n.t(
        'k4097540307',
        { placeholder1: formatMetricAttrDisplayValue(detailList.length) },
        '缺少{placeholder1}个监控项，',
      )}`}
      {renderDetailTagList(detailList)}
    </>
  );
};

const renderPriceChangeDetail = (detail: string | number | undefined) => {
  const detailList = getDetailListBySeparator(detail);

  return renderLineBreakDetailList(detailList);
};

const renderAdjustLaunchDelayDetail = (detailList: BusinessAnalysisMetricAttrValue) => {
  const launchDelayDetailList =
    detailList
      ?.filter(item => {
        const adjustLaunchDelayValue = Number(item.value);

        return (
          item.date &&
          item.dimension === 'all' &&
          Number.isFinite(adjustLaunchDelayValue) &&
          adjustLaunchDelayValue !== 0
        );
      })
      ?.map(
        item =>
          `${i18n.t(
            'k2410676654',
            { placeholder0: item?.date, placeholder2: formatMetricAttrDisplayValue(item?.value) },
            '{placeholder0}平均发起调账的时间为{placeholder2}个月',
          )}`,
      ) || [];

  return renderLineBreakDetailList(launchDelayDetailList);
};

export const businessAnalysisChildrenMetricCodeMapInfo = (
  metric_attr: BusinessAnalysisMetricAttr = {},
  check_period?: string,
  detailData?: IProductHealthDimension[],
): BusinessAnalysisChildrenMetricCodeMap => {
  const {
    price_eq_1_charge_item_cnt,
    daily_unready_charge_item_cnt,
    monthly_unready_charge_item_cnt,
    daily_unready_charge_item_rate,
    monthly_unready_charge_item_rate,
    retrospect_amount_rate_lm,
    retrospect_cnt_lm,
    retrospect_total_amount_lm,
    price_change_cnt_6m,
    cn_cost_profit_rate_6m,
    non_cn_cost_profit_rate_6m,
    cn_cost_profit_rate_mtd,
    non_cn_cost_profit_rate_mtd,
    cn_total_resource_cost_6m,
    non_cn_total_resource_cost_6m,
    daily_charge_item_cnt,
    price_eq_1_charge_item_detail,
    missing_monitor_alarm_detail,
    monthly_unfixed_amount_by_area,
    adjust_launch_delay_avg_6m,
    cost_without_income_flag_mtd,
    income_without_cost_flag_mtd,
    cost_income_metric_attr,
    price_change_6m_detail,
    adjust_meter_metric_attr,
    adjust_price_metric_attr,
  } = metric_attr || {};
  const currentPriceEqOneChargeItem = price_eq_1_charge_item_cnt?.find(
    item => isSameMetricCheckPeriod(item.date, check_period) && item.dimension === 'all',
  );
  const currentPriceEqOneChargeItemDetail = price_eq_1_charge_item_detail?.find(
    item => isSameMetricCheckPeriod(item.date, check_period) && item.dimension === 'all',
  );
  const latestDailyChargeItem = daily_charge_item_cnt?.find(
    item => isSameMetricCheckPeriod(item.date, check_period) && item.dimension === 'all',
  );
  const isBillDateCurrentMonth = dayjs(String(latestDailyChargeItem?.date || '')).isSame(dayjs(), 'month');
  const shouldSkipMonthlyChargeItemStats =
    !isBillDateCurrentMonth && getNumericMetricAttr(latestDailyChargeItem?.value) === 0;
  const missingMonitorAlarmDetailValue =
    missing_monitor_alarm_detail?.find(
      item => isSameMetricCheckPeriod(item.date, check_period) && item.dimension === 'all',
    )?.value || '';
  const missingMonitorAlarmNoPassCurrentData = missingMonitorAlarmDetailValue
    ? renderMissingMonitorAlarmNoPassCurrentData(missingMonitorAlarmDetailValue)
    : i18n.t('k327500507', {}, '缺少0个监控项');
  const currentDailyUnreadyChargeItem = daily_unready_charge_item_cnt?.find(
    item => isSameMetricCheckPeriod(item.date, check_period) && item.dimension === 'all',
  );
  const currentMonthlyUnreadyChargeItem = monthly_unready_charge_item_cnt?.find(
    item => isSameMetricCheckPeriod(item.date, check_period) && item.dimension === 'all',
  );
  const currentDailyUnreadyChargeItemRate = daily_unready_charge_item_rate?.find(
    item => isSameMetricCheckPeriod(item.date, check_period) && item.dimension === 'all',
  );
  const currentMonthlyUnreadyChargeItemRate = monthly_unready_charge_item_rate?.find(
    item => isSameMetricCheckPeriod(item.date, check_period) && item.dimension === 'all',
  );
  const dailyUnreadyChargeItemCount = getNumericMetricAttr(currentDailyUnreadyChargeItem?.value);
  const monthlyUnreadyChargeItemCount = getNumericMetricAttr(currentMonthlyUnreadyChargeItem?.value);
  const hasUnreadyChargeItemCount = dailyUnreadyChargeItemCount > 0 || monthlyUnreadyChargeItemCount > 0;
  const costWithoutIncomeAreaNames =
    cost_without_income_flag_mtd
      ?.filter(
        item => isSameMetricCheckPeriod(item.date, check_period) && item.dimension !== 'all' && item.value === '1',
      )
      ?.map(item => getCostIncomeAreaName(item?.dimension))
      .filter(Boolean) || [];
  const incomeWithoutCostAreaNames =
    income_without_cost_flag_mtd
      ?.filter(
        item => isSameMetricCheckPeriod(item.date, check_period) && item.dimension !== 'all' && item.value === '1',
      )
      ?.map(item => getCostIncomeAreaName(item?.dimension))
      .filter(Boolean) || [];
  const costIncomeNoPassReason = [
    costWithoutIncomeAreaNames.length
      ? `${i18n.t(
          'k157643522',
          { placeholder0: costWithoutIncomeAreaNames.join('、') },
          '{placeholder0}大区存在有成本无收入（资源金额）',
        )}`
      : '',
    incomeWithoutCostAreaNames.length
      ? `${i18n.t(
          'k746978402',
          { placeholder0: incomeWithoutCostAreaNames.join('、') },
          '{placeholder0}大区存在有收入无成本（资源金额）',
        )}`
      : '',
  ]
    .filter(Boolean)
    .join('<br />');
  // 成本利润率的 MTD 指标表示真实当月口径，不跟随后端检测周期 check_period 回溯，避免月初/补数场景误取历史检测月数据。
  const costProfitRateCurrentMonthCheckPeriod = dayjs().format('YYYYMMDD');
  const costProfitRateCurrentMonthDisplay = dayjs().format('YYYY-MM');
  const currentCnCostProfitRateMtd = cn_cost_profit_rate_mtd?.find(
    item => isSameMetricCheckPeriod(item.date, costProfitRateCurrentMonthCheckPeriod) && item.dimension === 'all',
  );
  const currentNonCnCostProfitRateMtd = non_cn_cost_profit_rate_mtd?.find(
    item => isSameMetricCheckPeriod(item.date, costProfitRateCurrentMonthCheckPeriod) && item.dimension === 'all',
  );
  // 依据“月结异常账单修复情况”指标的达标状态；指标不存在时默认按达标处理。
  const isMonthlyBillRepairStatusPass =
    detailData
      ?.flatMap(item => item.group_detail || [])
      .find(metric => metric.metric_code === EBusinessAnalysisChildrenMetricCode.monthlyBillRepairStatus)?.is_pass ??
    true;

  return {
    [EBusinessAnalysisChildrenMetricCode.priceEqOneChargeItemCnt]: {
      metric_group: EBusinessAnalysisMetricCode.baseConfig,
      code: EBusinessAnalysisChildrenMetricCode.priceEqOneChargeItemCnt,
      name: i18n.t('k4258426018', {}, '无定价为1计费项'),
      tooltipContent: (
        <>
          {i18n.t('k3303413389', {}, '商品当前生效版本中的所有计费项定价均不为1，如有商品整体定价正好为1的，请联系')}
          <span style={{ marginLeft: 4, display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
            <TodUserBlock size='mini' border={false} user='guorui.99@bytedance.com' />
          </span>
        </>
      ),
      passCurrentData: i18n.t('k3122963265', {}, '所有计费项定价均不为1'),
      noPassCurrentData:
        getNumericMetricAttr(currentPriceEqOneChargeItem?.value) > 0
          ? renderPriceEqOneChargeItemNoPassCurrentData(
              currentPriceEqOneChargeItem?.value,
              currentPriceEqOneChargeItemDetail?.value,
            )
          : i18n.t('k235873527', {}, '0个计费项单价为1'),
      noPassReason: `${i18n.t(
        'k2678790761',
        {
          placeholder1: formatMetricAttrDisplayValue(currentPriceEqOneChargeItem?.value),
        },
        '存在{placeholder1}个计费项定价为1的计费项',
      )}`,
      target: i18n.t('k3122963265', {}, '所有计费项定价均不为1'),
      defaultSuggestion: '',
    },
    [EBusinessAnalysisChildrenMetricCode.productDocNormalFlag]: {
      metric_group: EBusinessAnalysisMetricCode.baseConfig,
      code: EBusinessAnalysisChildrenMetricCode.productDocNormalFlag,
      name: i18n.t('k1449708792', {}, '商品介绍文档完整'),
      tooltipContent: i18n.t(
        'k3018166143',
        {},
        '预算专用商品、字节云代理商品、产线内部商品，均无需填写商品介绍文档，其余商品已发布为达标（商品介绍tab页面能看到文档），未发布为不达标。',
      ),
      passCurrentData: i18n.t('k644428120', {}, '已上传商品介绍文档'),
      noPassCurrentData: i18n.t('k4196970400', {}, '无商品介绍文档'),
      noPassReason: i18n.t('k1350907952', {}, '商品必须有商品介绍文档'),
      target: i18n.t('k224781996', {}, '在商品配置中上传介绍文档'),
      defaultSuggestion: i18n.t('k3080812117', {}, '请尽快创建商品草稿，编写商品介绍文档，完成商品介绍文档发布'),
    },
    [EBusinessAnalysisChildrenMetricCode.monitorAlarmNormalFlag]: {
      metric_group: EBusinessAnalysisMetricCode.baseConfig,
      code: EBusinessAnalysisChildrenMetricCode.monitorAlarmNormalFlag,
      name: i18n.t('k3428741982', {}, '监控报警合理'),
      tooltipContent: (
        <>
          {i18n.t('k2304735908', {}, '是否符合平台必保告警要求&阈值合理，详情可查看')}
          <Link href={MONITOR_ALARM_RULE_DOC_URL} target='_blank' rel='noopener noreferrer'>
            {i18n.t('k122815699', {}, 'BABI监控报警规则说明2.0')}
          </Link>
        </>
      ),
      passCurrentData: i18n.t('k3117694141', {}, '监控报警配置合理'),
      noPassCurrentData: missingMonitorAlarmNoPassCurrentData,
      noPassReason: i18n.t('k2701988090', {}, '缺少必备监控'),
      target: i18n.t('k646915267', {}, '商品存在符合要求的必备监控监控任务'),
      defaultSuggestion: i18n.t(
        'k4211426656',
        {},
        '请依据商品实际经营情况合理配置监控报警，确保监控报警有效及时发现账单异常',
      ),
    },

    [EBusinessAnalysisChildrenMetricCode.pushT1ReadyFlagLm]: {
      metric_group: EBusinessAnalysisMetricCode.billTimely,
      code: EBusinessAnalysisChildrenMetricCode.pushT1ReadyFlagLm,
      name: i18n.t('k2274061802', {}, 'T+1推量能力'),
      tooltipContent: i18n.t(
        'k1690819054',
        {},
        '达标要求：商品各计费项75%的天数能按照T+1推量即视为达标。月结计费项在月结第二个工作日结束前完成推量则为达标。',
      ),
      passCurrentData: i18n.t('k2105603837', {}, '所有计费项均在T+1完成用量上传'),
      noPassCurrentData: hasUnreadyChargeItemCount ? (
        <>
          {dailyUnreadyChargeItemCount > 0 &&
            `${i18n.t(
              'k898278254',
              {
                placeholder1: formatMetricAttrDisplayValue(currentDailyUnreadyChargeItem?.value),
                placeholder3: getPercentMetricAttr(currentDailyUnreadyChargeItemRate?.value),
              },
              '日结计费项：{placeholder1}个计费项不满足T+1要求，占比{placeholder3}%',
            )}`}
          {dailyUnreadyChargeItemCount > 0 && monthlyUnreadyChargeItemCount > 0 && <br />}
          {monthlyUnreadyChargeItemCount > 0 &&
            `${i18n.t(
              'k124897614',
              {
                placeholder1: formatMetricAttrDisplayValue(currentMonthlyUnreadyChargeItem?.value),
                placeholder3: getPercentMetricAttr(currentMonthlyUnreadyChargeItemRate?.value),
              },
              '月结计费项：{placeholder1}个计费项不满足第二个工作日前完成推量，占比{placeholder3}%',
            )}`}
        </>
      ) : (
        '-'
      ),
      noPassReason: renderPushT1ReadyNoPassReason(dailyUnreadyChargeItemCount, monthlyUnreadyChargeItemCount),
      target: i18n.t('k2257136768', {}, '日结计费项T+1完成用量上传，月计费项在每月第二个工作日完成用量上传'),
      defaultSuggestion: hasUnreadyChargeItemCount ? (
        <>
          {dailyUnreadyChargeItemCount > 0 &&
            i18n.t('k546389294', {}, '当前商品日结算推量未按T+1推量，建议优化日常推账及时性')}
          <br />
          {monthlyUnreadyChargeItemCount > 0 &&
            `${i18n.t('k3333451738', {}, '当前商品月结算推量未在第二个工作日前推量，建议优化月结期间推账及时性')}`}
        </>
      ) : (
        '-'
      ),
    },
    [EBusinessAnalysisChildrenMetricCode.adjustLaunchDelayAvg6m]: {
      metric_group: EBusinessAnalysisMetricCode.billTimely,
      code: EBusinessAnalysisChildrenMetricCode.adjustLaunchDelayAvg6m,
      name: i18n.t('k3540418962', {}, '近半年调账发起及时性'),
      tooltipContent: (
        <>
          <p>
            {i18n.t(
              'k2705595689',
              {},
              '近半年-调账发起及时性：商品方问题下，（主单发起月总和-调整业务账期总和）/发起次数。',
            )}
          </p>
          <p>
            {i18n.t(
              'k522806091',
              {},
              '每个业务账期的均值：商品方问题下，（主单发起月总和-调整业务账期总和） /发起次数。',
            )}
          </p>
        </>
      ),
      passCurrentData: renderAdjustLaunchDelayDetail(adjust_launch_delay_avg_6m),
      noPassCurrentData: renderAdjustLaunchDelayDetail(adjust_launch_delay_avg_6m),
      noPassReason: i18n.t('k1895032862', {}, '近6个月存在账单异常未在T+1月发起调账'),
      target: i18n.t('k1298729420', {}, '平均调账发起时间为T+1月'),
      defaultSuggestion: i18n.t(
        'k710041610',
        {},
        '月结期后账单异常，请在T+1发起对T月账单修正，及时修复账单。同时核查账单监控报警配置情况及定价模型是否合理，尽可能提前发现异常账单',
      ),
    },
    [EBusinessAnalysisChildrenMetricCode.costConfigNormalFlag]: {
      metric_group: EBusinessAnalysisMetricCode.billAccuracy,
      code: EBusinessAnalysisChildrenMetricCode.costConfigNormalFlag,
      name: i18n.t('k354431520', {}, '成本配置无异常'),
      tooltipContent: i18n.t('k3395549129', {}, '该商品成本配置是否异常。'),
      passCurrentData: i18n.t('k811292490', {}, '成本配置无异常（仅代表检测当天的情况）'),
      noPassCurrentData: i18n.t('k990172148', {}, '商品详情页'),
      noPassReason: i18n.t('k1777770109', {}, '当前商品的配置存在冲突或者错误（如无，请忽略）'),
      target: i18n.t('k354431520', {}, '成本配置无异常'),
      defaultSuggestion: i18n.t(
        'k4064307754',
        {},
        '你负责的账号成本配置存在冲突，为避免影响账单生成，请点击链接查看冲突详情并尽快处理',
      ),
    },
    [EBusinessAnalysisChildrenMetricCode.costIncomeFlag]: {
      metric_group: EBusinessAnalysisMetricCode.billAccuracy,
      code: EBusinessAnalysisChildrenMetricCode.costIncomeFlag,
      name: i18n.t('k2877590483', {}, '有成本无收入或有收入无成本'),
      tooltipContent: i18n.t(
        'k1742379594',
        {},
        'by大区计算当月商品的成本/收入（资源金额），成本或收入其一为0，则为异常。',
      ),
      passCurrentData: shouldSkipMonthlyChargeItemStats
        ? i18n.t('k3651458606', {}, '暂不统计月结计费项')
        : i18n.t('k207646207', {}, '无异常'),
      noPassCurrentData: renderLineBreakDetailList(
        cost_income_metric_attr
          ?.filter(item => isSameMetricCheckPeriod(item.date, check_period) && item.dimension !== 'all')
          ?.map(item => {
            const [amount, rate] = item?.value?.split(',');
            const areaName = getCostIncomeAreaName(item?.dimension);
            return `${i18n.t(
              'k2151756453',
              {
                areaName: areaName,
                placeholder2: formatMetricAttrDisplayValue(amount),
                placeholder4: getPercentMetricAttr(rate),
              },
              '{areaName}异常资源金额{placeholder2}元，异常金额占比：{placeholder4}%',
            )}`;
          }) || [],
      ),
      noPassReason: costIncomeNoPassReason,
      target: i18n.t('k1346736170', {}, '每个大区都有成本和收入'),
      defaultSuggestion: i18n.t(
        'k4269702602',
        {},
        '缺少成本，请检查成本配置。缺少收入请联系商品计量负责人检查推量脚本',
      ),
    },
    [EBusinessAnalysisChildrenMetricCode.adjustBizMonthCntMeter6m]: {
      metric_group: EBusinessAnalysisMetricCode.billAccuracy,
      code: EBusinessAnalysisChildrenMetricCode.adjustBizMonthCntMeter6m,
      name: i18n.t('k2375217428', {}, '计量问题导致的调账'),
      tooltipContent: i18n.t(
        'k3624643407',
        {},
        '近半年调账业务账期数-计量问题：商品方问题+计量问题导致的调账业务账期非重复计数。',
      ),
      passCurrentData: i18n.t('k1930643450', {}, '无异常调账'),
      noPassCurrentData: renderLineBreakDetailList(
        adjust_meter_metric_attr
          ?.filter(item => {
            const [amount] = item?.value?.split(',') || [];

            return item.date && item.dimension === 'all' && isValidNonZeroMetricAttr(amount);
          })
          ?.map(item => {
            const [amount, rate] = item?.value?.split(',');
            return i18n.t(
              'k1934630521',
              {
                bill_date: item?.date || '',
                placeholder2: formatMetricAttrDisplayValue(amount),
                placeholder4: getPercentMetricAttr(rate),
              },
              '{bill_date} 调账{placeholder2}元，占收入{placeholder4}%',
            );
          }) || [],
      ),
      noPassReason: i18n.t('k3115741654', {}, '近半年内存在因计量问题而产生调账'),
      target: i18n.t('k2029431743', {}, '近半年无相关原因的调账'),
      defaultSuggestion: i18n.t(
        'k2677826711',
        {},
        '请在月结期核对账单，如有异常请在月结期内修复账单，同时核查账单监控报警配置情况，尽可能提前发现异常账单',
      ),
    },
    [EBusinessAnalysisChildrenMetricCode.retrospectAmountRateLm]: {
      metric_group: EBusinessAnalysisMetricCode.billAccuracy,
      code: EBusinessAnalysisChildrenMetricCode.retrospectAmountRateLm,
      name: i18n.t('k1290179001', {}, '回溯或首次推量超时金额占比'),
      tooltipContent: (
        <>
          <p>
            {i18n.t(
              'k1548619187',
              {},
              '回溯或首次推量超时金额：首次推量时间要求，日结计费项T+1 & 月结计费项第二个工作日。如未在要求内完成首次推量，则记录此商品首次推量金额=0，回溯金额=此账期最后一次推量金额。如商品在规定时间内完成首次推量，则记录回溯金额为最后一次推量金额与规定时间内最后一次金额的差。',
            )}
          </p>
          <p>
            {i18n.t(
              'k1347600872',
              {},
              '回溯或首次推量超时次数：商品当月在规定推量时间外修改计量次数，按计量更新日期维度去重。',
            )}
          </p>
        </>
      ),
      noPassCurrentData: `${i18n.t(
        'k147031917',
        {
          placeholder1: getPercentMetricAttr(
            retrospect_amount_rate_lm?.find(
              item => isSameMetricCheckPeriod(item.date, check_period) && item.dimension === 'all',
            )?.value,
          ),
          placeholder3: formatMetricAttrDisplayValue(
            retrospect_cnt_lm?.find(
              item => isSameMetricCheckPeriod(item.date, check_period) && item.dimension === 'all',
            )?.value,
          ),
          placeholder5: formatMetricAttrDisplayValue(
            retrospect_total_amount_lm?.find(
              item => isSameMetricCheckPeriod(item.date, check_period) && item.dimension === 'all',
            )?.value,
          ),
        },
        '回溯或首次推量超时金额占总收入比例{placeholder1}%，回溯或首次推量超时{placeholder3}次，累计回溯或首次推量超时金额{placeholder5}元',
      )}`,
      passCurrentData: `${i18n.t(
        'k147031917',
        {
          placeholder1: getPercentMetricAttr(
            retrospect_amount_rate_lm?.find(
              item => isSameMetricCheckPeriod(item.date, check_period) && item.dimension === 'all',
            )?.value,
          ),
          placeholder3: formatMetricAttrDisplayValue(
            retrospect_cnt_lm?.find(
              item => isSameMetricCheckPeriod(item.date, check_period) && item.dimension === 'all',
            )?.value,
          ),
          placeholder5: formatMetricAttrDisplayValue(
            retrospect_total_amount_lm?.find(
              item => isSameMetricCheckPeriod(item.date, check_period) && item.dimension === 'all',
            )?.value,
          ),
        },
        '回溯或首次推量超时金额占总收入比例{placeholder1}%，回溯或首次推量超时{placeholder3}次，累计回溯或首次推量超时金额{placeholder5}元',
      )}`,
      noPassReason: i18n.t('k1563767958', {}, '首次推量不符合要求或首次推量后发生重推'),
      target: (
        <>
          {i18n.t('k2556394534', {}, '1、日结计费项T+1完成首次推量&月结计费项第二个工作日完成首次推量')}
          <br />
          {i18n.t('k4185793715', {}, '2、首次推量后，不发生回溯重推')}
        </>
      ),
      defaultSuggestion: i18n.t(
        'k1977286349',
        {},
        '在T+1指标中检测是否有首次推量不符合预期情况，如有请优化推量逻辑，且保证首次推量准确性，不发生重推情况。',
      ),
    },
    [EBusinessAnalysisChildrenMetricCode.monthlyBillRepairStatus]: {
      metric_group: EBusinessAnalysisMetricCode.billAccuracy,
      code: EBusinessAnalysisChildrenMetricCode.monthlyBillRepairStatus,
      name: i18n.t('k1120777988', {}, '月结异常账单修复情况'),
      tooltipContent: (
        <>
          <p>
            {i18n.t(
              'k3941280745',
              {},
              '若商品不存在月结未修复金额或者商品存在月结未修复金额且已发起该业务账期调账，则视为达标，若商品存在月结未修复金额且未发起该业务账期调账，则视为不达标。',
            )}
          </p>
          <p>
            {i18n.t('k698257208', {}, '是否发起调账判断逻辑：有未修复金额的大区只要有一笔审批通过就认为发起了调账。')}
          </p>
        </>
      ),
      passCurrentData: i18n.t('k1460074602', {}, '无待修复异常账单'),
      noPassCurrentData: renderLineBreakDetailList(
        monthly_unfixed_amount_by_area
          ?.filter(
            item =>
              isSameMetricCheckPeriod(item.date, check_period) &&
              item.dimension !== 'all' &&
              isValidNonZeroMetricAttr(item.value),
          )
          ?.map(
            item =>
              `${i18n.t(
                'k2564043606',
                {
                  placeholder0: getCostIncomeAreaName(item?.dimension),
                  placeholder2: check_period ?? '-',
                  placeholder4: formatMetricAttrDisplayValue(item?.value),
                },
                '{placeholder0}大区{placeholder2}月结未修复金额{placeholder4}元',
              )}`,
          ) || [],
      ),

      noPassReason: `${i18n.t(
        'k965130513',
        {
          placeholder0:
            monthly_unfixed_amount_by_area
              ?.filter(item => isSameMetricCheckPeriod(item.date, check_period) && item.dimension !== 'all')
              ?.map(item => getCostIncomeAreaName(item?.dimension))
              .join('、') ?? '-',
        },
        '{placeholder0}大区存在月结未修复金额，且未发起该业务账期的调账',
      )}`,
      target: i18n.t('k3501864883', {}, '及时通过调账修复月结异常情况'),
      defaultSuggestion: '',
    },
    [EBusinessAnalysisChildrenMetricCode.priceChangeCnt6m]: {
      metric_group: EBusinessAnalysisMetricCode.priceStability,
      code: EBusinessAnalysisChildrenMetricCode.priceChangeCnt6m,
      name: i18n.t('k1653984726', {}, '近半年听证次数'),
      tooltipContent: (
        <>
          <p>
            {i18n.t(
              'k2283496073',
              {},
              '半年周期内（月度+半年）听证次数，包括：已有计费项调价、新增商品、新增计费项、修改定价方式、预算专用转普通计费项且修改定价。',
            )}
          </p>
          <p>
            {i18n.t(
              'k2090387975',
              {},
              '不计算次数的场景：听证中仅涉及预算专用转普通计费项且不修改定价、听证中仅涉及下架计费项的不计算次数。',
            )}
          </p>
          <p>{i18n.t('k1399421278', {}, '以审批状态=“已通过”状态来判断是否发起调价。')}</p>
        </>
      ),
      passCurrentData: renderPriceChangeDetail(
        price_change_6m_detail?.find(item => !item.date && item.dimension === 'all')?.value,
      ),
      noPassCurrentData: renderPriceChangeDetail(
        price_change_6m_detail?.find(item => !item.date && item.dimension === 'all')?.value,
      ),
      noPassReason: `${i18n.t(
        'k3457040292',
        {
          placeholder1: formatMetricAttrDisplayValue(
            price_change_cnt_6m?.find(item => !item.date && item.dimension === 'all')?.value,
          ),
        },
        '半年周期内参与{placeholder1}次调价',
      )}`,
      target: i18n.t('k3864045417', {}, '半年调价次数小于等于1'),
      defaultSuggestion: i18n.t('k755224667', {}, '商品定价需结合预期成本和用量变化、功能情况等综合判断，尽可能稳定'),
    },
    [EBusinessAnalysisChildrenMetricCode.costProfitRate]: {
      metric_group: EBusinessAnalysisMetricCode.priceDeviation,
      code: EBusinessAnalysisChildrenMetricCode.costProfitRate,
      name: i18n.t('cost_profit_margin', {}, '成本利润率'),
      tooltipContent: (
        <>
          <p>
            {i18n.t(
              'k3068328412',
              {},
              '成本利润率=纯资源（收入-成本）/成本（（过往完整6个月账期的纯资源口径（当月未落库账期不参与测试））',
            )}
          </p>
          <p>{i18n.t('k2548546272', {}, '目标：中国和非中纯资源成本利润率绝对值 < 5%。')}</p>
        </>
      ),
      passCurrentData: (
        <>
          {`${i18n.t(
            'k3397105005',
            {
              placeholder1: getPercentMetricAttr(
                cn_cost_profit_rate_6m?.find(item => !item.date && item.dimension === 'all')?.value,
              ),
              placeholder3: formatMetricAttrDisplayValue(
                getNumericMetricAttr(
                  cn_total_resource_cost_6m?.find(item => !item.date && item.dimension === 'all')?.value,
                ) / 6,
              ),
              costProfitRateCurrentMonthDisplay: costProfitRateCurrentMonthDisplay,
              placeholder7: getPercentMetricAttr(currentCnCostProfitRateMtd?.value),
            },
            '中国区 近半年 成本利润率 {placeholder1}%，月均成本总金额{placeholder3}元，{costProfitRateCurrentMonthDisplay}成本利润率{placeholder7}%',
          )}`}
          <br />
          {`${i18n.t(
            'k3397020366',
            {
              placeholder1: getPercentMetricAttr(
                non_cn_cost_profit_rate_6m?.find(item => !item.date && item.dimension === 'all')?.value,
              ),
              placeholder3: formatMetricAttrDisplayValue(
                getNumericMetricAttr(
                  non_cn_total_resource_cost_6m?.find(item => !item.date && item.dimension === 'all')?.value,
                ) / 6,
              ),
              costProfitRateCurrentMonthDisplay: costProfitRateCurrentMonthDisplay,
              placeholder7: getPercentMetricAttr(currentNonCnCostProfitRateMtd?.value),
            },
            '非中区 近半年 成本利润率 {placeholder1}%，月均成本总金额{placeholder3}元，{costProfitRateCurrentMonthDisplay}成本利润率{placeholder7}%',
          )}`}
          <br />
          {i18n.t('k796894179', {}, '金额口径：纯资源金额')}
        </>
      ),
      noPassCurrentData: (
        <>
          {`${i18n.t(
            'k3397105005',
            {
              placeholder1: getPercentMetricAttr(
                cn_cost_profit_rate_6m?.find(item => !item.date && item.dimension === 'all')?.value,
              ),
              placeholder3: formatMetricAttrDisplayValue(
                getNumericMetricAttr(
                  cn_total_resource_cost_6m?.find(item => !item.date && item.dimension === 'all')?.value,
                ) / 6,
              ),
              costProfitRateCurrentMonthDisplay: costProfitRateCurrentMonthDisplay,
              placeholder7: getPercentMetricAttr(currentCnCostProfitRateMtd?.value),
            },
            '中国区 近半年 成本利润率 {placeholder1}%，月均成本总金额{placeholder3}元，{costProfitRateCurrentMonthDisplay}成本利润率{placeholder7}%',
          )}`}
          <br />
          {`${i18n.t(
            'k3397020366',
            {
              placeholder1: getPercentMetricAttr(
                non_cn_cost_profit_rate_6m?.find(item => !item.date && item.dimension === 'all')?.value,
              ),
              placeholder3: formatMetricAttrDisplayValue(
                getNumericMetricAttr(
                  non_cn_total_resource_cost_6m?.find(item => !item.date && item.dimension === 'all')?.value,
                ) / 6,
              ),
              costProfitRateCurrentMonthDisplay: costProfitRateCurrentMonthDisplay,
              placeholder7: getPercentMetricAttr(currentNonCnCostProfitRateMtd?.value),
            },
            '非中区 近半年 成本利润率 {placeholder1}%，月均成本总金额{placeholder3}元，{costProfitRateCurrentMonthDisplay}成本利润率{placeholder7}%',
          )}`}
          <br />
          {i18n.t('k796894179', {}, '金额口径：纯资源金额')}
        </>
      ),
      noPassReason: `${
        Math.abs(
          getNumericMetricAttr(cn_cost_profit_rate_6m?.find(item => !item.date && item.dimension === 'all')?.value),
        ) > 0.05
          ? `${i18n.t('k4274333158', {}, '近半年内，中国成本利润率绝对值大于5%')}`
          : ''
      }<br />${
        Math.abs(
          getNumericMetricAttr(non_cn_cost_profit_rate_6m?.find(item => !item.date && item.dimension === 'all')?.value),
        ) > 0.05
          ? `${i18n.t('k3366592613', {}, '近半年内，非中成本利润率绝对值大于5%')}`
          : ''
      }`,
      target: i18n.t('k3589145820', {}, '中国和非中成本利润率绝对值<5% （纯资源金额）'),
      defaultSuggestion: isMonthlyBillRepairStatusPass
        ? i18n.t(
            'k1351729351',
            {},
            '当前检测下，计量偏差在合理范围内，利润率偏差大概率是因为定价问题，请结合半年周期内的售卖量预估情况，调整单价',
          )
        : i18n.t(
            'k4097667872',
            {},
            '目前存在计量错误问题（月结报告中存在未修复待办，请前往查看），在计量准确的前提下，评估利润率是否依然不符合预期',
          ),
    },
    [EBusinessAnalysisChildrenMetricCode.adjustBizMonthCntPrice6m]: {
      metric_group: EBusinessAnalysisMetricCode.priceDeviation,
      code: EBusinessAnalysisChildrenMetricCode.adjustBizMonthCntPrice6m,
      name: i18n.t('k586703488', {}, '定价偏差导致的调账'),
      tooltipContent: i18n.t(
        'k3301465647',
        {},
        '近半年调账业务账期数-非计量问题：商品方问题+非计量问题导致的调账业务账期非重复计数。',
      ),
      passCurrentData: i18n.t('k1930643450', {}, '无异常调账'),
      noPassCurrentData: renderLineBreakDetailList(
        adjust_price_metric_attr
          ?.filter(item => {
            const [amount] = item?.value?.split(',') || [];

            return item.date && item.dimension === 'all' && isValidNonZeroMetricAttr(amount);
          })
          ?.map(item => {
            const [amount, rate] = item?.value?.split(',');
            return i18n.t(
              'k1701992678',
              {
                bill_date: item?.date || '-',
                adjust_biz_month_price: formatMetricAttrDisplayValue(amount),
                placeholder4: getPercentMetricAttr(rate),
              },
              '{bill_date} 调账{adjust_biz_month_price}元，占收入{placeholder4}%',
            );
          }) || [],
      ),
      noPassReason: i18n.t('k973334459', {}, '由于定价偏差导致发起了调账'),
      target: i18n.t('k3909191503', {}, '近半年无定价偏差导致的调账'),
      defaultSuggestion: i18n.t(
        'k747044090',
        {},
        '请在月结期核对账单，如有异常请在月结期内修复账单，同时核查商品定价模型等是否合理',
      ),
    },
  };
};

export const businessAnalysisChildrenMetricCodeMapTrendConfig: Record<
  string,
  BusinessAnalysisChildrenMetricTrendConfig
> = {
  [EBusinessAnalysisChildrenMetricCode.pushT1ReadyFlagLm]: {
    bar: [
      {
        code: 'daily_unready_charge_item_cnt',
        name: i18n.t('k1208699964', {}, '日结计费项不达标个数'),
        axisId: 'left',
        axisOrient: 'left',
      },
      {
        code: 'monthly_unready_charge_item_cnt',
        name: i18n.t('k1208700625', {}, '月结计费项不达标个数'),
        axisId: 'left',
        axisOrient: 'left',
      },
    ],
    line: [
      {
        code: 'daily_unready_charge_item_rate',
        name: i18n.t('k1724896402', {}, '日结计费项不达标占比'),
        isRate: true,
        axisId: 'right',
        axisOrient: 'right',
      },
      {
        code: 'monthly_unready_charge_item_rate',
        name: i18n.t('k1724896895', {}, '月结计费项不达标占比'),
        isRate: true,
        axisId: 'right',
        axisOrient: 'right',
      },
    ],
  },
  [EBusinessAnalysisChildrenMetricCode.adjustLaunchDelayAvg6m]: {
    line: [
      {
        code: 'adjust_launch_delay_avg_6m',
        name: i18n.t('k651641192', {}, '平均滞后时长'),
        axisId: 'left',
        axisOrient: 'left',
      },
    ],
  },
  [EBusinessAnalysisChildrenMetricCode.adjustBizMonthCntMeter6m]: {
    line: [
      // {
      //   code: 'adjust_biz_month_cnt_meter_6m',
      //   name: i18n.t('k2305657393', {}, '调账次数'),
      //   axisId: 'left',
      //   axisOrient: 'left',
      // },
      {
        code: 'adjust_biz_month_meter',
        name: i18n.t('k792909836', {}, '调账金额'),
        axisId: 'left',
        axisOrient: 'left',
      },
    ],
  },
  [EBusinessAnalysisChildrenMetricCode.retrospectAmountRateLm]: {
    line: [
      {
        code: 'retrospect_amount_rate_lm',
        name: i18n.t('k1290179001', {}, '回溯或首次推量超时金额占比'),
        isRate: true,
        axisId: 'left',
        axisOrient: 'left',
      },
      {
        code: 'retrospect_cnt_lm',
        name: i18n.t('k1033751952', {}, '回溯或首次推量超时次数'),
        axisId: 'right',
        axisOrient: 'right',
        lineDash: [4, 4],
      },
    ],
  },
  [EBusinessAnalysisChildrenMetricCode.monthlyBillRepairStatus]: {
    line: [
      {
        code: 'monthly_unfixed_amount_by_area',
        name: i18n.t('k1548865243', {}, '异常未处理金额'),
        axisId: 'left',
        axisOrient: 'left',
      },
    ],
  },
  [EBusinessAnalysisChildrenMetricCode.priceChangeCnt6m]: {
    line: [
      { code: 'price_change_cnt_6m', name: i18n.t('k2307245184', {}, '调价次数'), axisId: 'left', axisOrient: 'left' },
    ],
  },
  [EBusinessAnalysisChildrenMetricCode.costProfitRate]: {
    line: [
      {
        code: 'cn_cost_profit_rate_mtd',
        name: i18n.t('k207434479', {}, '中国区'),
        isRate: true,
        axisId: 'left',
        axisOrient: 'left',
      },
      {
        code: 'non_cn_cost_profit_rate_mtd',
        name: i18n.t('k207546828', {}, '非中区'),
        isRate: true,
        axisId: 'left',
        axisOrient: 'left',
      },
    ],
  },
  [EBusinessAnalysisChildrenMetricCode.adjustBizMonthCntPrice6m]: {
    line: [
      // {
      //   code: 'adjust_biz_month_cnt_price_6m',
      //   name: i18n.t('k2305657393', {}, '调账次数'),
      //   axisId: 'left',
      //   axisOrient: 'left',
      // },
      {
        code: 'adjust_biz_month_price',
        name: i18n.t('k792909836', {}, '调账金额'),
        axisId: 'left',
        axisOrient: 'left',
        // lineDash: [4, 4],
      },
    ],
  },
  [EBusinessAnalysisChildrenMetricCode.costIncomeFlag]: {
    line: [
      {
        code: 'total_resource_cost',
        name: i18n.t('k1678185032', {}, '有收入无成本异常大区金额'),
        axisId: 'left',
        axisOrient: 'left',
        lineDash: [4, 4],
      },
      {
        code: 'total_resource_income',
        name: i18n.t('k87962280', {}, '有成本无收入异常大区金额'),
        axisId: 'left',
        axisOrient: 'left',
      },
    ],
  },
};

export const useCustomTrend = [
  EBusinessAnalysisChildrenMetricCode.priceEqOneChargeItemCnt,
  EBusinessAnalysisChildrenMetricCode.productDocNormalFlag,
  EBusinessAnalysisChildrenMetricCode.monitorAlarmNormalFlag,
  EBusinessAnalysisChildrenMetricCode.costConfigNormalFlag,
];

const CostIncomeTrendTitle = () => (
  <div className={styles.cost_income_trend_title}>
    <div className={styles.cost_income_trend_title_left}>
      <span className={styles.cost_income_trend_main_title}>{i18n.t('k727433804', {}, '成本和收入趋势图')}</span>
      <span className={styles.cost_income_trend_tag_group}>
        <Tag style={{ marginLeft: 8, height: 20, color: '#737A87' }}>
          {i18n.t('day_official_+_month_official', {}, '日正式+月正式')}
        </Tag>
        <Tag style={{ marginLeft: 8, height: 20, color: '#737A87' }}>
          {i18n.t('pure_resource_amount', {}, '纯资源金额')}
        </Tag>
      </span>
    </div>
    <div className={styles.cost_income_trend_legend}>
      <span className={styles.cost_income_trend_legend_item}>
        <span className={styles.cost_income_trend_legend_icon}>
          <span className={styles.cost_income_trend_legend_dash} />
        </span>
        <span>{i18n.t('cost', {}, '成本')}</span>
      </span>
      <span className={styles.cost_income_trend_legend_item}>
        <span className={styles.cost_income_trend_legend_dot_group}>
          <span className={styles.cost_income_trend_legend_dot} />
          <span className={styles.cost_income_trend_legend_dot} />
          <span className={styles.cost_income_trend_legend_dot} />
        </span>
        <span>{i18n.t('income', {}, '收入')}</span>
      </span>
    </div>
  </div>
);

export const TrendTitleMap = {
  [EBusinessAnalysisChildrenMetricCode.pushT1ReadyFlagLm]: i18n.t('k2012543501', {}, '推量不达标计费项的占比趋势图'),
  [EBusinessAnalysisChildrenMetricCode.adjustLaunchDelayAvg6m]: i18n.t('k2166251783', {}, '调账平均滞后时长趋势图'),
  [EBusinessAnalysisChildrenMetricCode.adjustBizMonthCntMeter6m]: (
    <>
      {i18n.t('k336632510', {}, '计量问题导致调账的趋势图')}
      <Tag style={{ marginLeft: 8, height: 20, color: '#737A87' }}>{i18n.t('total_amount', {}, '总金额')}</Tag>
    </>
  ),
  [EBusinessAnalysisChildrenMetricCode.retrospectAmountRateLm]: i18n.t(
    'k2330820339',
    {},
    '回溯或首次推量超时金额占比趋势图',
  ),
  [EBusinessAnalysisChildrenMetricCode.monthlyBillRepairStatus]: (
    <>
      {i18n.t('k2274679185', {}, '异常未处理金额趋势图')}
      <Tag style={{ marginLeft: 8, height: 20, color: '#737A87' }}>{i18n.t('total_amount', {}, '总金额')}</Tag>
    </>
  ),
  [EBusinessAnalysisChildrenMetricCode.priceChangeCnt6m]: i18n.t('k2774486026', {}, '调价次数趋势图'),
  [EBusinessAnalysisChildrenMetricCode.costProfitRate]: (
    <>
      {i18n.t('k2589645595', {}, '成本利润率趋势图')}
      <Tag style={{ marginLeft: 8, height: 20, color: '#737A87' }}>
        {i18n.t('pure_resource_amount', {}, '纯资源金额')}
      </Tag>
    </>
  ),
  [EBusinessAnalysisChildrenMetricCode.adjustBizMonthCntPrice6m]: i18n.t('k3507075462', {}, '调账金额趋势图'),
  [EBusinessAnalysisChildrenMetricCode.costIncomeFlag]: <CostIncomeTrendTitle />,
};

/**
 * 图表标题包含 Tag、图例等 ReactNode，埋点只需要用户看到的主标题，因此单独维护纯文本映射。
 */
export const TrendTitleTextMap: Partial<Record<EBusinessAnalysisChildrenMetricCode, string>> = {
  [EBusinessAnalysisChildrenMetricCode.pushT1ReadyFlagLm]: i18n.t('k2012543501', {}, '推量不达标计费项的占比趋势图'),
  [EBusinessAnalysisChildrenMetricCode.adjustLaunchDelayAvg6m]: i18n.t('k2166251783', {}, '调账平均滞后时长趋势图'),
  [EBusinessAnalysisChildrenMetricCode.adjustBizMonthCntMeter6m]: i18n.t('k336632510', {}, '计量问题导致调账的趋势图'),
  [EBusinessAnalysisChildrenMetricCode.retrospectAmountRateLm]: i18n.t(
    'k2330820339',
    {},
    '回溯或首次推量超时金额占比趋势图',
  ),
  [EBusinessAnalysisChildrenMetricCode.monthlyBillRepairStatus]: i18n.t('k2274679185', {}, '异常未处理金额趋势图'),
  [EBusinessAnalysisChildrenMetricCode.priceChangeCnt6m]: i18n.t('k2774486026', {}, '调价次数趋势图'),
  [EBusinessAnalysisChildrenMetricCode.costProfitRate]: i18n.t('k2589645595', {}, '成本利润率趋势图'),
  [EBusinessAnalysisChildrenMetricCode.adjustBizMonthCntPrice6m]: i18n.t('k3507075462', {}, '调账金额趋势图'),
  [EBusinessAnalysisChildrenMetricCode.costIncomeFlag]: i18n.t('k727433804', {}, '成本和收入趋势图'),
};
