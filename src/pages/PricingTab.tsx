// References: none — PRD cost-pricing behavior retained; standard Pagination and Alert follow project design rules.
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Drawer, Pagination, Select, Table, Tooltip } from '@byted-babi/babi-design';
import { AnalysisFilters, AnalysisProps, AnalysisRow, BYTEGRAPH, TOS, amount, areaNames, getRows, monthList, percent, priceFormat, quantityFormat, snapshot } from './analysisData';
import { AnalysisChart, ChartValue, EmptyState, ExactValue, Field, Fold, Note, Section, SELECT_SEARCH_THRESHOLD, getSelectPlaceholder } from './analysisUI';
import CostAnalysis from './CostAnalysis';
import './pricing.css';

type Order = 'ascend' | 'descend';
type SortState = { key: string; order: Order };
const unique = (items: string[]) => Array.from(new Set(items));
const missingTarget = <Tooltip content="目标表中没有状态为“有效”的目标版本"><span className="muted-value">—</span></Tooltip>;
const nullValue = (a: unknown) => a === null || a === undefined || (typeof a === 'number' && !Number.isFinite(a));
function sortRows<T extends Record<string, any>>(rows: T[], state: SortState, absolute = true): T[] {
  return [...rows].sort((a, b) => {
    const av = a[state.key], bv = b[state.key];
    if (nullValue(av) && !nullValue(bv)) return 1;
    if (!nullValue(av) && nullValue(bv)) return -1;
    if (nullValue(av) && nullValue(bv)) return String(a.unit || '').localeCompare(String(b.unit || '')) || String(a.region || '').localeCompare(String(b.region || ''));
    const comparison = typeof av === 'number' && typeof bv === 'number' ? (absolute ? Math.abs(av) - Math.abs(bv) : av - bv) : String(av).localeCompare(String(bv));
    return (state.order === 'descend' ? -comparison : comparison) || String(a.unit || '').localeCompare(String(b.unit || '')) || String(a.region || '').localeCompare(String(b.region || ''));
  });
}
function sortColumn(key: string, state: SortState) { return { sorter: true, sortOrder: state.key === key ? state.order : undefined, sortDirections: ['descend', 'ascend'] }; }
function stateFromSorter(sorter: any, fallback: SortState): SortState { const item = Array.isArray(sorter) ? sorter[0] : sorter; return item?.field && item?.direction ? { key: String(item.field), order: item.direction } : fallback; }
const currencyUnit = (row: AnalysisRow) => `CNY / ${row.unitLabel}`;
const combination = (row: AnalysisRow) => `${row.unit} / ${row.area} / ${row.region}`;
// PRD unit conversion applies only to TOS Storage/StorageEC in cn-north-3.
const normalizedPrice = (row: AnalysisRow) => row.price !== null && row.product === TOS && ['Storage', 'StorageEC'].includes(row.unit) && row.region === 'cn-north-3' ? row.price * 1.073741824 : row.price;

interface PriceRow extends AnalysisRow { monthTarget: null; monthDeviation: null; quarterTarget: null; quarterDeviation: null; annualTarget: null; annualDeviation: null; }
function priceTrends(filters: AnalysisFilters, key: 'price' | 'cumulativePrice' | 'quantity'): ChartValue[] {
  return monthList(filters.month).flatMap(month => getRows(filters, month).map(row => ({ x: month.slice(5) + '月', series: combination(row), value: key === 'price' ? normalizedPrice(row) : row[key] })));
}
// References: none — target records are not effective; target and deviation series preserve missing values.
function unavailableTrend(filters: AnalysisFilters, series: string[]): ChartValue[] {
  return monthList(filters.month).flatMap(month => series.map(name => ({ x: month.slice(5) + '月', series: name, value: null })));
}

interface FormulaNode { id: string; title: string; formula: string; value: number | null; type: 'price' | 'amount' | 'ratio' | 'quantity'; unit: string; children?: FormulaNode[]; }
// The CPU relationships and coefficients are screenshot examples. All changing scale values
// derive from the shared snapshot; this is not a confirmed live model or real pricing result.
function cpuTree(row: AnalysisRow): FormulaNode {
  const cost = row.cost, capacity = row.capacity;
  const unitCost = cost !== null && capacity ? cost / capacity : null;
  const saleRate = capacity ? row.quantity / capacity : null;
  const physicalCost = cost === null ? null : cost / .3912;
  const storageCost = snapshot.find(item => item.product === BYTEGRAPH && item.unit === 'bytegraph.storage' && item.month === row.month && item.area === row.area && item.region === row.region)?.cost ?? null;
  const otherDenominator = physicalCost === null || storageCost === null ? null : physicalCost + storageCost;
  const otherCost = otherDenominator === null ? null : otherDenominator * .0708;
  const root = unitCost !== null && saleRate ? unitCost / saleRate * (1 + .0708) * (1 + .03) : null;
  const physicalNode: FormulaNode = { id: 'physical', title: 'bytegraph_计算层资源_物理_成本', formula: '原始取数指标，无计算公式；取自原型成本快照推导', value: physicalCost, type: 'amount', unit: 'CNY' };
  const normNode: FormulaNode = { id: 'normalization', title: 'bytegraph_CPU_MEM_归一化_成本_占比', formula: '文档截图示例系数，不作为有效线上版本', value: .3912, type: 'ratio', unit: '%' };
  const capacityNode: FormulaNode = { id: 'capacity', title: 'bytegraph_计算层资源_物理_容量', formula: '原始取数指标，无计算公式；取自原型物理容量快照', value: capacity, type: 'quantity', unit: '核·日' };
  const totalCostNode: FormulaNode = { id: 'totalCost', title: 'bytegraph_计算层资源_总成本', formula: '= bytegraph_计算层资源_物理_成本 × bytegraph_CPU_MEM_归一化_成本_占比', value: cost, type: 'amount', unit: 'CNY', children: [physicalNode, normNode] };
  return { id: 'root', title: 'bytegraph_计算层资源计费项_纯资源_单价', formula: '= 单位成本 / 综合售卖率 ×（1 + 其他成本加成比例）×（1 + 策略加成比例）', value: root, type: 'price', unit: 'CNY / 核·日', children: [
    { id: 'unitCost', title: 'bytegraph_计算层资源_单位成本', formula: '= bytegraph_计算层资源_总成本 / bytegraph_计算层资源_物理_容量', value: unitCost, type: 'price', unit: 'CNY / 核·日', children: [totalCostNode, capacityNode] },
    { id: 'saleRate', title: 'bytegraph_计算层资源_综合_售卖率', formula: '= bytegraph_计算层资源_售卖量 / bytegraph_计算层资源_物理_容量', value: saleRate, type: 'ratio', unit: '%', children: [{ id: 'quantity', title: 'bytegraph_计算层资源_售卖量', formula: '原始取数指标，无计算公式；取自原型售卖量快照', value: row.quantity, type: 'quantity', unit: '核·日' }, { ...capacityNode, id: 'saleCapacity' }] },
    { id: 'otherRatio', title: 'bytegraph_其他成本_加成_比例', formula: '= 其他成本商品成本 /（计算层资源物理成本 + 存储资源总成本）；截图示例系数', value: .0708, type: 'ratio', unit: '%', children: [{ id: 'otherCost', title: 'bytegraph_其他成本商品_成本', formula: '文档截图关系及原型快照示意，不作为实际归因金额', value: otherCost, type: 'amount', unit: 'CNY' }, { id: 'otherDenominator', title: '计算层资源物理成本 + 存储资源总成本', formula: '= 计算层资源物理成本 + 存储资源总成本', value: otherDenominator, type: 'amount', unit: 'CNY', children: [{ ...physicalNode, id: 'otherPhysical' }, { id: 'storageCost', title: 'bytegraph_存储资源_总成本', formula: '取自同账期、同大区、同区域原型存储成本快照', value: storageCost, type: 'amount', unit: 'CNY' }] }] },
    { id: 'strategy', title: 'bytegraph_计算层资源_策略_加成_比例', formula: '文档截图示例系数；尚无有效目标或已核验线上版本', value: .03, type: 'ratio', unit: '%' },
  ] };
}
// References: none — PRD attachment establishes the TOS request relationship, not a verified model or coefficients.
function tosTree(unit: string): FormulaNode {
  if (unit === 'Request') return { id: 'root', title: 'tos_Request_纯资源_单价', formula: '= 请求成本 / 请求次数 ×（1 + 策略加成比例）；请求次数与万次单位换算、模型版本尚未核验', value: null, type: 'price', unit: 'CNY / 万次', children: [
    { id: 'requestCost', title: 'TOS 请求成本', formula: '计费单元 × 大区口径；已核验模型指标未接入，不用成本商品示意值替代', value: null, type: 'amount', unit: 'CNY' },
    { id: 'requestCount', title: 'TOS 请求次数', formula: '已核验模型指标未接入；请求次数与万次单位待核验', value: null, type: 'quantity', unit: '次' },
    { id: 'strategy', title: 'TOS 策略加成比例', formula: '策略加成未接入，不使用 ByteGraph 示例系数', value: null, type: 'ratio', unit: '%' },
  ] };
  return { id: 'root', title: `tos_${unit}_纯资源_单价`, formula: '存储单价由各存储渠道单价与售卖份额加权后叠加策略加成；完整运算关系、权重与模型版本尚未核验', value: null, type: 'price', unit: 'CNY / 存储计费单位' };
}
function flattenTree(node: FormulaNode): FormulaNode[] { return [node, ...(node.children || []).flatMap(flattenTree)]; }
function formatNode(node: FormulaNode): string { return node.type === 'ratio' ? percent(node.value === null ? null : node.value * 100) : node.type === 'amount' ? amount(node.value) : node.type === 'price' ? priceFormat(node.value) : quantityFormat(node.value); }
function FormulaCard({ node, expanded, toggle, onTrend, targets, root = false }: { node: FormulaNode; expanded: Set<string>; toggle: (id: string) => void; onTrend: (id: string) => void; targets: string[]; root?: boolean }) {
  return <div className={`formula-card ${root ? 'root' : ''}`} aria-label={node.title}>
    <div className="formula-actions">{node.children && <Button size="mini" onClick={() => toggle(node.id)}>{expanded.has(node.id) ? '收起' : '展开公式'}</Button>}<Button size="mini" onClick={() => onTrend(node.id)}>月趋势</Button></div>
    <p>{node.formula}</p>
    <div className="formula-value numeric"><span className="pricing-unit-pill">{node.unit}</span> {formatNode(node)}</div>
    {targets.length > 0 && <div className={`formula-target ${targets.includes('季度目标值') ? 'formula-target-quarter' : ''}`}>
      {targets.includes('月度目标值') && <div>月度目标<strong>—</strong><span>月度偏差 —</span><br/><span>未提供目标值</span></div>}
      {targets.includes('季度目标值') && <div>季度目标<strong>—</strong><span>季度偏差 —</span><br/><span>未提供有效季度目标</span></div>}
      {targets.includes('年度目标值') && <div>年度目标<strong>—</strong><span>年度偏差 —</span><br/><span>目标版本未生效</span></div>}
    </div>}
    <div className="pricing-node-version">模型展示 V2 · 截图示例</div>
  </div>;
}
function FormulaBranch({ node, level, expanded, toggle, onTrend, targets }: { node: FormulaNode; level: number; expanded: Set<string>; toggle: (id: string) => void; onTrend: (id: string) => void; targets: string[] }) {
  if (!node.children || !expanded.has(node.id)) return null;
  return <div className="pricing-formula-branch"><div className="formula-level-label">{level}级拆解：{node.title}</div><div className="formula-row">{node.children.map(child => <FormulaCard key={child.id} node={child} expanded={expanded} toggle={toggle} onTrend={onTrend} targets={targets}/>)}</div>{node.children.map(child => <FormulaBranch key={child.id} node={child} level={level + 1} expanded={expanded} toggle={toggle} onTrend={onTrend} targets={targets}/>)}</div>;
}

export default function PricingTab({ filters }: AnalysisProps) {
  const isTos = filters.product === TOS;
  const supported = filters.product === BYTEGRAPH || isTos;
  const rows = useMemo(() => getRows(filters), [filters]);
  const filterKey = JSON.stringify(filters);
  const [priceSort, setPriceSort] = useState<SortState>({ key: 'monthDeviation', order: 'descend' });
  const [page, setPage] = useState(1), [pageSize, setPageSize] = useState(10);
  const [formulaUnit, setFormulaUnit] = useState('');
  const [formulaArea, setFormulaArea] = useState('');
  const [formulaRegion, setFormulaRegion] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [metric, setMetric] = useState('root');
  const [metricSort, setMetricSort] = useState<SortState>({ key: 'deviation', order: 'descend' });
  const [evidence, setEvidence] = useState(false);
  const [timeGrain, setTimeGrain] = useState<'month' | 'day'>('month');
  const [aggregation, setAggregation] = useState<'total' | 'dailyAverage'>('total');
  const monthlyTargets = filters.targets.includes('月度目标值');
  const quarterlyTargets = filters.targets.includes('季度目标值');
  const annualTargets = filters.targets.includes('年度目标值');
  const availableUnits = unique(rows.map(row => row.unit));
  const activeUnit = availableUnits.includes(formulaUnit) ? formulaUnit : availableUnits[0] || '';
  const availableAreas = unique(rows.filter(row => row.unit === activeUnit).map(row => row.area));
  const activeArea = availableAreas.includes(formulaArea) ? formulaArea : availableAreas[0] || '';
  const availableRegions = unique(rows.filter(row => row.unit === activeUnit && row.area === activeArea).map(row => row.region));
  const activeRegion = availableRegions.includes(formulaRegion) ? formulaRegion : availableRegions[0] || '';
  const formulaRow = rows.find(row => row.unit === activeUnit && row.area === activeArea && row.region === activeRegion);
  const tree = formulaRow ? isTos ? tosTree(activeUnit) : filters.product === BYTEGRAPH && activeUnit === 'bytegraph.cpu' ? cpuTree(formulaRow) : null : null;
  const nodes = tree ? flattenTree(tree) : [];
  const selectedNode = nodes.find(node => node.id === metric) || nodes[0];
  const monthlyFormulaRows = monthList(filters.month).flatMap(month => {
    const row = getRows(filters, month).find(item => item.unit === activeUnit && item.area === activeArea && (isTos || item.region === activeRegion));
    if (!row || (!isTos && activeUnit !== 'bytegraph.cpu')) return [];
    const monthTree = isTos ? tosTree(activeUnit) : cpuTree(row);
    const node = flattenTree(monthTree).find(item => item.id === metric) || monthTree;
    return [{ id: `${row.id}-${metric}`, month, unit: row.unit, area: row.area, region: isTos ? '' : row.region, unitLabel: node.unit, actual: node.value === null ? null : node.type === 'ratio' ? node.value * 100 : node.value, target: null, deviation: null, quarterTarget: null, quarterDeviation: null, annualActual: null, annualTarget: null, annualDeviation: null }];
  });
  const metricSeries = ['实际值', ...(monthlyTargets ? ['月度目标'] : []), ...(quarterlyTargets ? ['季度目标'] : []), ...(annualTargets ? ['年度目标'] : [])];
  const metricTrendValues: ChartValue[] = monthlyFormulaRows.flatMap(row => metricSeries.map(series => ({ x: row.month.slice(5) + '月', series, value: series === '实际值' ? row.actual : null })));
  const metricUnavailable = timeGrain === 'day' || aggregation === 'dailyAverage';
  const metricUnavailableText = timeGrain === 'day' ? '按天粒度暂未接入，暂无可展示的日趋势与明细；请切换“按月”查看。' : '月日均聚合口径暂未接入：分母、支持指标及单位换算尚未核验，不将单价、比率或数量统一除以自然日。请切换“月总计”查看。';
  useEffect(() => { setPage(1); setPriceSort({ key: 'monthDeviation', order: 'descend' }); setExpanded(new Set()); setMetric('root'); setTimeGrain('month'); setAggregation('total'); }, [filterKey]);
  useEffect(() => { setExpanded(new Set()); setMetric('root'); setMetricSort({ key: 'deviation', order: 'descend' }); }, [activeUnit, activeArea, activeRegion]);
  useEffect(() => { setMetricSort({ key: 'deviation', order: 'descend' }); }, [metric]);
  const toggle = (id: string) => setExpanded(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const showTrend = (id: string) => { setMetric(id); setTimeout(() => document.getElementById('pricing-metric-trend')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80); };
  const priceRows: PriceRow[] = rows.map(row => ({ ...row, price: normalizedPrice(row), monthTarget: null, monthDeviation: null, quarterTarget: null, quarterDeviation: null, annualTarget: null, annualDeviation: null }));
  const sortedPrices = sortRows(priceRows, priceSort);
  const pagePrices = sortedPrices.slice((page - 1) * pageSize, page * pageSize);
  const priceColumns: any[] = [
    { title: '账期月份', dataIndex: 'month', width: 120, fixed: 'left', ...sortColumn('month', priceSort) },
    { title: '计费单元', dataIndex: 'unit', width: 170, fixed: 'left' },
    { title: '大区', dataIndex: 'area', width: 80, fixed: 'left', render: (value: string) => <Tooltip content={areaNames[value]}>{value}</Tooltip> },
    { title: '售卖区域', dataIndex: 'region', width: 160, fixed: 'left' },
    { title: '售卖量', dataIndex: 'quantity', width: 140, ...sortColumn('quantity', priceSort), render: (value: number) => <ExactValue value={value}>{quantityFormat(value)}</ExactValue> },
    { title: '售卖量单位', dataIndex: 'unitLabel', width: 115 },
    { title: '月度测算单价', dataIndex: 'price', width: 165, ...sortColumn('price', priceSort), render: (value: number | null, row: AnalysisRow) => <Tooltip content={value === null ? '当前组合没有可用的月度测算单价' : row.product === TOS && row.unit !== 'Request' && row.region === 'cn-north-3' ? 'Storage / StorageEC，cn-north-3：原始测算单价 × 1.073741824；价格表及月趋势使用同一单位换算' : '原型测算单价快照'}><span className="numeric">{priceFormat(value)}</span></Tooltip> },
    { title: '单价单位（币种/单位）', width: 170, className: 'pricing-price-unit', render: (_: any, row: AnalysisRow) => <span className={`pricing-nowrap pricing-price-unit-text ${isTos ? 'pricing-price-unit-tos' : ''}`}>{currencyUnit(row)}</span> },
    ...(monthlyTargets ? [
      { title: '月度目标单价', dataIndex: 'monthTarget', width: 150, ...sortColumn('monthTarget', priceSort), render: () => missingTarget },
      { title: '月度偏差幅度', dataIndex: 'monthDeviation', width: 140, ...sortColumn('monthDeviation', priceSort), render: () => missingTarget },
    ] : []),
    ...(quarterlyTargets ? [
      { title: '季度目标单价', dataIndex: 'quarterTarget', width: 150, ...sortColumn('quarterTarget', priceSort), render: () => missingTarget },
      { title: '季度偏差幅度', dataIndex: 'quarterDeviation', width: 140, ...sortColumn('quarterDeviation', priceSort), render: () => missingTarget },
    ] : []),
    { title: '年度累计测算单价', dataIndex: 'cumulativePrice', width: 180, ...sortColumn('cumulativePrice', priceSort), render: (value: number | null, row: AnalysisRow) => <Tooltip content={row.priceStatus}><span className="numeric">{priceFormat(value)}</span></Tooltip> },
    ...(annualTargets ? [
      { title: '年度目标单价', dataIndex: 'annualTarget', width: 150, ...sortColumn('annualTarget', priceSort), render: () => missingTarget },
      { title: '年度累计偏差幅度', dataIndex: 'annualDeviation', width: 165, ...sortColumn('annualDeviation', priceSort), render: () => missingTarget },
    ] : []),
    { title: '计费方式', width: 135, className: 'pricing-billing-method', render: () => <span className="pricing-nowrap pricing-billing-method-text">按加和量日结</span> },
  ];
  const metricColumns: any[] = [
    { title: '账期月份', dataIndex: 'month', width: 120, fixed: 'left', ...sortColumn('month', metricSort) },
    { title: '计费单元', dataIndex: 'unit', width: 170, fixed: 'left' },
    { title: '大区', dataIndex: 'area', width: 80, fixed: 'left' },
    { title: '售卖区域', dataIndex: 'region', width: 150, fixed: 'left' },
    { title: '单位', dataIndex: 'unitLabel', width: 140 },
    { title: '月度实际值', dataIndex: 'actual', width: 160, ...sortColumn('actual', metricSort), render: (value: number | null) => <span className="numeric">{selectedNode?.type === 'ratio' ? percent(value) : selectedNode?.type === 'amount' ? amount(value) : selectedNode?.type === 'quantity' ? quantityFormat(value) : priceFormat(value)}</span> },
    ...(monthlyTargets ? [
      { title: '月度目标值', dataIndex: 'target', width: 150, ...sortColumn('target', metricSort), render: () => missingTarget },
      { title: '月度偏差幅度', dataIndex: 'deviation', width: 150, ...sortColumn('deviation', metricSort), render: () => missingTarget },
    ] : []),
    ...(quarterlyTargets ? [
      { title: '季度目标值', dataIndex: 'quarterTarget', width: 150, ...sortColumn('quarterTarget', metricSort), render: () => missingTarget },
      { title: '季度偏差幅度', dataIndex: 'quarterDeviation', width: 150, ...sortColumn('quarterDeviation', metricSort), render: () => missingTarget },
    ] : []),
    { title: '年度累计实际值', dataIndex: 'annualActual', width: 150, render: () => <Tooltip content="公式指标累计值未接入，不使用月度值替代"><span className="muted-value">—</span></Tooltip> },
    ...(annualTargets ? [
      { title: '年度目标值', dataIndex: 'annualTarget', width: 150, ...sortColumn('annualTarget', metricSort), render: () => missingTarget },
      { title: '年度偏差幅度', dataIndex: 'annualDeviation', width: 150, render: () => missingTarget },
    ] : []),
  ];
  if (!supported) return <Section title="成本定价"><EmptyState text="暂不支持该商品定价分析"/><p className="plain-text">当前商品未接入定价模型，不使用其他商品的公式或数据替代。</p></Section>;
  return <>
    <Section title="单价目标差距" id="pricing-item-income" extra={<span className="pricing-source">定价快照</span>} subtitle="月度偏差幅度 =（月度测算单价 - 月度目标单价）/ 月度目标单价 × 100%；年度累计单价采用同组合、同单位的售卖量加权快照。">
      <p className="plain-text pricing-quarter-caliber">季度偏差幅度 =（月度测算单价 - 季度目标单价）/ 季度目标单价 × 100%。{isTos ? 'TOS 按计费单元 × 大区匹配。' : ''}季度目标口径尚未核验：“当季已过月度目标之和”不能直接用于单价或比率；有效季度目标缺失时显示“—”。</p>
      <Note tone="warning">{isTos ? 'TOS 尚未接入年度累计加权数据，年度累计测算单价与偏差暂不可用；月度价格不能作为年度累计价格。' : '目标表尚无有效目标版本，保留月度与累计实际快照；目标、偏差和稳定价结论暂不能判断。'}</Note>
      {rows.length === 0 ? <EmptyState text="当前筛选组合暂无线上单价数据"/> : <><div className="analysis-table"><Table rowKey="id" size="small" stripe border={{ wrapper: true }} columns={priceColumns} data={pagePrices} pagination={false} scroll={{ x: priceColumns.reduce((sum, column) => sum + (column.width || 150), 0) }} onChange={(_pagination, sorter) => { setPriceSort(stateFromSorter(sorter, { key: 'monthDeviation', order: 'descend' })); setPage(1); }}/></div>
        <div className="pricing-pagination"><span>共 {sortedPrices.length} 条，当前显示第 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sortedPrices.length)} 条</span><Pagination size="small" current={page} pageSize={pageSize} total={sortedPrices.length} sizeCanChange sizeOptions={[10, 20, 50, 100]} onChange={(nextPage, nextSize) => { setPageSize(nextSize); setPage(nextSize === pageSize ? nextPage : 1); }} onPageSizeChange={nextSize => { setPageSize(nextSize); setPage(1); }}/></div>
      </>}
      <Fold title="月趋势"><div className="analysis-chart-grid" data-testid="pricing-price-trends">
        <AnalysisChart title="月度目标偏差趋势" values={[...priceTrends(filters, 'price'), ...(monthlyTargets ? unavailableTrend(filters, ['月度目标', '月度偏差（%）']) : [])]} dashedSeries={['月度目标']} unit="人民币 / 计费单位"/>
        <div className="pricing-quarter-trend"><AnalysisChart title="季度目标偏差趋势" values={quarterlyTargets ? unavailableTrend(filters, ['季度目标', '季度偏差（%）']) : []} dashedSeries={['季度目标']} unit="人民币 / 计费单位"/><p className="plain-text">{quarterlyTargets ? '未提供有效季度目标，季度偏差不可计算；不绘制目标或偏差线。' : '未选择季度目标值，季度目标与偏差不展示。'}</p></div>
        <AnalysisChart title="年度累计单价与偏差趋势" values={[...priceTrends(filters, 'cumulativePrice'), ...(annualTargets ? unavailableTrend(filters, ['年度目标', '年度累计偏差（%）']) : [])]} dottedSeries={['年度目标']} unit="人民币 / 计费单位"/>
        <AnalysisChart title="售卖量趋势" values={priceTrends(filters, 'quantity')} unit="计费单位"/>
      </div><p className="plain-text">各组合分别展示，按图例点击显隐。无有效目标时不绘制目标或偏差线；不同计费单位不汇总。</p></Fold>
    </Section>
    <CostAnalysis filters={filters}/>
    <Section title="计费项定价公式" id="pricing-item-formula" extra={<span className="pricing-source">V2 · 模型展示</span>}>
      <div className="formula-filter"><Field label="计费单元"><Select defaultActiveFirstOption={false} showSearch={availableUnits.length > SELECT_SEARCH_THRESHOLD} value={activeUnit || undefined} options={availableUnits} placeholder={getSelectPlaceholder(availableUnits.length > SELECT_SEARCH_THRESHOLD)} onChange={value => { setFormulaUnit(value); setFormulaArea(''); setFormulaRegion(''); }}/></Field><Field label="大区"><Select defaultActiveFirstOption={false} showSearch={availableAreas.length > SELECT_SEARCH_THRESHOLD} value={activeArea || undefined} options={availableAreas.map(value => ({ value, label: `${value} · ${areaNames[value]}` }))} placeholder={getSelectPlaceholder(availableAreas.length > SELECT_SEARCH_THRESHOLD)} onChange={value => { setFormulaArea(value); setFormulaRegion(''); }}/></Field><Field label="售卖区域"><Select defaultActiveFirstOption={false} showSearch={!isTos && availableRegions.length > SELECT_SEARCH_THRESHOLD} disabled={isTos} value={isTos ? undefined : activeRegion || undefined} options={availableRegions} placeholder={getSelectPlaceholder(!isTos && availableRegions.length > SELECT_SEARCH_THRESHOLD)} onChange={setFormulaRegion}/></Field></div>
      <div className="version-strip"><span>适用账期 <b>{filters.month}</b></span><span>目标版本 <b>未生效</b></span><span>公式展示 <b>V2 · 文档截图链路</b></span><span>数据版本 <b>原型快照 {filters.month}</b></span><span className="pricing-blocked">暂不能判断</span></div>
      <div className="evidence-tags"><Button size="small" onClick={() => setEvidence(true)}>数据完整性 · 查看依据</Button></div>
      {isTos && <Note tone="warning">当前 {filters.month} 在所选计费单元 / 大区范围内暂无已核验的 TOS 模型指标。年度累计加权数据与有效目标缺失，不输出稳定价或调价结论；请调整上方筛选范围后重试。</Note>}
      {!tree ? <EmptyState text={rows.length === 0 ? '当前公式链路筛选组合暂无可用于公式归因的指标数据' : '当前计费单元暂无已接入的定价公式链路，不使用 CPU 公式替代'}/> : <>
        {!isTos && <Note>公式按文档 CPU 链路还原，系数来自截图示例，规模值随原型快照联动；与线上定价版本尚未核验，不作为核价或调价结果。目标表未配置有效指标目标。</Note>}
        <div className="pricing-formula-container"><div className="pricing-formula-heading"><h3>指标公式</h3><small>{tree.title}</small></div><div className="formula-row"><FormulaCard node={tree} root expanded={expanded} toggle={toggle} onTrend={showTrend} targets={filters.targets}/></div><FormulaBranch node={tree} level={1} expanded={expanded} toggle={toggle} onTrend={showTrend} targets={filters.targets}/></div>
        <div id="pricing-metric-trend" className="pricing-metric-panel"><div className="analysis-toolbar"><h3>指标趋势</h3><Select defaultActiveFirstOption={false} showSearch={nodes.length > SELECT_SEARCH_THRESHOLD} placeholder={getSelectPlaceholder(nodes.length > SELECT_SEARCH_THRESHOLD)} style={{ width: 480 }} value={selectedNode?.id} options={nodes.map(node => ({ value: node.id, label: node.title }))} onChange={setMetric}/></div><div className="pricing-trend-chips"><span>时间范围 2026-01 至 {filters.month}</span><span>{isTos ? `计费单元 & 大区 ${activeUnit} / ${activeArea}` : `计费单元 & 大区 & 售卖区域 ${activeUnit} / ${activeArea} / ${activeRegion}`}</span></div>
          <div className="pricing-trend-switches" data-testid="pricing-trend-switches">
            <div className="pricing-trend-switch-group" role="group" aria-label="趋势时间粒度"><Button size="small" type={timeGrain === 'month' ? 'primary' : 'secondary'} aria-pressed={timeGrain === 'month'} onClick={() => setTimeGrain('month')}>按月</Button><Button size="small" type={timeGrain === 'day' ? 'primary' : 'secondary'} aria-pressed={timeGrain === 'day'} onClick={() => setTimeGrain('day')}>按日</Button></div>
            <div className="pricing-trend-switch-group" role="group" aria-label="趋势聚合口径"><Button size="small" type={aggregation === 'total' ? 'primary' : 'secondary'} aria-pressed={aggregation === 'total'} onClick={() => setAggregation('total')}>月总计</Button><Button size="small" type={aggregation === 'dailyAverage' ? 'primary' : 'secondary'} aria-pressed={aggregation === 'dailyAverage'} onClick={() => setAggregation('dailyAverage')}>月日均</Button></div>
          </div>
          {metricUnavailable ? <div data-testid="pricing-metric-unavailable"><Note tone="warning">{metricUnavailableText}</Note><EmptyState text={timeGrain === 'day' ? '暂无按日数据' : '暂无已核验的月日均数据'}/></div> : <>
            <AnalysisChart key={`${metric}-${activeUnit}-${activeArea}-${activeRegion}`} title={selectedNode?.title || '公式指标月度趋势'} values={metricTrendValues} dashedSeries={['月度目标', '季度目标']} dottedSeries={['年度目标']} percent={selectedNode?.type === 'ratio'} unit={selectedNode?.unit || ''} height={270}/>
            <p className="plain-text">月度目标值、年度目标值均无有效数据，曲线不绘制；目标单元格显示“—”。公式卡年度偏差不是年度累计偏差。</p>
            {quarterlyTargets && <p className="plain-text">季度目标值无有效数据，季度曲线不绘制，季度目标与季度偏差显示“—”；不由月度单价或比率求和推定季度目标。</p>}
            <div className="analysis-table"><Table rowKey="id" size="small" stripe border={{ wrapper: true }} columns={metricColumns} data={sortRows(monthlyFormulaRows, metricSort)} pagination={false} scroll={{ x: metricColumns.reduce((sum, column) => sum + (column.width || 150), 0) }} onChange={(_pagination, sorter) => setMetricSort(stateFromSorter(sorter, { key: 'deviation', order: 'descend' }))} noDataElement={<EmptyState text="当前全局筛选结果下暂无可展示的组合维度月度趋势明细"/>}/></div>
          </>}
        </div>
      </>}
    </Section>
    <Drawer title="数据完整性 · 归因证据" visible={evidence} width={700} footer={<Button type="primary" onClick={() => setEvidence(false)}>关闭</Button>} onCancel={() => setEvidence(false)}>
      <div className="pricing-evidence"><Alert className="pricing-evidence-status" type="warning" content="暂不能判断稳定价与调价结论"/><h3>受影响对象</h3><p>{filters.product}<br/>{activeUnit || '当前筛选计费单元'} / {activeArea || '当前筛选大区'}{!isTos && activeRegion ? ` / ${activeRegion}` : ''}</p><h3>受影响月份</h3><p>2026-01 至 {filters.month}</p><h3>关联指标或异常状态</h3><ul><li>月度目标单价、年度目标单价：无有效目标版本。</li><li>月度偏差、年度累计偏差：因有效目标缺失返回空值。</li>{isTos && <li>年度累计测算单价：售卖量加权累计数据尚未接入。</li>}<li>公式版本：文档截图链路仅用于交互展示，未与线上模型核验。</li></ul><h3>判定规则</h3><p>目标匹配必须使用状态为“有效”的记录，并匹配商品、指标、账期年度、币种与适用范围。缺失目标或版本不一致时，阻断年度价格、稳定价及调价结论。年度累计值不能用月价或月价算术平均替代。</p><h3>证据来源</h3><p>文档目标表记录中没有“有效”目标；本原型保留该门禁。页面实际金额与规模使用共享原型快照，不连接实时财务数据。</p><h3>管理动作边界</h3><p>先补充并核验目标与模型版本、累计取数状态。此处仅查看分析证据，不执行调价或 True Up。</p></div>
    </Drawer>
  </>;
}
