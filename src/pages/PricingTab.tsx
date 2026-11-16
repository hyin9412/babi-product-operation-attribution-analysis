// References: none — PRD cost-pricing behavior retained; standard Pagination and Alert follow project design rules.
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Drawer, Popover, Select, Tabs, Tooltip } from '@byted-babi/babi-design';
import { IconInfoCircle } from '@arco-design/iconbox-react-ve-o-design';
import { AnalysisFilters, AnalysisProps, AnalysisRow, BYTEGRAPH, TOS, amount, areaNames, getRows, metricDeviation, monthList, percent, priceFormat, prototypeTargetValue, quantityFormat, snapshot } from './analysisData';
import { AnalysisChart, ChartValue, EmptyState, ExactValue, Fold, Note, Section, SELECT_SEARCH_THRESHOLD, SourceTable, getSelectPlaceholder, sourcePaginationProps, trendPercent } from './analysisUI';
import './pricing.css';

type Order = 'ascend' | 'descend';
type SortState = { key: string; order: Order };
const unique = (items: string[]) => Array.from(new Set(items));
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
const priceDeviationHeader = (title:string, formula:string) => <span className="pricing-deviation-header">
  <span>{title}</span>
  <Popover trigger="hover" position="top" unmountOnExit content={<div className="pricing-deviation-formula">{formula}</div>}>
    <button type="button" className="pricing-deviation-info" aria-label={`${title}计算公式`} onClick={event=>event.stopPropagation()} onKeyDown={event=>event.stopPropagation()}><IconInfoCircle width="14" height="14"/></button>
  </Popover>
</span>;

interface PriceRow extends AnalysisRow { monthTarget: number|null; monthDeviation: number|null; quarterTarget: number|null; quarterDeviation: number|null; annualTarget: number|null; annualDeviation: number|null; }
function priceTrends(filters: AnalysisFilters, key: 'price' | 'cumulativePrice' | 'quantity'): ChartValue[] {
  return monthList(filters.month).flatMap(month => getRows(filters, month).map(row => ({ x: month.slice(5) + '月', series: combination(row), value: key === 'price' ? normalizedPrice(row) : row[key] })));
}
function targetPrice(row:AnalysisRow,cadence:'month'|'quarter'|'annual') {
  const source=cadence==='annual'?row.cumulativePrice:normalizedPrice(row);
  return prototypeTargetValue(source,row,`${cadence}-price-target`,cadence==='annual'?.95:.94,cadence==='annual'?1.07:1.06);
}
function priceComparisonTrends(filters:AnalysisFilters,cadence:'month'|'quarter'|'annual'):ChartValue[] {
  return monthList(filters.month).flatMap(month=>{
    const groups=new Map<string,AnalysisRow[]>();
    getRows(filters,month).forEach(row=>groups.set(row.unit,[...(groups.get(row.unit)||[]),row]));
    return Array.from(groups.entries()).flatMap(([unit,rows])=>{
      const weighted=(read:(row:AnalysisRow)=>number|null)=>{
        const available=rows.map(row=>({row,value:read(row)})).filter((item):item is {row:AnalysisRow;value:number}=>item.value!==null&&Number.isFinite(item.value)&&item.row.quantity>0);
        const quantity=available.reduce((sum,item)=>sum+item.row.quantity,0);
        return quantity?available.reduce((sum,item)=>sum+item.value*item.row.quantity,0)/quantity:null;
      };
      return [
        {x:month.slice(5)+'月',series:`${unit} · 实际`,value:weighted(row=>cadence==='annual'?row.cumulativePrice:normalizedPrice(row))},
        {x:month.slice(5)+'月',series:`${unit} · 目标`,value:weighted(row=>targetPrice(row,cadence))},
      ];
    });
  });
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
function tosTree(row: AnalysisRow): FormulaNode {
  if (row.unit === 'Request') return { id: 'root', title: 'tos_Request_纯资源_单价', formula: '= 请求成本 / 请求次数 ×（1 + 策略加成比例）；原型指标用于交互展示', value: normalizedPrice(row), type: 'price', unit: 'CNY / 万次', children: [
    { id: 'requestCost', title: 'TOS 请求成本', formula: '计费单元 × 大区口径的原型成本快照', value: row.cost, type: 'amount', unit: 'CNY' },
    { id: 'requestCount', title: 'TOS 请求次数', formula: '原型售卖量快照', value: row.quantity, type: 'quantity', unit: '次' },
    { id: 'strategy', title: 'TOS 策略加成比例', formula: '原型目标版本 V1 的策略加成示例', value: .025, type: 'ratio', unit: '%' },
  ] };
  return { id: 'root', title: `tos_${row.unit}_纯资源_单价`, formula: '存储单价由各存储渠道单价与售卖份额加权后叠加策略加成；当前为原型快照', value: normalizedPrice(row), type: 'price', unit: 'CNY / 存储计费单位' };
}
function flattenTree(node: FormulaNode): FormulaNode[] { return [node, ...(node.children || []).flatMap(flattenTree)]; }
function formatNode(node: FormulaNode): string { return node.type === 'ratio' ? percent(node.value === null ? null : node.value * 100) : node.type === 'amount' ? amount(node.value) : node.type === 'price' ? priceFormat(node.value) : quantityFormat(node.value); }
function formulaTarget(node:FormulaNode,row:AnalysisRow,cadence:'month'|'quarter'|'annual') {
  return prototypeTargetValue(node.value,row,`${cadence}-formula-${node.id}`,cadence==='annual'?.94:.92,cadence==='annual'?1.08:1.1);
}
const formatFormulaTarget=(node:FormulaNode,value:number|null)=>formatNode({...node,value});
const formulaDeviation=(node:FormulaNode,target:number|null)=>metricDeviation(node.value,target,node.type==='ratio'?'rate':'price');
function FormulaCard({ node, row, expanded, toggle, onTrend, targets, root = false }: { node: FormulaNode; row:AnalysisRow; expanded: Set<string>; toggle: (id: string) => void; onTrend: (id: string) => void; targets: string[]; root?: boolean }) {
  const monthlyTarget=formulaTarget(node,row,'month'),quarterlyTarget=formulaTarget(node,row,'quarter'),annualTarget=formulaTarget(node,row,'annual');
  return <div className={`formula-card ${root ? 'root' : ''}`} aria-label={node.title}>
    <div className="formula-actions">{node.children && <Button size="mini" onClick={() => toggle(node.id)}>{expanded.has(node.id) ? '收起' : '展开公式'}</Button>}<Button size="mini" onClick={() => onTrend(node.id)}>月趋势</Button></div>
    <p>{node.formula}</p>
    <div className="formula-value numeric"><span className="pricing-unit-pill">{node.unit}</span> {formatNode(node)}</div>
    {targets.length > 0 && <div className={`formula-target ${targets.includes('季度目标值') ? 'formula-target-quarter' : ''}`}>
      {targets.includes('月度目标值') && <div>月度目标<strong>{formatFormulaTarget(node,monthlyTarget)}</strong><span>月度偏差 {percent(formulaDeviation(node,monthlyTarget))}</span><br/><span>原型目标 V1</span></div>}
      {targets.includes('季度目标值') && <div>季度目标<strong>{formatFormulaTarget(node,quarterlyTarget)}</strong><span>季度偏差 {percent(formulaDeviation(node,quarterlyTarget))}</span><br/><span>季度基准目标</span></div>}
      {targets.includes('年度目标值') && <div>年度目标<strong>{formatFormulaTarget(node,annualTarget)}</strong><span>年度偏差 {percent(formulaDeviation(node,annualTarget))}</span><br/><span>年度基准目标</span></div>}
    </div>}
    <div className="pricing-node-version">模型展示 V2 · 截图示例</div>
  </div>;
}
function FormulaBranch({ node, row, level, expanded, toggle, onTrend, targets }: { node: FormulaNode; row:AnalysisRow; level: number; expanded: Set<string>; toggle: (id: string) => void; onTrend: (id: string) => void; targets: string[] }) {
  if (!node.children || !expanded.has(node.id)) return null;
  return <div className="pricing-formula-branch"><div className="formula-level-label">{level}级拆解：{node.title}</div><div className="formula-row">{node.children.map(child => <FormulaCard key={child.id} node={child} row={row} expanded={expanded} toggle={toggle} onTrend={onTrend} targets={targets}/>)}</div>{node.children.map(child => <FormulaBranch key={child.id} node={child} row={row} level={level + 1} expanded={expanded} toggle={toggle} onTrend={onTrend} targets={targets}/>)}</div>;
}

export default function PricingTab({ filters }: AnalysisProps) {
  const isTos = filters.product === TOS;
  const supported = filters.product === BYTEGRAPH || isTos;
  const rows = useMemo(() => getRows(filters), [filters]);
  const filterKey = JSON.stringify(filters);
  const [priceSort, setPriceSort] = useState<SortState>({ key: 'monthDeviation', order: 'descend' });
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
  const tree = formulaRow ? isTos ? tosTree(formulaRow) : filters.product === BYTEGRAPH && activeUnit === 'bytegraph.cpu' ? cpuTree(formulaRow) : null : null;
  const nodes = tree ? flattenTree(tree) : [];
  const selectedNode = nodes.find(node => node.id === metric) || nodes[0];
  const monthlyFormulaRows = monthList(filters.month).flatMap(month => {
    const row = getRows(filters, month).find(item => item.unit === activeUnit && item.area === activeArea && (isTos || item.region === activeRegion));
    if (!row || (!isTos && activeUnit !== 'bytegraph.cpu')) return [];
    const monthTree = isTos ? tosTree(row) : cpuTree(row);
    const node = flattenTree(monthTree).find(item => item.id === metric) || monthTree;
    const actual=node.value===null?null:node.type==='ratio'?node.value*100:node.value;
    const monthlyTarget=formulaTarget(node,row,'month'),quarterTarget=formulaTarget(node,row,'quarter'),annualTarget=formulaTarget(node,row,'annual');
    const normalizedTarget=(value:number|null)=>value===null?null:node.type==='ratio'?value*100:value;
    const annualActual=actual===null?null:['amount','quantity'].includes(node.type)?actual*Number(month.slice(-2)):actual;
    const normalizedAnnualTarget=annualTarget===null?null:['amount','quantity'].includes(node.type)?normalizedTarget(annualTarget)!*12:normalizedTarget(annualTarget);
    return [{ id: `${row.id}-${metric}`, month, unit: row.unit, area: row.area, region: isTos ? '' : row.region, unitLabel: node.unit, actual, target: normalizedTarget(monthlyTarget), deviation: metricDeviation(actual,normalizedTarget(monthlyTarget),node.type==='ratio'?'rate':'price'), quarterTarget: normalizedTarget(quarterTarget), quarterDeviation: metricDeviation(actual,normalizedTarget(quarterTarget),node.type==='ratio'?'rate':'price'), annualActual, annualTarget: normalizedAnnualTarget, annualDeviation: metricDeviation(annualActual,normalizedAnnualTarget,node.type==='ratio'?'rate':'price') }];
  });
  const metricSeries = ['实际值', ...(monthlyTargets ? ['月度目标'] : []), ...(quarterlyTargets ? ['季度目标'] : []), ...(annualTargets ? ['年度目标'] : [])];
  const metricTrendValues: ChartValue[] = monthlyFormulaRows.flatMap(row => metricSeries.map(series => ({ x: row.month.slice(5) + '月', series, value: series === '实际值' ? row.actual : null })));
  const metricUnavailable = timeGrain === 'day' || aggregation === 'dailyAverage';
  const metricUnavailableText = timeGrain === 'day' ? '按天粒度暂未接入，暂无可展示的日趋势与明细；请切换“按月”查看。' : '月日均聚合口径暂未接入：分母、支持指标及单位换算尚未核验，不将单价、比率或数量统一除以自然日。请切换“月总计”查看。';
  useEffect(() => { setPriceSort({ key: 'monthDeviation', order: 'descend' }); setExpanded(new Set()); setMetric('root'); setTimeGrain('month'); setAggregation('total'); }, [filterKey]);
  useEffect(() => { setExpanded(new Set()); setMetric('root'); setMetricSort({ key: 'deviation', order: 'descend' }); }, [activeUnit, activeArea, activeRegion]);
  useEffect(() => { setMetricSort({ key: 'deviation', order: 'descend' }); }, [metric]);
  const toggle = (id: string) => setExpanded(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const showTrend = (id: string) => { setMetric(id); setTimeout(() => document.getElementById('pricing-metric-trend')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80); };
  const priceRows: PriceRow[] = rows.map(row => {
    const price=normalizedPrice(row),monthTarget=targetPrice(row,'month'),quarterTarget=targetPrice(row,'quarter'),annualTarget=targetPrice(row,'annual');
    return {...row,price,monthTarget,monthDeviation:metricDeviation(price,monthTarget,'price'),quarterTarget,quarterDeviation:metricDeviation(price,quarterTarget,'price'),annualTarget,annualDeviation:metricDeviation(row.cumulativePrice,annualTarget,'price')};
  });
  const sortedPrices = sortRows(priceRows, priceSort);
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
        { title: '月度目标单价', dataIndex: 'monthTarget', width: 150, ...sortColumn('monthTarget', priceSort), render: priceFormat },
        { title: priceDeviationHeader('月度偏差幅度','月度偏差幅度 =（月度测算单价 - 月度目标单价）/ 月度目标单价 × 100%'), dataIndex: 'monthDeviation', width: 160, ...sortColumn('monthDeviation', priceSort), render: trendPercent },
    ] : []),
    ...(quarterlyTargets ? [
        { title: '季度目标单价', dataIndex: 'quarterTarget', width: 150, ...sortColumn('quarterTarget', priceSort), render: priceFormat },
        { title: '季度偏差幅度', dataIndex: 'quarterDeviation', width: 140, ...sortColumn('quarterDeviation', priceSort), render: trendPercent },
    ] : []),
    { title: '年度累计测算单价', dataIndex: 'cumulativePrice', width: 180, ...sortColumn('cumulativePrice', priceSort), render: (value: number | null, row: AnalysisRow) => <Tooltip content={row.priceStatus}><span className="numeric">{priceFormat(value)}</span></Tooltip> },
    ...(annualTargets ? [
        { title: '年度目标单价', dataIndex: 'annualTarget', width: 150, ...sortColumn('annualTarget', priceSort), render: priceFormat },
        { title: priceDeviationHeader('年度累计偏差幅度','年度累计偏差幅度 =（年度累计测算单价 - 年度目标单价）/ 年度目标单价 × 100%。'), dataIndex: 'annualDeviation', width: 190, ...sortColumn('annualDeviation', priceSort), render: trendPercent },
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
        { title: '月度目标值', dataIndex: 'target', width: 150, ...sortColumn('target', metricSort), render: (value:number|null) => selectedNode?.type==='ratio'?percent(value):selectedNode?.type==='amount'?amount(value):selectedNode?.type==='quantity'?quantityFormat(value):priceFormat(value) },
        { title: '月度偏差幅度', dataIndex: 'deviation', width: 150, ...sortColumn('deviation', metricSort), render: trendPercent },
    ] : []),
    ...(quarterlyTargets ? [
        { title: '季度目标值', dataIndex: 'quarterTarget', width: 150, ...sortColumn('quarterTarget', metricSort), render: (value:number|null) => selectedNode?.type==='ratio'?percent(value):selectedNode?.type==='amount'?amount(value):selectedNode?.type==='quantity'?quantityFormat(value):priceFormat(value) },
        { title: '季度偏差幅度', dataIndex: 'quarterDeviation', width: 150, ...sortColumn('quarterDeviation', metricSort), render: trendPercent },
    ] : []),
      { title: '年度累计实际值', dataIndex: 'annualActual', width: 150, render: (value:number|null) => selectedNode?.type==='ratio'?percent(value):selectedNode?.type==='amount'?amount(value):selectedNode?.type==='quantity'?quantityFormat(value):priceFormat(value) },
    ...(annualTargets ? [
        { title: '年度目标值', dataIndex: 'annualTarget', width: 150, ...sortColumn('annualTarget', metricSort), render: (value:number|null) => selectedNode?.type==='ratio'?percent(value):selectedNode?.type==='amount'?amount(value):selectedNode?.type==='quantity'?quantityFormat(value):priceFormat(value) },
        { title: '年度偏差幅度', dataIndex: 'annualDeviation', width: 150, render: trendPercent },
    ] : []),
  ];
  if (!supported) return <Section title="成本定价"><EmptyState text="暂不支持该商品定价分析"/><p className="plain-text">当前商品未接入定价模型，不使用其他商品的公式或数据替代。</p></Section>;
  return <>
    <Section title="单价目标差距" id="pricing-item-income">
      {rows.length === 0 ? <EmptyState text="当前筛选组合暂无线上单价数据"/> : <SourceTable key={filterKey} columns={priceColumns} data={sortedPrices} pagination={sourcePaginationProps(sortedPrices.length)} width={priceColumns.reduce((sum, column) => sum + (column.width || 150), 0)} onChange={(_pagination:any, sorter:any) => setPriceSort(stateFromSorter(sorter, { key: 'monthDeviation', order: 'descend' }))}/>}
      <Fold title="月趋势" appearance="filter"><div className="analysis-chart-grid" data-testid="pricing-price-trends">
        <AnalysisChart title="月度目标偏差趋势" values={monthlyTargets?priceComparisonTrends(filters,'month'):priceTrends(filters,'price')} unit="人民币 / 计费单位"/>
        <div className="pricing-quarter-trend"><AnalysisChart title="季度目标偏差趋势" values={quarterlyTargets?priceComparisonTrends(filters,'quarter'):priceTrends(filters,'price')} unit="人民币 / 计费单位"/><p className="plain-text">{quarterlyTargets ? '展示各组合月度测算单价与对应季度基准目标。' : '未选择季度目标值，仅展示月度测算单价。'}</p></div>
        <AnalysisChart title="年度累计单价与偏差趋势" values={annualTargets?priceComparisonTrends(filters,'annual'):priceTrends(filters,'cumulativePrice')} unit="人民币 / 计费单位"/>
        <AnalysisChart title="售卖量趋势" values={priceTrends(filters, 'quantity')} unit="计费单位"/>
      </div><p className="plain-text">各组合分别展示，按图例点击显隐；不同计费单位不汇总。</p></Fold>
    </Section>
    <Section title="计费项定价公式" id="pricing-item-formula">
      <div className="formula-filter">
        <Select addBefore="计费单元" defaultActiveFirstOption={false} showSearch={availableUnits.length > SELECT_SEARCH_THRESHOLD} value={activeUnit || undefined} options={availableUnits} placeholder={getSelectPlaceholder(availableUnits.length > SELECT_SEARCH_THRESHOLD)} onChange={value => { setFormulaUnit(value); setFormulaArea(''); setFormulaRegion(''); }}/>
        <Select addBefore="大区" defaultActiveFirstOption={false} showSearch={availableAreas.length > SELECT_SEARCH_THRESHOLD} value={activeArea || undefined} options={availableAreas.map(value => ({ value, label: `${value} · ${areaNames[value]}` }))} placeholder={getSelectPlaceholder(availableAreas.length > SELECT_SEARCH_THRESHOLD)} onChange={value => { setFormulaArea(value); setFormulaRegion(''); }}/>
        <Select addBefore="售卖区域" defaultActiveFirstOption={false} showSearch={!isTos && availableRegions.length > SELECT_SEARCH_THRESHOLD} disabled={isTos} value={isTos ? undefined : activeRegion || undefined} options={availableRegions} placeholder={getSelectPlaceholder(!isTos && availableRegions.length > SELECT_SEARCH_THRESHOLD)} onChange={setFormulaRegion}/>
      </div>
      {!tree ? <EmptyState text={rows.length === 0 ? '当前公式链路筛选组合暂无可用于公式归因的指标数据' : '当前计费单元暂无已接入的定价公式链路，不使用 CPU 公式替代'}/> : <>
        {!isTos && <Note>公式按文档 CPU 链路还原，系数来自截图示例，规模值和原型目标随共享快照联动；不作为线上核价或调价结果。</Note>}
        <div className="pricing-formula-container"><div className="pricing-formula-heading"><h3>指标公式</h3><small>{tree.title}</small></div><div className="formula-row"><FormulaCard node={tree} row={formulaRow!} root expanded={expanded} toggle={toggle} onTrend={showTrend} targets={filters.targets}/></div><FormulaBranch node={tree} row={formulaRow!} level={1} expanded={expanded} toggle={toggle} onTrend={showTrend} targets={filters.targets}/></div>
        <div id="pricing-metric-trend" className="pricing-metric-panel"><div className="analysis-toolbar"><h3>指标趋势</h3></div>
          <div className="pricing-trend-controls">
            <Select addBefore="时间范围" className="pricing-time-range-select" disabled value={`2026-01 至 ${filters.month}`} options={[`2026-01 至 ${filters.month}`]} aria-label="时间范围"/>
            <Select addBefore={isTos ? '收入计费单元&大区' : '收入计费单元&大区&收入售卖区域'} className="pricing-scope-select" disabled value={isTos ? `${activeUnit} / ${activeArea}` : `${activeUnit} / ${activeArea} / ${activeRegion}`} options={[isTos ? `${activeUnit} / ${activeArea}` : `${activeUnit} / ${activeArea} / ${activeRegion}`]} aria-label="当前指标分析范围"/>
            <Select addBefore="指标" className="pricing-metric-select" defaultActiveFirstOption={false} showSearch={nodes.length > SELECT_SEARCH_THRESHOLD} placeholder={getSelectPlaceholder(nodes.length > SELECT_SEARCH_THRESHOLD)} value={selectedNode?.id} options={nodes.map(node => ({ value: node.id, label: node.title }))} onChange={setMetric}/>
            <div role="group" aria-label="趋势时间粒度"><Tabs className="pricing-pipeline-tabs" type="capsule" size="default" activeTab={timeGrain} onChange={key => setTimeGrain(key as 'month' | 'day')}><Tabs.TabPane key="month" title="按月"/><Tabs.TabPane key="day" title="按日"/></Tabs></div>
            <div role="group" aria-label="趋势聚合口径"><Tabs className="pricing-pipeline-tabs" type="capsule" size="default" activeTab={aggregation} onChange={key => setAggregation(key as 'total' | 'dailyAverage')}><Tabs.TabPane key="total" title="月总计"/><Tabs.TabPane key="dailyAverage" title="月日均"/></Tabs></div>
          </div>
          {metricUnavailable ? <div data-testid="pricing-metric-unavailable"><Note tone="warning">{metricUnavailableText}</Note><EmptyState text={timeGrain === 'day' ? '暂无按日数据' : '暂无已核验的月日均数据'}/></div> : <>
            <AnalysisChart key={`${metric}-${activeUnit}-${activeArea}-${activeRegion}`} title={selectedNode?.title || '公式指标月度趋势'} values={metricTrendValues} dashedSeries={['月度目标', '季度目标']} dottedSeries={['年度目标']} percent={selectedNode?.type === 'ratio'} unit={selectedNode?.unit || ''} height={270}/>
            <p className="plain-text">月度、季度和年度目标来自原型目标版本 V1；单价和比率目标不进行跨月求和。</p>
            <SourceTable columns={metricColumns} data={sortRows(monthlyFormulaRows, metricSort)} pagination={sourcePaginationProps(monthlyFormulaRows.length)} width={metricColumns.reduce((sum, column) => sum + (column.width || 150), 0)} onChange={(_pagination:any, sorter:any) => setMetricSort(stateFromSorter(sorter, { key: 'deviation', order: 'descend' }))} noDataElement={<EmptyState text="当前全局筛选结果下暂无可展示的组合维度月度趋势明细" compact size={60}/>}/>
          </>}
        </div>
      </>}
    </Section>
    <Drawer title="数据完整性 · 归因证据" visible={evidence} width={700} footer={<Button type="primary" onClick={() => setEvidence(false)}>关闭</Button>} onCancel={() => setEvidence(false)}>
      <div className="pricing-evidence"><Alert className="pricing-evidence-status" type="warning" content="原型目标仅用于界面验证"/><h3>受影响对象</h3><p>{filters.product}<br/>{activeUnit || '当前筛选计费单元'} / {activeArea || '当前筛选大区'}{!isTos && activeRegion ? ` / ${activeRegion}` : ''}</p><h3>目标适用月份</h3><p>2026-01 至 2026-12</p><h3>当前数据状态</h3><ul><li>月度、季度、年度目标：原型目标版本 V1。</li><li>目标偏差：按页面展示口径实时计算。</li><li>公式版本：文档截图链路用于交互展示，未与线上模型核验。</li></ul><h3>判定规则</h3><p>金额类目标按账期累计，单价和比率按同口径直接比较。正式接入时仍需匹配商品、指标、账期年度、币种与适用范围。</p><h3>证据来源</h3><p>页面实际值与目标值均使用共享原型快照，不连接实时财务数据。</p><h3>管理动作边界</h3><p>当前结果仅用于验证分析流程，不执行调价或 True Up。</p></div>
    </Drawer>
  </>;
}
