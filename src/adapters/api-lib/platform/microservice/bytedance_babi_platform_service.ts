import type { AnnouncementDetail } from './announcement';
import type { AlarmRecordAgg } from './monitor';
import type { BusinessActivityDTO, RecentlyViewedDTO, SubcribeObjectDTO, TodoItem } from './dashboard';
import type { ListEntityHealthItem } from './entity_health';

const now = Date.now();

export const platformServiceClient = {
  async GetRecentlyViewed(..._args: unknown[]): Promise<{ data: RecentlyViewedDTO[] }> {
    return { data: [
      { route: '/finance/sell/analysis', url: '/finance/sell/analysis/' },
      { route: '/finance/product/myProduct', url: '/finance/product/myProduct/' },
      { route: '/finance/flow/list/', url: '/finance/flow/list/' },
    ] };
  },
  async GetSubscribeCnt(..._args: unknown[]): Promise<{ data: SubcribeObjectDTO[] }> {
    return { data: [{ entity_type: 'product', obj_cnt: 8, event_cnt: 16 }] };
  },
  async ListBusinessActivity(..._args: unknown[]): Promise<{ data: BusinessActivityDTO[] }> {
    return { data: [
      { title: '9月商品价格调整', type: 'monthly_price_adjustment', begin_time: now - 86400000, end_time: now + 5 * 86400000, need_process: true, extra: JSON.stringify({ activity_id: 'act_001' }), desc: '请关注价格调整活动。' },
      { title: '月结账单调整', type: 'monthly_bill_adjustment', begin_time: now - 2 * 86400000, end_time: now + 3 * 86400000, need_process: true, extra: JSON.stringify({ income_status: '1' }), desc: '请处理待确认账单。' },
    ] };
  },
  async GetTodo(..._args: unknown[]): Promise<{ data: { todos: TodoItem[] } }> {
    return { data: { todos: [{ type: 'approval', value: 3 }, { type: 'product_discount', value: 2 }] } };
  },
  async ListAnnouncementForUser(..._args: unknown[]): Promise<{ data: { announcements: AnnouncementDetail[] } }> {
    return { data: { announcements: [
      { id: 1, label: 'system', title: 'BABI 财务平台月度结算提醒', read_status: false, start_time: now - 86400000 },
      { id: 2, label: 'product', title: '商品配置规则更新公告', read_status: true, start_time: now - 3 * 86400000 },
      { id: 3, label: 'billing', title: '账单确认窗口期说明', read_status: true, start_time: now - 5 * 86400000 },
    ] } };
  },
  async ListAlarmRecordAgg(..._args: unknown[]): Promise<{ data: AlarmRecordAgg[] }> {
    return { data: [
      { entity_type: 'product', alarm_record_agg_count: 4, start_bill_time: '2026-08', end_bill_time: '2026-09' },
      { entity_type: 'app', alarm_record_agg_count: 1, start_bill_time: '2026-08', end_bill_time: '2026-09' },
      { entity_type: 'servicetree', alarm_record_agg_count: 0, start_bill_time: '2026-08', end_bill_time: '2026-09' },
    ] };
  },
  async ListForEntityHealth(..._args: unknown[]): Promise<{ data: ListEntityHealthItem[] }> {
    return { data: [
      { entity_id: '1001', entity_name: '云基础商品', problem_count: 3, site_id: 'babi' },
      { entity_id: '1002', entity_name: '数据中台商品', problem_count: 1, site_id: 'babi' },
    ] };
  },
  async SetRecentlyViewed(..._args: unknown[]) { return {}; },
  async HavingNotReadAnnouncement(..._args: unknown[]): Promise<{ data: boolean }> { return { data: true }; },
};
