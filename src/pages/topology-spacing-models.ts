import type { FormulaNode } from './PricingTab';

export const spacingScenarios = [
  { value: 'ordinary', label: '普通指标与运算符', note: '查看运算符两侧的16px，以及两个指标之间包含运算符占位的64px。' },
  { value: 'function', label: '单指标函数', note: '查看函数外框、白色包裹层与内部指标，以及同行指标的顶对齐。' },
  { value: 'bracket', label: '常量与括号表达式', note: '查看常量、运算符、指标居中，以及括号外框与白色层的留白。' },
  { value: 'nested', label: '双层嵌套公式', note: '同行指标和运算符对齐到最里层；容器外框的顶边高度可以不同。' },
  { value: 'siblings', label: '相邻兄弟子树展开', note: '单位成本与综合售卖率各自展开。虚线包围完整子树，标注两者边界之间的80px间距。' },
  { value: 'unequal', label: '不同宽度子树展开', note: '一侧包含更深展开，另一侧保持简单公式；同时查看上层卡片间距和完整子树间距。' },
];

export function spacingModel(scenario: string): FormulaNode {
  const node = (id: string, title: string, formula = '原始指标', children?: FormulaNode[]): FormulaNode => ({
    id, title, formula, children, value: .0338448634, type: 'price', unit: 'USD / 核·日',
    targets: { month: .0330325867, quarter: .032, annual: .035 },
  });
  const cost = node('cost', '资源成本');
  const capacity = node('capacity', '物理容量');
  const sold = node('sold', '售卖量');
  const available = node('available', '售卖容量');
  const unit = node('unit', '单位成本', '= 资源成本 / 物理容量', [cost, capacity]);
  const rate = node('rate', '综合售卖率', '= 售卖量 / 售卖容量', [sold, available]);
  if (scenario === 'function') return node('root', '测算单价', '= 单位成本 + MAX(综合售卖率)', [unit, rate]);
  if (scenario === 'bracket') return node('root', '测算单价', '= 单位成本 / (1 + 综合售卖率)', [unit, rate]);
  if (scenario === 'nested') return node('root', '测算单价', '= 单位成本 + SUM((资源成本 + 物理容量) × 综合售卖率)', [unit, cost, capacity, rate]);
  if (scenario === 'unequal') {
    cost.formula = '= 物理成本 × 分摊比例';
    cost.children = [node('physical', '物理成本'), node('allocation', '分摊比例')];
  }
  return node('root', '测算单价', '= 单位成本 / 综合售卖率', [unit, rate]);
}

export function spacingExpanded(tree: FormulaNode, scenario: string) {
  const ids = new Set([tree.id]);
  if (scenario === 'siblings' || scenario === 'unequal') {
    const visit = (node: FormulaNode) => {
      if (node.children?.length) ids.add(node.id);
      node.children?.forEach(visit);
    };
    visit(tree);
  }
  return ids;
}
