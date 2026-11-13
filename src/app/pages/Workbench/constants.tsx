import React from 'react';

import { i18n } from '@babi/tools';
import { IStep } from '@tod-m/materials/es/XGuide/interface';
import moment from 'moment-timezone';
import workspaceActivityDetailGuide from 'src/app/static/workspace_activity_detail_guide.png';
import workspaceActivitySubscriptionGuide from 'src/app/static/workspace_activity_subscription_guide.png';
import activityTitleGuide from 'src/app/static/workspace_activity_title_guide.png';
import workspaceProductLineGuide from 'src/app/static/workspace_product_line_guide.png';
import workspaceSecondProductLineGuide from 'src/app/static/workspace_second_product_line_guide.png';

import { EntityTypeEnum } from 'APP/api-lib/platform/microservice/event';
import { EAlarmObjectType } from 'PAGES/MonitorAlarmManage/MonitorManage/type';
import { IExtraData } from 'PAGES/Workbench/PersonalContent/component/activity';

export const WorkspacePermissionKey = {
  appWorkspaceRead: 'app_workspace_read',
  productWorkspaceRead: 'product_workspace_read',
  departmentWorkspaceRead: 'department_workspace_read',
  secondProductLineWorkspaceRead: 'second_product_line_workspace_read',
  secondProductWorkspaceRead: 'second_product_workspace_read',
  subProductWorkspaceRead: 'sub_product_workspace_read',
};

export enum EntityKey {
  Product = 'product',
  SecondProduct = 'second_product', // 产品
  SubProduct = 'sub_product',
  ProductLine = 'product_line',
  APP = 'app',
  SecondProductLine = 'second_product_line',
  ServiceTree = 'service_tree',
  Personal = 'personal',
}

export const SubscriptionMap = {
  [EntityTypeEnum.Product]: i18n.t('Product', {}, '商品'),
};

export const entityMap = {
  [EntityKey.Product]: i18n.t('Product', {}, '商品'),
  [EntityKey.ProductLine]: i18n.t('product_line', {}, '产品线'),
  [EntityKey.APP]: 'APP',
};

export const enum CardType {
  dashboard = 'dashboard',
  report = 'report',
  subject = 'subject',
}

const getBeforeTimeFormat = (amount: number) => {
  return [moment(new Date()).subtract(amount, 'month').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')];
};

/** 币种 */
export enum ECurrency {
  /** 元 */
  CNY = 1,
  /** 美元 */
  USD,
  /** 百分比 */
  PERCENT,
}

/** 币种对应的字符 */
export const CurrencyMap = {
  [ECurrency.CNY]: [i18n.t('yuan', {}, '元'), '￥'],
  [ECurrency.USD]: [i18n.t('dollar', {}, '美元'), '$'],
  [ECurrency.PERCENT]: ['%', ''],
};

export const workbenchGuideSteps = (currentTab: string | undefined): IStep[] => {
  if (currentTab === EntityKey.SecondProductLine || currentTab === EntityKey.ProductLine) {
    return [
      {
        title: i18n.t('k2570567602', {}, '切换维度'),
        content: (
          <div>
            <img
              src={currentTab === EntityKey.ProductLine ? workspaceProductLineGuide : workspaceSecondProductLineGuide}
              style={{ width: '100%', height: 'auto' }}
            />
            {i18n.t('k1576147510', {}, '点击可查看不同维度的成本分布数据')}
          </div>
        ),
        placement: 'right',
        selector: '#workbenchProductLineGuideStep1',
        offset: {
          y: 0,
          x: 8,
        },
      },
    ] as IStep[];
  } else if (currentTab === EntityKey.Personal) {
    return [
      {
        title: i18n.t('k607888482', {}, '进行中的经营活动'),
        content: (
          <div>
            <img src={activityTitleGuide} style={{ width: '100%', height: 'auto' }} />
            {i18n.t('k917183320', {}, '此处展示正在进行中的经营活动。可分别查看待我处理的活动，和全部活动。')}
          </div>
        ),
        placement: 'right-top',
        selector: '#workbenchPersonalGuideStep1',
        offset: {
          y: -28,
          x: 0,
        },
      },
      {
        title: i18n.t('k2177823539', {}, '待我处理'),
        content: i18n.t('k1954828070', {}, '当用户所拥有的主体存在需要参与的活动。会在此Tab下展示。'),
        placement: 'right',
        selector: '#workbenchPersonalGuideStep2',
        offset: {
          y: 0,
          x: -80,
        },
      },
      {
        title: i18n.t('k373192217', {}, '悬浮查看活动详情'),
        content: (
          <div>
            <img src={workspaceActivityDetailGuide} style={{ width: '100%', height: 'auto' }} />
            {i18n.t('k1729831877', {}, '将光标移至对应活动板块时，可查看“待我处理”的原因及活动说明。')}
          </div>
        ),
        placement: 'right',
        selector: '#workbenchPersonalGuideStep3',
        offset: {
          y: 86,
          x: 0,
        },
      },
      {
        title: i18n.t('k709304727', {}, '我的订阅'),
        content: (
          <div>
            <img src={workspaceActivitySubscriptionGuide} style={{ width: '100%', height: 'auto' }} />
            {i18n.t('k2040090030', {}, '用户可在商品模块订阅商品变更事件，此处展示用户已订阅的内容。')}
          </div>
        ),
        placement: 'right',
        selector: '#workbenchPersonalGuideStep4',
        offset: {
          y: 0,
          x: 20,
        },
      },
    ].filter(Boolean) as IStep[];
  } else {
    return [];
  }
};

export const tableGroupKey: Record<string, string[][]> = {
  [EntityKey.ProductLine]: [['babi_bill_product_line_income_cost']],
  [EntityKey.SecondProductLine]: [['babi_bill_sub_department_income_cost']],
  [EntityKey.SecondProduct]: [['babi_bill_standard_product_income_cost']],
};

export const tableTitle = {
  babi_bill_product_line_income_cost: i18n.t('k1787682572', {}, '产品线的成本分布 -'),
  babi_bill_sub_department_income_cost: i18n.t('k1166134535', {}, '二级产品线的成本分布 -'),
  babi_bill_standard_product_income_cost: i18n.t('k184103187', {}, '产品的成本分布 -'),
};

export const ApprovalListMap: Record<string, { name: string; link: string }> = {
  approval: {
    name: i18n.t('k2381195565', {}, '工单审批'),
    link: '/finance/flow/list/?currentTab=APPROVAL',
  },
  product_discount: {
    name: i18n.t('k2701467435', {}, '折扣溢价'),
    link: `/finance/product/productDiscount/?CreateTime=${getBeforeTimeFormat(1)}`,
  },
  // budget_approval: {
  //   name: i18n.t('Budget_approval', {}, '预算审批'),
  //   link: '/finance/budgetNew/receiptManage/?isTodo=true&Status=0',
  // },
};

export const AlarmListMap: Record<string, { name: string; link: string }> = {
  [EAlarmObjectType.Product]: {
    name: i18n.t('commodity_alarm', {}, '商品报警'),
    link: '/finance/alarmManage/?entity_type=product&status=6,0',
  },
  [EAlarmObjectType.ServiceTree]: {
    name: i18n.t('k3576486235', {}, '服务树报警'),
    link: '/finance/alarmManage/?entity_type=servicetree&status=0,6',
  },
  [EAlarmObjectType.APP]: {
    name: i18n.t('k3564862727', {}, 'App报警'),
    link: '/finance/alarmManage/?entity_type=app&status=0,6',
  },
};

export const EActivityTab = {
  pending: 'pending',
  all: 'all',
};

export enum EActivityType {
  monthlyPriceAdjustment = 'monthly_price_adjustment',
  halfYearPriceAdjustment = 'half_year_price_adjustment',
  hcConfig = 'hc_config',
  monthlySettlement = 'monthly_settlement',
  monthlyBillAdjustment = 'monthly_bill_adjustment',
  externalCostEntry = 'external_cost_entry',
}

export const activityTypeMapFn = (data?: IExtraData) => {
  const { activity_id, income_status, cost_status, title } = data || {};
  const status = income_status ?? cost_status;
  return {
    [EActivityType.monthlyPriceAdjustment]: {
      name: i18n.t('monthly_price_adjustment', {}, '月度调价'),
      url: `/finance/product/pricing_activity/?activity_id=${activity_id}`,
      activityDesc: i18n.t('k3004552286', {}, '商品新增及价格调整，次月1日生效。'),
    },
    [EActivityType.halfYearPriceAdjustment]: {
      name: i18n.t('half_year_price_adjustment', {}, '半年调价'),
      url: `/finance/product/pricing_activity/?activity_id=${activity_id}`,
      activityDesc: i18n.t('k3004552286', {}, '商品新增及价格调整，次月1日生效。'),
    },
    [EActivityType.hcConfig]: {
      name: i18n.t('manpower_allocation', {}, '人力配置'),
      // 没有枚举只能通过名称来判断
      url: title?.includes(i18n.t('k525417767', {}, '人力分配调整期'))
        ? `/finance/human/productAssociationConfig/?Month=${moment().add(-1, 'month').format('YYYY-MM')}`
        : '/finance/human/productAssociationConfig/',
      activityDesc: i18n.t('k2726229997', {}, '将二级产品线人力分配至商品。'),
    },
    [EActivityType.monthlySettlement]: {
      name: i18n.t('monthly_end', {}, '月结'),
      url: status ? `/finance/sell/billAckProduct/?status=${status}` : '/finance/sell/billAckProduct/',
      activityDesc: i18n.t('k3954718881', {}, '上月账单结算，结束后同步至财务系统。'),
    },
    [EActivityType.externalCostEntry]: {
      name: i18n.t('Outsourcing_cost_entry', {}, '外采成本录入'),
      url: status ? `/finance/sell/billAckProduct/?status=${status}` : '/finance/sell/billAckProduct/',
      activityDesc: i18n.t('k3954718881', {}, '上月账单结算，结束后同步至财务系统。'),
    },
    [EActivityType.monthlyBillAdjustment]: {
      name: i18n.t('monthly_bill_adjustment', {}, '月度账单调整'),
      url: '/finance/sell/trueUp/',
      activityDesc: i18n.t('k1455258264', {}, '可对前3个月账单总额进行调整。'),
    },
  };
};
