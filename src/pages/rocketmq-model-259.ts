import type { FormulaNode } from './PricingTab';
import { parseFormulaExpression, type FormulaExpressionItem } from './formula-expression';

// Formula definitions and dependency order extracted from the model detail's
// complete graphData on 2026-11-17. All displayed numeric values and units below
// are constructed examples, not measurement results.
export const rocketmqModelSource = {
  url: 'https://babi.bytedance.net/finance_next/modelSpace/modelDetail?model_id=259&version=1&record_type=history',
  modelId: 259,
  version: 1,
  root: '900210146',
  metricCount: 26,
  instanceCount: 48,
  levels: 6,
};

type ModelMetric = {
  id: string;
  title: string;
  measureType: number;
  formula: string;
  children: string[];
};

export const rocketmqMetrics: ModelMetric[] = [
  { id: '900210146', title: 'RocketMQ_计费项_纯资源_单价', measureType: 3, formula: 'RocketMQ_综合_单位成本*(1.0+RocketMQ_基础架构_策略_加成_比例)', children: ['886531010', '898010242'] },
  { id: '886531010', title: 'RocketMQ_综合_单位成本', measureType: 3, formula: 'RocketMQ_惩罚写_折扣_系数*RocketMQ_计算资源_单位成本+RocketMQ_生产流量_分摊_存储资源_单位成本*RocketMQ_生产流量_分摊_存储资源_副本数+RocketMQ_消费流量_分摊_存储资源_单位成本*RocketMQ_消费流量_分摊_存储资源_副本数', children: ['883334530', '898010306', '883333890', '897734946', '883334082', '886531266'] },
  { id: '883334530', title: 'RocketMQ_惩罚写_折扣_系数', measureType: 0, formula: '', children: [] },
  { id: '898010306', title: 'RocketMQ_计算资源_单位成本', measureType: 3, formula: 'RocketMQ_计算资源_成本/RocketMQ_计算资源_售卖量', children: ['883333762', '883333826'] },
  { id: '883333762', title: 'RocketMQ_计算资源_成本', measureType: 1, formula: 'RocketMQ_总_资源_成本*(1.0-RocketMQ_存储_分摊_系数)', children: ['898010370', '883334146'] },
  { id: '898010370', title: 'RocketMQ_总_资源_成本', measureType: 1, formula: '', children: [] },
  { id: '883334146', title: 'RocketMQ_存储_分摊_系数', measureType: 0, formula: '', children: [] },
  { id: '883333826', title: 'RocketMQ_计算资源_售卖量', measureType: 2, formula: 'sum((RocketMQ_普通生产流量_售卖量+RocketMQ_defer_售卖量+RocketMQ_普通消费流量_售卖量+RocketMQ_惩罚读_售卖量+RocketMQ_广播流量_售卖量)*RocketMQ_惩罚写_折扣_系数+RocketMQ_惩罚写_折扣_售卖量)', children: ['883334210', '883334274', '883334338', '897735010', '1021581762', '883334530', '883334466'] },
  { id: '883334210', title: 'RocketMQ_普通生产流量_售卖量', measureType: 2, formula: '', children: [] },
  { id: '883334274', title: 'RocketMQ_defer_售卖量', measureType: 2, formula: '', children: [] },
  { id: '883334338', title: 'RocketMQ_普通消费流量_售卖量', measureType: 2, formula: '', children: [] },
  { id: '897735010', title: 'RocketMQ_惩罚读_售卖量', measureType: 2, formula: '', children: [] },
  { id: '1021581762', title: 'RocketMQ_广播流量_售卖量', measureType: 2, formula: '', children: [] },
  { id: '883334466', title: 'RocketMQ_惩罚写_折扣_售卖量', measureType: 2, formula: 'RocketMQ_惩罚写_售卖量*RocketMQ_惩罚写_折扣_系数', children: ['883334402', '883334530'] },
  { id: '883334402', title: 'RocketMQ_惩罚写_售卖量', measureType: 2, formula: '', children: [] },
  { id: '883333890', title: 'RocketMQ_生产流量_分摊_存储资源_单位成本', measureType: 3, formula: 'RocketMQ_生产流量_分摊_存储资源_成本/RocketMQ_生产流量_售卖量', children: ['883333954', '883334018'] },
  { id: '883333954', title: 'RocketMQ_生产流量_分摊_存储资源_成本', measureType: 1, formula: 'RocketMQ_存储资源_成本*(1.0-RocketMQ_消费_分摊_系数)', children: ['886531138', '886531202'] },
  { id: '886531138', title: 'RocketMQ_存储资源_成本', measureType: 1, formula: 'RocketMQ_总_资源_成本*RocketMQ_存储_分摊_系数', children: ['898010370', '883334146'] },
  { id: '886531202', title: 'RocketMQ_消费_分摊_系数', measureType: 0, formula: '', children: [] },
  { id: '883334018', title: 'RocketMQ_生产流量_售卖量', measureType: 2, formula: 'sum((RocketMQ_普通生产流量_售卖量+RocketMQ_defer_售卖量+RocketMQ_普通消费流量_售卖量+RocketMQ_惩罚读_售卖量+RocketMQ_惩罚写_售卖量+RocketMQ_广播流量_售卖量)*RocketMQ_生产流量_分摊_存储资源_副本数)', children: ['883334210', '883334274', '883334338', '897735010', '883334402', '1021581762', '897734946'] },
  { id: '897734946', title: 'RocketMQ_生产流量_分摊_存储资源_副本数', measureType: 0, formula: '', children: [] },
  { id: '883334082', title: 'RocketMQ_消费流量_分摊_存储资源_单位成本', measureType: 3, formula: 'RocketMQ_消费流量_分摊_存储资源_成本/RocketMQ_消费流量_售卖量', children: ['900210210', '886531074'] },
  { id: '900210210', title: 'RocketMQ_消费流量_分摊_存储资源_成本', measureType: 1, formula: 'RocketMQ_存储资源_成本*RocketMQ_消费_分摊_系数', children: ['886531138', '886531202'] },
  { id: '886531074', title: 'RocketMQ_消费流量_售卖量', measureType: 2, formula: 'sum((RocketMQ_普通生产流量_售卖量+RocketMQ_defer_售卖量+RocketMQ_普通消费流量_售卖量+RocketMQ_惩罚读_售卖量+RocketMQ_惩罚写_售卖量+RocketMQ_广播流量_售卖量)*RocketMQ_消费流量_分摊_存储资源_副本数)', children: ['883334210', '883334274', '883334338', '897735010', '883334402', '1021581762', '886531266'] },
  { id: '886531266', title: 'RocketMQ_消费流量_分摊_存储资源_副本数', measureType: 0, formula: '', children: [] },
  { id: '898010242', title: 'RocketMQ_基础架构_策略_加成_比例', measureType: 0, formula: '', children: [] },
];

const metricsById = new Map(rocketmqMetrics.map(metric => [metric.id, metric]));
const sampleLeaves: Record<string, number> = {
  '883334530': .75,
  '898010370': 12000000,
  '883334146': .6666666667,
  '883334210': 120000000,
  '883334274': 30000000,
  '883334338': 100000000,
  '897735010': 15000000,
  '1021581762': 20000000,
  '883334402': 5000000,
  '886531202': .5,
  '897734946': 3,
  '886531266': 2,
  '898010242': .03,
};

// Evaluate only parsed model arithmetic: no dynamic JavaScript evaluation.
function evaluate(items: FormulaExpressionItem<FormulaNode>[]): number {
  let total = 0, term = 0;
  let additiveSign = 1;
  let operation: 'add' | 'subtract' | 'multiply' | 'divide' = 'add';
  for (const item of items) {
    if (item.type === 'operator') { operation = item.operator; continue; }
    const value = item.type === 'metric' ? item.node.value!
      : item.type === 'constant' ? Number(item.value)
      : evaluate(item.items);
    if (!Number.isFinite(value)) throw new Error('模型示例包含无法计算的表达式');
    if (operation === 'multiply') term *= value;
    else if (operation === 'divide') term /= value;
    else {
      total += additiveSign * term;
      term = value;
      additiveSign = operation === 'subtract' ? -1 : 1;
    }
  }
  return total + additiveSign * term;
}

export function buildRocketMQTree(): FormulaNode {
  const build = (id: string, parentPath = ''): FormulaNode => {
    const metric = metricsById.get(id);
    if (!metric) throw new Error(`缺少模型指标 ${id}`);
    const path = parentPath ? `${parentPath},${id}_1` : `${id}_1`;
    const children = metric.children.map(child => build(child, path));
    const isRatio = metric.measureType === 0 && !metric.title.endsWith('副本数');
    const type = isRatio ? 'ratio' : metric.measureType === 3 ? 'price' : metric.measureType === 1 ? 'amount' : 'quantity';
    const node: FormulaNode = {
      id: path,
      title: metric.title,
      formula: metric.formula || '-',
      type,
      unit: isRatio ? '' : type === 'price' ? '元 / GB（示例）' : type === 'amount' ? '元' : metric.title.endsWith('副本数') ? '份' : 'GB（示例）',
      value: children.length ? 0 : sampleLeaves[id],
      ...(children.length ? { children } : {}),
    };
    if (children.length) node.value = evaluate(parseFormulaExpression(node));
    if (!Number.isFinite(node.value)) throw new Error(`指标 ${id} 示例值无效`);
    const seed = Number(id) % 13;
    node.targets = {
      month: node.value! * (.92 + seed * .013),
      quarter: node.value! * (.95 + ((seed + 4) % 13) * .012),
      annual: node.value! * (.94 + ((seed + 8) % 13) * .012),
    };
    return node;
  };
  return build(rocketmqModelSource.root);
}

export function flattenRocketMQTree(node: FormulaNode): FormulaNode[] {
  return [node, ...(node.children || []).flatMap(flattenRocketMQTree)];
}
