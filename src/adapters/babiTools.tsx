import React from 'react';
import {
  IconOtherResourceConfig, IconHome, IconMonitorMeasure, IconShoppingBag,
  IconDeliveryControl, IconCardTeam, IconDynamicControl, IconCardInfo,
  IconOtherApplication, IconOtherAlarm, IconVerticalRectTask,
} from '@arco-design/iconbox-react-babi';
import { BehaviorSubject } from 'rxjs';
import newTitle from '../app/toolkit/assets/newTitle.svg';

export const BABI_I18N_LOCAL_LANGUAGE = 'BABI_I18N_LOCAL_LANGUAGE';
export const BABI_USER_CURRENT_ROLE = 'BABI_USER_CURRENT_ROLE';
export const i18n = {
  t: (_key: string, params?: Record<string, string | number>, fallback = '') => {
    let text = fallback || _key;
    Object.entries(params || {}).forEach(([key, value]) => { text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)); });
    return text;
  },
};
export default i18n;
export const Actions = { serviceTreeWorkspaceRead: 'serviceTree_workspace_read', budgetWindowStageRead: 'budget_window_stage_read', costRead: 'cost_read' };
export const Resource = { babi: 'babi', serviceTreeNode: 'serviceTreeNode', budgetAreaBudgetSource: 'budgetAreaBudgetSource' };
export const globalStore = { fullscreen: false };

interface MenuNode {
  Id: number; ParentId: number; Level: number; Category: number; MenuName: string;
  ResourceUrl: string; Icon: string; Status: number; IsVisible: number; HasPermission: boolean; Children: MenuNode[];
}
type MenuSpec = [number, string, string?, MenuSpec[]?, string?, boolean?];
// References: modified from toutiao-fe-vcloud-finance/apps/web/src/app/frame-layout/components/Layout/Sider.tsx:78-175.
// Visible navigation snapshot verified at https://babi.bytedance.net/finance/workspace/ on 2026-11-10.
// Retain real menu IDs/order/icons/permission visibility, without user or ACL metadata. Only the PRD transparency entry is added.
const createMenus = (items: MenuSpec[], parentId = 0, level = 1): MenuNode[] => items.map(([Id, MenuName, ResourceUrl = '', children = [], Icon = '', HasPermission = true]) => ({
  Id, ParentId: parentId, Level: level, Category: 1, MenuName, ResourceUrl, Icon, Status: 1, IsVisible: 1, HasPermission,
  Children: createMenus(children, Id, level + 1),
}));
const allMenus = createMenus([
  [278, '经营工作台', '/finance/workspace', [], 'IconHome'],
  [2, '收支管理', '', [
    [263, '可视化分析', '/finance/sell/analysis/'],
    [10001, '透明化分析', '/finance/sell/transparency'],
    [271, '洞察报告', '/finance/sell/report', [[274, '报告实例列表', '/finance/sell/report/list']]],
    [386, '标签管理', '/finance_next/tagManagement'],
    [8, '产品线收支', '/finance/sell/division/new'],
    [141, '二级产品线收支', '/finance/sell/secondaryProduct/new'],
    [349, '子产品收支', '/finance/sell/subProduct'],
    [3, '商品收支', '/finance/sell/productIncome/new'],
    [7, '服务树成本', '/finance/sell/cost/new'],
    [6, 'App成本', '/finance/sell/app/new'],
    [5, '商品计量', '/finance/sell/measure/'],
    [11, '月度账单调整', '/finance/sell/trueUp/'],
    [9, '商品月结账单确认', '/finance/sell/billAckProduct/'],
    [10, 'App月结账单确认', '/finance/sell/billAckApp/'],
  ], 'IconMonitorMeasure'],
  [318, '成本优化', '', [
    [331, '优化概览', '/finance/finopsTeamOverview'], [321, '优化建议', '/finance/finopsSuggest'], [332, '治理配置', '/finance/finopsCostTeam'],
  ], 'IconMonitorMeasure'],
  [12, '产商品管理', '', [
    [13, '商品管理', '/finance/product/myProduct/'], [257, '产品线管理', '/finance/subject/productLine/'],
    [355, '折扣溢价管理', '/finance/product/productDiscountNext'], [350, '调价活动管理', '/finance/product/pricing_activity'],
    [27, '月度调价看板', '', [[226, '受影响方看板', '/finance/priceAdjustment/monthlyAdjust/affectedPanel/'], [28, '听证材料', '/finance/priceAdjustment/monthlyAdjust/hearingMaterialList/'], [30, '听证进度看板', '/finance/priceAdjustment/monthlyAdjust/progressBulletinBoard/']]],
    [197, '半年调价看板', '', [[198, '受影响方看板', '/finance/priceAdjustment/halfYearAdjust/affectedPanel/'], [199, '听证材料', '/finance/priceAdjustment/halfYearAdjust/hearingMaterialList/'], [241, '调价方看板', '/finance/priceAdjustment/halfYearAdjust/providerPanel/']]],
    [55, '外采成本录入', '/finance/manage/cost/'],
  ], 'IconShoppingBag'],
  [351, '模型测算', '', [
    [352, '模型广场', '/finance_next/modelSpace/modelList', [[353, '创建/编辑模型', '/finance_next/modelDetail']]],
    [406, '收入拆解', '/finance/budgetNew/ModelManage/IncomeSplitConfig/IncomeSplitModelList', [[407, '收入拆解配置页', '/finance/budgetNew/modelManage/IncomeSplitManage/IncomeSplitModelEdit/:ID/'], [408, '收入拆解详情页', '/finance/budgetNew/modelManage/IncomeSplitManage/IncomeSplitModelView/:ID/']]],
  ], 'IconDeliveryControl'],
  [62, '人力管理', '', [
    [63, '人力配置', '/finance/human/productAssociationConfig/'],
    [242, '产品线人力数据', '/finance/human/productHCBillDetailBusiness/', [], '', false],
    [294, '二级产品线人力数据', '/finance/human/secondaryProductLineHCBill/', [], '', false],
    [64, '部门人力数据', '/finance/human/productHCBillDetail/', [], '', false],
  ], 'IconCardTeam'],
  [89, '预算管理', '', [
    [90, '预算配置', '', [
      [251, '预算单元', '/finance/budgetNew/basicConfig/budgetSource/', [[295, '预算单元详情', '/finance/budgetNew/basicConfig/budgetSource/detail/:ID/']]],
      [303, '预算商品', '/finance/budgetNew/basicConfig/BudgetProductQuery/'],
      [391, '优化目标配置', '/finance/budgetNew/optimization/configuration'], [395, '优化目标查询', '/finance/budgetNew/optimization/query'],
      [396, '建议值', '/finance/budgetNew/RecommendedValueManagement/'], [91, '预算窗口', '/finance/budgetNew/basicConfig/mainWindow/'],
    ]],
    [218, '预算提报', '', [[333, '成本预算提报', '/finance/budgetNew/budgetFill/'], [221, '收入预算提报', '/finance/budgetNew/rollingEstimate/incomeEstimateFill/'], [397, '单据管理', '/finance/budgetNew/receiptManage/']]],
    [102, '分析查询', '', [[374, '预算概览', '/finance/budgetNew/inquery/unifiedOverview'], [139, '预实消耗概览', '/finance/budgetNew/inquery/consumption/'], [366, 'CD 分析', '/finance/budgetNew/inquery/costDriver']]],
    [375, '预算调整', '/finance/budgetNew/budgetAdjustment', [[376, '预算调整详情', '/finance/budgetNew/budgetAdjustment/detail']]],
    [390, '更多预算工具', '', [[402, '电力分配', '/finance/budgetNew/electricity']]],
  ], 'IconDynamicControl'],
  [108, '交付管理', '', [[246, '主业务需求', '/finance/arrival/demandManager/mainDemand/'], [268, 'TOB需求', '/finance/arrival/demandManager/2bDemand/'], [270, 'TOB预测', '/finance/arrival/demandManager/2bPredict/'], [285, '预交付', '/finance/arrival/preArrivalManager/']], 'IconDeliveryControl'],
  [317, '账号管理', '', [[40, '火山账号管理', '/finance/basic/volcManage/'], [260, 'BABI账号管理', '/finance/accountManage/account']], 'IconCardInfo'],
  [252, '业务管理', '', [[254, 'App管理', '/finance/subject/app/'], [282, '职能部门管理', '/finance/subject/functionalDepartment/', [[284, '职能部门详情', '/finance/subject/functionalDepartment/edit/:ID']]]], 'IconOtherApplication'],
  [46, '监控报警', '', [[341, '监控管理', '/finance/monitorManage/'], [343, '报警管理', '/finance/alarmManage/']], 'IconOtherAlarm'],
  [137, '指标管理', '', [[138, 'CostDriver', '/finance/indexManagement/CostDriver/']], 'IconVerticalRectTask'],
  [363, '业务分析', '', [[389, '成本穿透', '/finance/billTransparency'], [364, '抖音', '/finance_next/analysisDouyin']], 'IconDeliveryControl'],
]);

export const projectConfig: any = {
  User: { username: 'demo.user', nickname: 'Demo User', email: 'demo.user@bytedance.com', picture: '' },
  hiddenWMConfig: { data: {} }, notificationConfig: {}, FeatGrayMap: { CanVisibleI18n: false, CanSwitchRoles: false },
  permission: {}, menuRoles: {}, allMenus,
};
export const authInstance = { auth: (..._args: unknown[]) => false };
export const checkIsBoe = () => false;
export const isBoe = false;
export const checkIsProd = () => false;
export const checkIsPre = () => false;
export const checkLocalIsZH = () => true;
export const initTea = (..._args: unknown[]) => {};
export const appPerformance = { routerLoad: (..._args: unknown[]) => {} };
export const permissionExpiryCount = async () => 0;
export const IamService = { getUserAcls: async (..._args: unknown[]) => ({}) };
export const PermissionService = { ListSelectRoles: async (..._args: unknown[]) => [], SelectRole: async (..._args: unknown[]) => ({}) };
export enum TailorMenuCategoryEnum { SIDER = 1 }
const normalizeMenuPath = (path: string) => path.split('?')[0].replace(/\/$/, '');
const getMenuListByPathFrom = (menus: MenuNode[], pathname: string): MenuNode[] => {
  for (const menu of menus) {
    if (menu.ResourceUrl && normalizeMenuPath(menu.ResourceUrl) === normalizeMenuPath(pathname)) return [menu];
    const child = getMenuListByPathFrom(menu.Children, pathname);
    if (child.length) return [...child, menu];
  }
  return [];
};
const getMenuListByPath = (path: string) => getMenuListByPathFrom(allMenus, path).reverse();
export const usePages = (..._args: unknown[]) => ({ myMenus: allMenus, menus: allMenus, getMenuListByPath, checkHasTransferPaths: () => [] });

// References: modified from toutiao-fe-vcloud-finance/apps/web/src/app/toolkit/hooks/useMenuObservable.ts.
// Shared state is required so the sidebar and page gutter collapse together; unsubscribe each consumer on unmount.
const menuSubject = new BehaviorSubject<boolean>(localStorage.getItem('menuStatus') === 'collapse');
const setMenuCollapsed = (value: boolean) => { menuSubject.next(value); localStorage.setItem('menuStatus', value ? 'collapse' : 'spread'); };
const toggleMenu = () => setMenuCollapsed(!menuSubject.getValue());
export const useMenuObservable = (): [boolean, () => void, (value: boolean) => void] => {
  const [collapsed, setCollapsed] = React.useState(menuSubject.getValue());
  React.useEffect(() => { const subscription = menuSubject.subscribe(setCollapsed); return () => subscription.unsubscribe(); }, []);
  return [collapsed, toggleMenu, setMenuCollapsed];
};
export const useNoticeObservable = (): [number, () => void] => {
  const [status, setStatus] = React.useState(Date.now());
  return [status, () => setStatus(Date.now())];
};
export const useUnifiedApplyAuth = () => ({ open: () => {}, destroy: () => {} });
export const useNotification = () => {};
// References: modified from toutiao-fe-vcloud-finance/apps/web/src/app/toolkit/utils/icon.ts.
const menuIcons = { IconHome, IconMonitorMeasure, IconShoppingBag, IconDeliveryControl, IconCardTeam, IconDynamicControl, IconCardInfo, IconOtherApplication, IconOtherAlarm, IconVerticalRectTask, IconOtherResourceConfig };
export const RenderMenuIcon = (name: string) => {
  const component = menuIcons[name as keyof typeof menuIcons];
  return component ? React.createElement(component, { className: 'byte-menu-icon', useCurrentColor: true }) : null;
};
// References: modified from toutiao-fe-vcloud-finance/apps/web/src/app/frame-layout/components/Layout/Sider.tsx:127-164.
// Existing prototype routes stay local; unmaterialized destinations retain their live URL in a separate tab.
export const Link = ({ to, children, style, className }: { to: string; children?: React.ReactNode; style?: React.CSSProperties; className?: string; replace?: boolean; appRouter?: boolean }) => {
  const local = ['/finance/workspace', '/finance/sell/transparency'].includes(normalizeMenuPath(to));
  return <a href={local ? `#${to}` : new URL(to, 'https://babi.bytedance.net').href} target={local ? undefined : '_blank'} rel={local ? undefined : 'noopener noreferrer'} className={className} style={style}>{children}</a>;
};
export const PermissionRender = ({ children, otherwise }: { children?: React.ReactNode; otherwise?: React.ReactNode }) => <>{otherwise ?? children}</>;
export const NotificationDetailDrawer = (_props: any) => null;
export const PermissionApplyPage = () => null;
export const EmptyPage = () => null;
export const mobxReact = { observer: <T,>(component: T) => component };
export const icon = { newTitle };
export const updateAllMenus = async () => {};
export const updatePermission = async () => {};
export const updatePermissionAndMenus = async () => {};
