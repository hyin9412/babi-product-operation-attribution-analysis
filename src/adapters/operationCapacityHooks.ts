export interface IOperationDetailQuery { entityId?: string }
export interface IProductHealthMetricDetail {
  metric_code?: string;
  metric_attr?: Record<string, { date?: string; dimension?: string; value?: string }[]>;
  check_period?: string;
  is_pass?: boolean;
}
export interface IProductHealthDimension {
  metric_group?: number;
  is_pass?: boolean;
  problem_count?: number;
  group_detail?: IProductHealthMetricDetail[];
}

export const useOperationDetailData = (..._args: unknown[]) => ({
  loading: false,
  detailValue: {
    data: [
      {
        metric_group: 1,
        is_pass: false,
        problem_count: 2,
        group_detail: [
          { metric_code: 'product_doc_normal_flag', is_pass: false, metric_attr: {}, check_period: '20260901' },
          { metric_code: 'monitor_alarm_normal_flag', is_pass: false, metric_attr: {}, check_period: '20260901' },
        ],
      },
      {
        metric_group: 2,
        is_pass: true,
        problem_count: 0,
        group_detail: [{ metric_code: 'push_t1_ready_flag_lm', is_pass: true, metric_attr: {}, check_period: '20260901' }],
      },
      {
        metric_group: 3,
        is_pass: false,
        problem_count: 1,
        group_detail: [{ metric_code: 'cost_income_flag', is_pass: false, metric_attr: {}, check_period: '20260901' }],
      },
    ] as IProductHealthDimension[],
  },
});
