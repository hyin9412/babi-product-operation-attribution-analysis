import { matchPath } from 'adapters/reactRouterCompat';

import { checkIsBoe, i18n } from '@babi/tools';
import { useRequest } from '@byted/hooks';
import { ZoneDelta } from '@editor-kit/delta';
import dayjs from 'dayjs';
import { debounce, isEmpty } from 'lodash';

import { accountServiceClient } from 'APP/api-lib/platform/account/account_service';
import { EntityStatusEnum, EntityTypeEnum } from 'APP/api-lib/platform/account/entity';
import { platformServiceClient } from 'APP/api-lib/platform/microservice/bytedance_babi_platform_service';

import { EntityKey, WorkspacePermissionKey } from './constants';

export const getWorkspaceReadList = (entity: string, permissionKey: string) => {
  const { permission } = window._babi_pre_interface;
  const res: string[] = [];
  if (permission[entity]) {
    Object.entries(permission[entity]).forEach((item: [string, any]) => {
      if (item[1].includes(permissionKey)) {
        res.push(item[0]);
      }
    });
  }
  return res;
};

export const useGetEntityOptions = (tabList: string[]) => {
  const { data: appRes, loading: appLoading } = useRequest(
    async () => {
      const res = await accountServiceClient.ListEntity({
        type: EntityTypeEnum.APP,
        page_size: 100000,
        status: [EntityStatusEnum.INVALID, EntityStatusEnum.VALID],
        action: WorkspacePermissionKey.appWorkspaceRead,
        sort_rules: [
          {
            key: 'name',
            rule: 'desc',
          },
        ],
      });
      const data = res.data.entities ?? [];
      return data.map(item => ({
        ...item,
        entity_id: String(item.id),
      }));
    },
    { ready: tabList.includes(EntityKey.APP), auto: true },
  );

  const { data: productLineRes, loading: productLineLoading } = useRequest(
    async () => {
      const res = await accountServiceClient.ListEntity({
        type: EntityTypeEnum.PRODUCT_LINE,
        page_size: 100000,
        status: [EntityStatusEnum.INVALID, EntityStatusEnum.VALID],
        sort_rules: [
          {
            key: 'name',
            rule: 'desc',
          },
        ],
        action: WorkspacePermissionKey.departmentWorkspaceRead,
      });
      const data = res.data.entities ?? [];
      return data.map(item => ({
        ...item,
        entity_id: String(item.id),
      }));
    },
    { ready: tabList.includes(EntityKey.ProductLine), auto: true },
  );

  const { data: secondProductLineRes, loading: secondProductLineLoading } = useRequest(
    async () => {
      const res = await accountServiceClient.ListEntity({
        type: EntityTypeEnum.SECOND_PRODUCT_LINE,
        page_size: 100000,
        status: [EntityStatusEnum.INVALID, EntityStatusEnum.VALID],
        action: WorkspacePermissionKey.secondProductLineWorkspaceRead,
        sort_rules: [
          {
            key: 'name',
            rule: 'desc',
          },
        ],
        // action: WorkspacePermissionKey.departmentWorkspaceRead,
      });
      const data = res.data.entities ?? [];
      return data.map(item => ({
        ...item,
        entity_id: String(item.id),
      }));
    },
    { ready: tabList.includes(EntityKey.ProductLine), auto: true },
  );

  const { data: productRes, loading: productLoading } = useRequest(
    async () => {
      const res = await accountServiceClient.ListEntity({
        type: EntityTypeEnum.GOODS,
        action: WorkspacePermissionKey.productWorkspaceRead,
        page_size: 100000,
        status: [EntityStatusEnum.INVALID, EntityStatusEnum.VALID],
        sort_rules: [
          {
            key: 'name',
            rule: 'desc',
          },
        ],
      });
      const data = res.data.entities ?? [];
      return data.map((item: any) => ({
        ...item,
        entity_id: String(item.id),
      }));
    },
    { ready: tabList.includes(EntityKey.Product), auto: true },
  );

  const { data: secondProductRes, loading: secondProductLoading } = useRequest(
    async () => {
      const res = await accountServiceClient.ListEntity({
        type: EntityTypeEnum.PRODUCT,
        action: WorkspacePermissionKey.secondProductWorkspaceRead,
        page_size: 100000,
        status: [EntityStatusEnum.INVALID, EntityStatusEnum.VALID],
        sort_rules: [
          {
            key: 'name',
            rule: 'desc',
          },
        ],
      });
      const data = res.data.entities ?? [];
      return data.map((item: any) => ({
        ...item,
        entity_id: String(item.id),
      }));
    },
    { ready: tabList.includes(EntityKey.SecondProduct), auto: true },
  );

  const { data: subProductRes, loading: subProductLoading } = useRequest(
    async () => {
      const res = await accountServiceClient.ListEntity({
        type: EntityTypeEnum.SUB_PRODUCT,
        page_size: 100000,
        status: [EntityStatusEnum.INVALID, EntityStatusEnum.VALID],
        action: WorkspacePermissionKey.subProductWorkspaceRead,
        sort_rules: [
          {
            key: 'name',
            rule: 'desc',
          },
        ],
      });
      const data = res.data.entities ?? [];
      return data.map(item => ({
        ...item,
        entity_id: String(item.id),
      }));
    },
    { ready: tabList.includes(EntityKey.SubProduct), auto: true },
  );

  return {
    productRes,
    productLineRes,
    appRes,
    secondProductLineRes,
    serviceRes: [],
    secondProductRes,
    subProductRes,
    loading:
      appLoading ||
      productLineLoading ||
      productLoading ||
      secondProductLineLoading ||
      secondProductLoading ||
      subProductLoading,
  };
};

export const formatNum = (num: number | undefined) => {
  if (num === undefined || num < 0) {
    return '-';
  }
  return num;
};

export const formatObjectValue = (num: number | undefined, isPercent?: boolean) => {
  let formatValue: number | string = num || 0;
  let unit = '';
  if (num === undefined || num < 0) {
    formatValue = '-';
  } else if (isPercent) {
    formatValue = num * 100;
  } else if (num >= 100000000) {
    formatValue = (num / 100000000).toFixed(2);
    unit = i18n.t('a_hundred_million', {}, '亿');
  } else if (num >= 10000) {
    formatValue = (num / 10000).toFixed(2);
    unit = i18n.t('ten_thousand_', {}, '万');
  }

  return {
    formatValue,
    unit,
  };
};

export const formatEditorValue = (value: string) => {
  if (!value) {
    return undefined;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    const zoneDelta = new ZoneDelta({ zoneId: '0' }).insert(value);
    return {
      0: zoneDelta,
    };
  }
};

export const resourceUrlMapMenu = {};
const getResourceUrlMapMenu = (allMenus: any[], icon?: string) => {
  allMenus.forEach(item => {
    const menuIcon = icon || item.Icon;
    resourceUrlMapMenu[item.ResourceUrl] = { ...item, Icon: menuIcon };
    if (item.Children?.length) {
      getResourceUrlMapMenu(item.Children, menuIcon);
    }
  });
};

export const recordRouteChange = debounce(() => {
  if (isEmpty(resourceUrlMapMenu)) {
    getResourceUrlMapMenu(window._babi_pre_interface?.allMenus);
  }
  const pathname = window.location.pathname;
  // 忽略工作台页
  if (pathname === '/' || !pathname || pathname === '/finance/workspace/') {
    return;
  }

  const route = Object.keys(resourceUrlMapMenu).find(key => {
    if (matchPath(pathname, { path: key, exact: true })) {
      return key;
    }
  });

  platformServiceClient.SetRecentlyViewed(
    {
      route,
      url: `${window.location.pathname}${window.location.search}`,
    },
    {
      messageError: false,
    },
  );
}, 500);

/**
 * 计算当前时间到指定时间戳的距离
 * @param timestamp 目标时间戳（毫秒）
 * @returns 时间距离的描述
 * - >=1天：显示"XX天"
 * - <1天且>1小时：显示"XX小时"
 * - <1小时：显示"小于1小时"
 */
export const calculateTimeDistance = (timestamp: number): string => {
  const currentTime = dayjs();
  const targetTime = dayjs(timestamp);
  const diffInHours = targetTime.diff(currentTime, 'hour');
  if (diffInHours < 0) {
    return i18n.t('expired', {}, '已过期');
  } else if (diffInHours >= 24) {
    const days = Math.floor(diffInHours / 24);
    return `${i18n.t('k869253189', { days: days }, '{days}天')}`;
  } else if (diffInHours >= 1) {
    return `${i18n.t('k642746787', { diffInHours: diffInHours }, '{diffInHours}小时')}`;
  } else {
    return i18n.t('k3166906764', {}, '小于1小时');
  }
};

export const getCloudDomain = () => {
  return checkIsBoe() ? 'https://cloud-sandbox.bytedance.net' : 'https://cloud.bytedance.net';
};
