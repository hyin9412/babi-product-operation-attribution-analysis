import type { FormulaNode } from './PricingTab';

// Statuses are illustrative and only attached to the playground's preview trees.
export function withPlaygroundStatuses(tree: FormulaNode): FormulaNode {
  const statuses: NonNullable<FormulaNode['status']>[] = [
    { type: 'success', label: '正常', description: '示例状态：指标数据正常' },
    { type: 'warning', label: '预警', description: '示例状态：指标偏差达到预警阈值' },
    { type: 'error', label: '异常', description: '示例状态：指标数据需要检查' },
  ];
  let index = 0;
  const visit = (node: FormulaNode): FormulaNode => ({
    ...node, status: statuses[index++ % statuses.length], children: node.children?.map(visit),
  });
  return visit(tree);
}

// Deliberate mock data for comparing node styles, not a production pricing model.
export function buildTopologyStyleShowcase(): FormulaNode {
  const metric = (id: string, title: string, value: number, index: number, type: FormulaNode['type'] = 'price', formula = '-'): FormulaNode => ({
    id, title, value, type, formula,
    unit: type === 'ratio' ? '' : '元 / 核·日',
    targets: {
      month: value * (index % 2 ? .96 : 1.04),
      quarter: value * (index % 2 ? 1.03 : .97),
      annual: value * 1.02,
    },
  });
  const base = metric('showcase-base', '基础单位成本', .006, 0, 'price', '= 基础资源成本 / 资源容量');
  const surcharge = metric('showcase-surcharge', '附加单位成本', .012, 1, 'price', '= 附加资源成本 / 附加资源容量');
  const cpu = metric('showcase-cpu', 'CPU单位成本', .018, 2, 'price', '= CPU资源成本 / CPU容量');
  const memory = metric('showcase-memory', '内存单位成本', .006, 3, 'price', '= 内存资源成本 / 内存容量');
  const strategy = metric('showcase-strategy', '策略加成', .03, 4, 'ratio', '= 3%');
  // Give each showcased card a real drill-down, including cards inside functions/brackets.
  const addBreakdown = (node: FormulaNode, numerator: string, denominator: string, divisor: number) => {
    const cost = { ...metric(`${node.id}-cost`, numerator, node.value! * divisor, 0, 'amount', '取自示例成本快照'), unit: '元' };
    const capacity = { ...metric(`${node.id}-capacity`, denominator, divisor, 1, node.type === 'ratio' ? 'amount' : 'quantity', '取自示例资源快照'), unit: node.type === 'ratio' ? '元' : '核·日' };
    node.children = [cost, capacity];
    node.formula = `= ${numerator} / ${denominator}`;
    node.operator = 'divide';
  };
  addBreakdown(base, '基础资源成本', '资源容量', 1000);
  addBreakdown(surcharge, '附加资源成本', '附加资源容量', 1000);
  addBreakdown(cpu, 'CPU资源成本', 'CPU容量', 1000);
  addBreakdown(memory, '内存资源成本', '内存容量', 1000);
  addBreakdown(strategy, '策略加成金额', '计费基数', 1000);
  const formulaValue = (cpu.value! + memory.value!) * (1 + strategy.value!);
  return {
    ...metric('showcase-root', '计算资源 · 测算单价', base.value! + surcharge.value! + formulaValue, 5),
    formula: '= 基础单位成本 + MAX(附加单位成本) + SUM((CPU单位成本 + 内存单位成本) × (1 + 策略加成))',
    children: [base, surcharge, cpu, memory, strategy],
  };
}

export function buildTopologyAlignmentShowcase(): FormulaNode {
  const tree = buildTopologyStyleShowcase();
  const [base, surcharge] = tree.children!;
  // Expanding these siblings mixes a double group, a single group and
  // ordinary metric rows, including a deepest group without an operator.
  base.formula = '= SUM((基础资源成本) + 资源容量)';
  surcharge.formula = '= MAX(附加资源成本) + 附加资源容量';
  return {
    ...tree, id: 'alignment-root',
    formula: '= 基础单位成本 + MAX(附加单位成本) + SUM((CPU单位成本 + 内存单位成本) × 策略加成 + 1)',
  };
}
