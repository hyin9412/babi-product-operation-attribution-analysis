// References: none — PRD cost-pricing behavior retained; standard Pagination and Alert follow project design rules.
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import Modal from '@tod-m/materials/ve-o/es/Modal';
import { Alert, Button, DatePicker, Drawer, Tabs } from '@byted-babi/babi-design';
import { getSmoothStepPath, Position } from '@xyflow/react';
import Popover from './AnalysisPopover';
import { IconInfoCircle } from '@arco-design/iconbox-react-ve-o-design';
import { TopologyCanvasShell, type TopologyCanvasViewport } from '../app/component/topology-canvas-shell';
import MetricTopologyNode, { METRIC_SOURCE_OFFSET, type MetricTopologyNodeProps, type MetricTopologyTarget } from './MetricTopologyNode';
import CalculationOperatorNode, { type CalculationOperator } from './CalculationOperatorNode';
import ConstantTopologyNode from './ConstantTopologyNode';
import BracketExpressionNode, { type BracketExpressionItem } from './BracketExpressionNode';
import FunctionTopologyNode, { formatFunctionNodeLabel, type FunctionFormulaItem } from './FunctionTopologyNode';
import { parseFormulaExpression, type FormulaExpressionItem } from './formula-expression';
import { FORMULA_GROUP_BASE_PADDING, formulaGroupTopPadding, formulaGroupBottomPadding, FormulaGroupContext, classicGroups, insetItemSize, insetSequence, type FormulaGroupStyle } from './formula-group-layout';
import { AnalysisFilters, AnalysisProps, AnalysisRow, BYTEGRAPH, TOS, amount, getRows, metricDeviation, monthList, percent, priceFormat, prototypeTargetValue, quantityFormat, snapshot } from './analysisData';
import { AnalysisChart, AnalysisSelect as Select, ChartValue, EmptyState, Fold, Note, OverflowText, Section, SELECT_SEARCH_THRESHOLD, SourceTable, getSelectPlaceholder, sourcePaginationProps, tableAmount, tablePercent, tablePrice, tableQuantity, trendPercent } from './analysisUI';
import TableTrendView, { TrendDrillIcon, TrendRangeControl, rankedTrendRows, useTableTrend } from './TableTrendView';
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
const priceDimensionKey = (row: Pick<AnalysisRow, 'unit' | 'area' | 'region'>, isTos: boolean) => [row.unit, row.area, ...(isTos ? [] : [row.region])].join('|');
const priceDimensionLabel = priceDimensionKey;
// PRD unit conversion applies only to TOS Storage/StorageEC in cn-north-3.
const normalizedPrice = (row: AnalysisRow) => row.price !== null && row.product === TOS && ['Storage', 'StorageEC'].includes(row.unit) && row.region === 'cn-north-3' ? row.price * 1.073741824 : row.price;
const priceDeviationHeader = (title:string, formula:string) => <span className="pricing-deviation-header">
  <span>{title}</span>
  <Popover trigger="hover" position="top" unmountOnExit content={<div className="pricing-deviation-formula">{formula}</div>}>
    <button type="button" className="pricing-deviation-info" aria-label={`${title}计算公式`} onClick={event=>event.stopPropagation()} onKeyDown={event=>event.stopPropagation()}><IconInfoCircle width="14" height="14"/></button>
  </Popover>
</span>;

interface PriceRow extends AnalysisRow { monthTarget: number|null; monthDeviation: number|null; quarterTarget: number|null; quarterDeviation: number|null; annualTarget: number|null; annualDeviation: number|null; }
interface PriceTrendItem {
  id: string;
  unit: string;
  area: string;
  region: string;
  monthPrice: number|null;
  annualPrice: number|null;
  monthDeviation: number|null;
  quarterDeviation: number|null;
  annualDeviation: number|null;
}
type PriceCadence = 'month'|'quarter'|'annual';
function targetPrice(row:AnalysisRow,cadence:'month'|'quarter'|'annual') {
  const source=cadence==='annual'?row.cumulativePrice:normalizedPrice(row);
  return prototypeTargetValue(source,row,`${cadence}-price-target`,cadence==='annual'?.95:.94,cadence==='annual'?1.07:1.06);
}
function weightedPrice(rows:AnalysisRow[],read:(row:AnalysisRow)=>number|null) {
  const available=rows.map(row=>({row,value:read(row)})).filter((item):item is {row:AnalysisRow;value:number}=>item.value!==null&&Number.isFinite(item.value)&&item.row.quantity>0);
  const quantity=available.reduce((sum,item)=>sum+item.row.quantity,0);
  return quantity?available.reduce((sum,item)=>sum+item.value*item.row.quantity,0)/quantity:null;
}
function priceTrendItems(rows:AnalysisRow[],isTos:boolean):PriceTrendItem[] {
  const groups=new Map<string,AnalysisRow[]>();
  rows.forEach(row=>{
    const key=priceDimensionKey(row,isTos);
    groups.set(key,[...(groups.get(key)||[]),row]);
  });
  return Array.from(groups.entries()).map(([id,group])=>{
    const first=group[0];
    const deviation=(cadence:PriceCadence)=>{
      const actual=weightedPrice(group,row=>cadence==='annual'?row.cumulativePrice:normalizedPrice(row));
      return metricDeviation(actual,weightedPrice(group,row=>targetPrice(row,cadence)),'price');
    };
    return {id,unit:first.unit,area:first.area,region:isTos?'':first.region,monthPrice:weightedPrice(group,normalizedPrice),annualPrice:weightedPrice(group,row=>row.cumulativePrice),monthDeviation:deviation('month'),quarterDeviation:deviation('quarter'),annualDeviation:deviation('annual')};
  });
}
function priceComparisonTrends(filters:AnalysisFilters,cadence:PriceCadence,items:PriceTrendItem[],isTos:boolean,includeTargets=true):ChartValue[] {
  const selectedIds=new Set(items.map(item=>item.id));
  return monthList(filters.month).flatMap(month=>{
    const groups=new Map<string,AnalysisRow[]>();
    getRows(filters,month).forEach(row=>{
      const key=priceDimensionKey(row,isTos);
      if(!selectedIds.has(key))return;
      groups.set(key,[...(groups.get(key)||[]),row]);
    });
    return Array.from(groups.values()).flatMap(rows=>{
      const item=priceDimensionLabel(rows[0],isTos);
      const actual=weightedPrice(rows,row=>cadence==='annual'?row.cumulativePrice:normalizedPrice(row));
      const actualPoint={x:month,series:`${item}, ${cadence==='annual'?'累计测算单价':'测算单价'}`,value:actual};
      if(!includeTargets)return [actualPoint];
      const target=weightedPrice(rows,row=>targetPrice(row,cadence));
      return [
        actualPoint,
        {x:month,series:`${item}, 目标单价`,value:target},
        {x:month,series:`${item}, ${cadence==='annual'?'累计偏差幅度':'偏差幅度'}`,value:metricDeviation(actual,target,'price')},
      ];
    });
  });
}

function PriceComparisonChart({title,filters,cadence,items,selected,range,onRangeChange,isTos}:{title:string;filters:AnalysisFilters;cadence:PriceCadence;items:PriceTrendItem[];selected?:PriceTrendItem;range:number|'all';onRangeChange:(range:number|'all')=>void;isTos:boolean}) {
  const includeTargets=filters.targets.length>0;
  const chartItems=rankedTrendRows(items,range,row=>row[cadence==='annual'?'annualPrice':'monthPrice'],selected);
  const values=priceComparisonTrends(filters,cadence,chartItems,isTos,includeTargets);
  const series=unique(values.map(value=>value.series));
  const legendItems=unique(series.map(name=>name.split(', ')[0]));
  const singleItem=legendItems.length===1;
  const singleItemDrill=!!selected&&legendItems.length===1;
  return <AnalysisChart key={`${cadence}-${selected?.id||'all'}`} title={title} values={values} unit="人民币" legendReset
    titleExtra={selected?undefined:<TrendRangeControl range={range} rankingLabel="实际值" onChange={onRangeChange}/>}
    percentSeries={series.filter(name=>name.endsWith('偏差幅度'))}
    dashedSeries={series.filter(name=>!name.endsWith('测算单价'))}
    seriesColorIndexes={Object.fromEntries(series.map(name=>[name,
      singleItem&&name.endsWith('目标单价')&&cadence!=='annual'?(cadence==='month'?1:2):
      singleItemDrill&&name.endsWith('偏差幅度')?1:legendItems.indexOf(name.split(', ')[0])
    ]))}/>;
}

interface FormulaTargets {
  month: number | null;
  quarter: number | null;
  annual: number | null;
}
export interface FormulaNode { id: string; title: string; formula: string; value: number | null; type: 'price' | 'amount' | 'ratio' | 'quantity'; unit: string; status?: MetricTopologyNodeProps['status']; targets?: FormulaTargets; operator?: CalculationOperator; children?: FormulaNode[]; returnsMultipleRows?: boolean; }
const DEMO_FORMULA_SCOPE = { unit: 'bytegraph.cpu', area: 'ap', region: 'ap-1' };
const DEMO_ROOT_TREND: Record<string, { actual:number; month:number; quarter:number; annual:number }> = {
  '2026-01': {actual:.0428654670,month:.0416652339,quarter:.0416652339,annual:.0362600244},
  '2026-02': {actual:.0424707336,month:.0412390823,quarter:.0829043162,annual:.0362600244},
  '2026-03': {actual:.0396949564,month:.0385041077,quarter:.1214084240,annual:.0362600244},
  '2026-04': {actual:.0381397039,month:.0369573731,quarter:.0369573731,annual:.0362600244},
  '2026-05': {actual:.0362648439,month:.0355395470,quarter:.0724969201,annual:.0362600244},
  '2026-06': {actual:.0369245274,month:.0361491123,quarter:.1086460324,annual:.0362600244},
  '2026-07': {actual:.0356428009,month:.0348586593,quarter:.0348586593,annual:.0362600244},
  '2026-08': {actual:.0359460616,month:.0351193022,quarter:.0699779615,annual:.0362600244},
  '2026-09': {actual:.0338448634,month:.0330325867,quarter:.1030105481,annual:.0362600244},
};
// The CPU relationships and coefficients are screenshot examples. All changing scale values
// derive from the shared snapshot; this is not a confirmed live model or real pricing result.
function cpuTree(row: AnalysisRow): FormulaNode {
  const isDemoScope=row.unit===DEMO_FORMULA_SCOPE.unit&&row.area===DEMO_FORMULA_SCOPE.area&&row.region===DEMO_FORMULA_SCOPE.region&&row.month==='2026-09';
  const cost = row.cost, capacity = row.capacity;
  const unitCost = cost !== null && capacity ? cost / capacity : null;
  const saleRate = capacity ? row.quantity / capacity : null;
  const physicalCost = cost === null ? null : cost / .3912;
  const storageCost = snapshot.find(item => item.product === BYTEGRAPH && item.unit === 'bytegraph.storage' && item.month === row.month && item.area === row.area && item.region === row.region)?.cost ?? null;
  const otherDenominator = physicalCost === null || storageCost === null ? null : physicalCost + storageCost;
  const otherCost = otherDenominator === null ? null : otherDenominator * .0708;
  const root = unitCost !== null && saleRate ? unitCost / saleRate * (1 + .0708) * (1 + .03) : null;
  const physicalNode: FormulaNode = { id: 'physical', title: 'bytegraph_计算层资源_物理_成本', formula: '原始取数指标，无计算公式；取自原型成本快照推导', value: physicalCost, type: 'amount', unit: 'CNY', returnsMultipleRows: true };
  const normNode: FormulaNode = { id: 'normalization', title: 'bytegraph_CPU_MEM_归一化_成本_占比', formula: '文档截图示例系数，不作为有效线上版本', value: .3912, type: 'ratio', unit: '%' };
  const capacityNode: FormulaNode = { id: 'capacity', title: 'bytegraph_计算层资源_物理_容量', formula: '原始取数指标，无计算公式；取自原型物理容量快照', value: capacity, type: 'quantity', unit: '核·日' };
  const totalCostNode: FormulaNode = { id: 'totalCost', title: 'bytegraph_计算层资源_总成本', formula: '= bytegraph_计算层资源_物理_成本 × bytegraph_CPU_MEM_归一化_成本_占比', value: cost, type: 'amount', unit: 'CNY', operator: 'multiply', children: [physicalNode, normNode] };
  const quantityNode: FormulaNode = { id: 'quantity', title: 'bytegraph_计算层资源_售卖量', formula: '原始取数指标，无计算公式；取自原型售卖量快照', value: row.quantity, type: 'quantity', unit: '核·日' };
  const otherCostNode: FormulaNode = { id: 'otherCost', title: 'bytegraph_其他成本商品_成本', formula: '文档截图关系及原型快照示意，不作为实际归因金额', value: otherCost, type: 'amount', unit: 'CNY' };
  const otherDenominatorNode: FormulaNode = { id: 'otherDenominator', title: '计算层资源物理成本 + 存储资源总成本', formula: '= 计算层资源物理成本 + 存储资源总成本', value: otherDenominator, type: 'amount', unit: 'CNY', operator: 'add', children: [{ ...physicalNode, id: 'otherPhysical' }, { id: 'storageCost', title: 'bytegraph_存储资源_总成本', formula: '取自同账期、同大区、同区域原型存储成本快照', value: storageCost, type: 'amount', unit: 'CNY' }] };
  if(isDemoScope)return {
    id:'root',
    title:'bytegraph_计算层资源计费项_纯资源_单价',
    formula:'=bytegraph_计算层资源_单位成本 / bytegraph_计算层资源_综合_售卖率 * ( 1 + bytegraph_其他成本_加成_比例 ) * ( 1 + bytegraph_计算层资源_策略_加成_比例 )',
    value:.0338448634,
    type:'price',
    unit:'USD / 核·日',
    operator:'multiply',
    targets:{month:.0330325867,quarter:.1030105481,annual:.0362600244},
    children:[
      {
        id:'unitCost',
        title:'bytegraph_计算层资源_单位成本',
        formula:'=bytegraph_计算层资源_总成本 / bytegraph_计算层资源_物理_容量',
        value:.0311769443,
        type:'price',
        unit:'USD / 核·日',
        operator:'divide',
        targets:{month:.0302728129,quarter:.0923162954,annual:.0307884716},
        children:[totalCostNode,capacityNode],
      },
      {
        id:'saleRate',
        title:'bytegraph_计算层资源_综合_售卖率',
        formula:'=bytegraph_计算层资源_售卖量 / bytegraph_计算层资源_物理_容量',
        value:1.0159,
        type:'ratio',
        unit:'',
        operator:'divide',
        targets:{month:1.0393,quarter:3.0433,annual:.96646},
        children:[quantityNode,{...capacityNode,id:'saleCapacity'}],
      },
      {
        id:'otherRatio',
        title:'bytegraph_其他成本_加成_比例',
        formula:'=bytegraph_其他成本商品_成本 / ( bytegraph_计算层资源_物理_成本 + bytegraph_存储资源_总成本 )',
        value:.0707501,
        type:'ratio',
        unit:'',
        operator:'divide',
        targets:{month:.069126,quarter:.203549,annual:.0708421},
        children:[otherCostNode,otherDenominatorNode],
      },
      {
        id:'strategy',
        title:'bytegraph_计算层资源_策略_加成_比例',
        formula:'飞书表格实时值（按收入计费单元 / 大区 / 收入售卖区域匹配）',
        value:.03,
        type:'ratio',
        unit:'',
        targets:{month:.02934,quarter:.088105,annual:.029235},
      },
    ],
  };
  return { id: 'root', title: 'bytegraph_计算层资源计费项_单价', formula: '= 单位成本 / 综合售卖率 ×（1 + 其他成本加成比例）×（1 + 策略加成比例）', value: root, type: 'price', unit: 'CNY / 核·日', operator: 'multiply', children: [
    { id: 'unitCost', title: 'bytegraph_计算层资源_单位成本', formula: '= bytegraph_计算层资源_总成本 / bytegraph_计算层资源_物理_容量', value: unitCost, type: 'price', unit: 'CNY / 核·日', operator: 'divide', children: [totalCostNode, capacityNode] },
    { id: 'saleRate', title: 'bytegraph_计算层资源_综合_售卖率', formula: '= bytegraph_计算层资源_售卖量 / bytegraph_计算层资源_物理_容量', value: saleRate, type: 'ratio', unit: '%', operator: 'divide', children: [quantityNode, { ...capacityNode, id: 'saleCapacity' }] },
    { id: 'otherRatio', title: 'bytegraph_其他成本_加成_比例', formula: '= 其他成本商品成本 /（计算层资源物理成本 + 存储资源总成本）；截图示例系数', value: .0708, type: 'ratio', unit: '%', operator: 'divide', children: [otherCostNode,otherDenominatorNode] },
    { id: 'strategy', title: 'bytegraph_计算层资源_策略_加成_比例', formula: '文档截图示例系数；尚无有效目标或已核验线上版本', value: .03, type: 'ratio', unit: '%' },
  ] };
}
// References: none — PRD attachment establishes the TOS request relationship, not a verified model or coefficients.
function tosTree(row: AnalysisRow): FormulaNode {
  if (row.unit === 'Request') return { id: 'root', title: 'tos_Request_单价', formula: '= 请求成本 / 请求次数 ×（1 + 策略加成比例）；原型指标用于交互展示', value: normalizedPrice(row), type: 'price', unit: 'CNY / 万次', operator: 'divide', children: [
    { id: 'requestCost', title: 'TOS 请求成本', formula: '计费单元 × 大区口径的原型成本快照', value: row.cost, type: 'amount', unit: 'CNY' },
    { id: 'requestCount', title: 'TOS 请求次数', formula: '原型售卖量快照', value: row.quantity, type: 'quantity', unit: '次' },
    { id: 'strategy', title: 'TOS 策略加成比例', formula: '原型目标版本 V1 的策略加成示例', value: .025, type: 'ratio', unit: '%' },
  ] };
  return { id: 'root', title: `tos_${row.unit}_单价`, formula: '存储单价由各存储渠道单价与售卖份额加权后叠加策略加成；当前为原型快照', value: normalizedPrice(row), type: 'price', unit: 'CNY / 存储计费单位' };
}
function flattenTree(node: FormulaNode): FormulaNode[] { return [node, ...(node.children || []).flatMap(flattenTree)]; }
function formatNode(node: FormulaNode): string { return node.type === 'ratio' ? percent(node.value === null ? null : node.value * 100) : node.type === 'amount' ? amount(node.value) : node.type === 'price' ? priceFormat(node.value) : quantityFormat(node.value); }
function formulaTarget(node:FormulaNode,row:AnalysisRow,cadence:'month'|'quarter'|'annual') {
  if(node.targets)return node.targets[cadence];
  return prototypeTargetValue(node.value,row,`${cadence}-formula-${node.id}`,cadence==='annual'?.94:.92,cadence==='annual'?1.08:1.1);
}
const formatFormulaTarget=(node:FormulaNode,value:number|null)=>formatNode({...node,value});
const formulaDeviation=(node:FormulaNode,target:number|null,cadence:PriceCadence)=>{
  if(cadence==='annual'&&node.type==='ratio') {
    return node.value===null||target===null||!Number.isFinite(node.value)||!Number.isFinite(target)
      ?null:(node.value-target)*100;
  }
  return metricDeviation(node.value,target,node.type==='ratio'?'rate':'price');
};
const formulaDeviationText=(value:number|null,unit='%')=>value===null||!Number.isFinite(value)?'—':`${value>0?'+':''}${value.toFixed(2)}${unit}`;
function topologyDeviationFormula(node:FormulaNode,target:number|null,cadence:PriceCadence,deviation:number|null) {
  const period={month:'月度',quarter:'季度',annual:'年度'}[cadence];
  const isAnnualRatio=cadence==='annual'&&node.type==='ratio';
  const formula=isAnnualRatio
    ?'年度目标偏差 = 月度实际值 - 年度目标值'
    :`${period}${cadence==='annual'?'目标':''}偏差 =（当月实际值 - ${period}目标值）/ |${period}目标值| × 100%`;
  const formatOperand=(value:number|null)=>{
    if(value===null||!Number.isFinite(value))return '-';
    const number=(node.type==='ratio'?value*100:value).toLocaleString('zh-CN',{maximumFractionDigits:10});
    return `${number}${node.type==='ratio'?'%':node.unit?` ${node.unit}`:''}`;
  };
  const actualText=formatOperand(node.value),targetText=formatOperand(target);
  return <div className="income-metric-formula-details">
    {formula}{deviation!==null&&Number.isFinite(deviation)
      ?` = ${isAnnualRatio?`${actualText} - ${targetText}`:`(${actualText} - ${targetText}) / |${targetText}| × 100%`} ≈ ${formulaDeviationText(deviation,isAnnualRatio?'pp':'%')}`
      :` = -（实际值 ${actualText}，目标值 ${targetText}；${!isAnnualRatio&&target===0?'目标值为 0':'数据缺失'}，无法计算偏差）`}
  </div>;
}
const supportsMetricTrend = (node: FormulaNode) => node.id !== 'quantity' && node.id !== 'requestCount';
// Reference page: ByteGraph supports additive metrics; TOS supports every non-ratio metric.
const supportsDailyAverage = (node: FormulaNode | undefined, isTos: boolean) =>
  !!node && (isTos ? node.type !== 'ratio' : node.type === 'amount' || node.type === 'quantity');
const daysInMonth = (month: string) => {
  const [year, number] = month.split('-').map(Number);
  return new Date(year, number, 0).getDate();
};
type FormulaRenderContext = {
  row: AnalysisRow;
  expanded: Set<string>;
  toggle: (id: string) => void;
  onTrend: (id: string) => void;
  onDetails: (node: FormulaNode) => void;
  targets: string[];
};

function formulaMetricProps(node:FormulaNode,{row,expanded,toggle,onTrend,onDetails,targets}:FormulaRenderContext):MetricTopologyNodeProps {
  const monthlyTarget=formulaTarget(node,row,'month'),quarterlyTarget=formulaTarget(node,row,'quarter'),annualTarget=formulaTarget(node,row,'annual');
  const targetRows:MetricTopologyTarget[]=[
    ...(targets.includes('月度目标值')?[{id:'month' as const,label:'月度目标',target:monthlyTarget}]:[]),
    ...(targets.includes('季度目标值')?[{id:'quarter' as const,label:'季度目标',target:quarterlyTarget}]:[]),
    ...(targets.includes('年度目标值')?[{id:'annual' as const,label:'年度目标',target:annualTarget}]:[]),
  ].map(item=>{
    const deviation=formulaDeviation(node,item.target,item.id);
    return {
      id:item.id,
      label:item.label,
      value:formatFormulaTarget(node,item.target),
      deviation:formulaDeviationText(deviation,item.id==='annual'&&node.type==='ratio'?'pp':'%'),
      deviationValue:deviation,
      deviationFormula:topologyDeviationFormula(node,item.target,item.id,deviation),
    };
  });
  return {
    name:node.title,
    status:node.status,
    formula:node.formula,
    actualValue:formatNode(node),
    unit:node.unit,
    targets:targetRows,
    hasChildren:!!node.children?.length,
    expanded:expanded.has(node.id),
    showTrend:supportsMetricTrend(node),
    hasMultipleRows:node.returnsMultipleRows,
    onToggle:()=>toggle(node.id),
    onTrend:()=>onTrend(node.id),
    onViewDetails:()=>onDetails(node),
  };
}

function FormulaCard({node,context}:{node:FormulaNode;context:FormulaRenderContext}) {
  return <MetricTopologyNode nodeId={node.id} {...formulaMetricProps(node,context)}/>;
}

const FORMULA_NODE_WIDTH=300;
const FORMULA_NODE_BASE_HEIGHT=141;
const FORMULA_ITEM_GAP=16;
const FORMULA_LEVEL_GAP=80;
const FORMULA_GROUP_PADDING=34;
const FORMULA_GROUP_EXTRA_HEIGHT=34;

type ParsedFormulaItem=FormulaExpressionItem<FormulaNode>;
type FormulaItemSize={width:number;height:number};
type FormulaExpressionEntry={item:ParsedFormulaItem;cellX:number;cellWidth:number;visualX:number;visualY:number;size:FormulaItemSize};
type FormulaMetricAnchor={node:FormulaNode;itemId:string;centerX:number;topY:number};
type FormulaExpressionLayout={width:number;height:number;reference:number;entries:FormulaExpressionEntry[];anchors:FormulaMetricAnchor[]};
type FormulaCanvasExpression={id:string;level:number;items:ParsedFormulaItem[];layout:FormulaExpressionLayout;x:number;y:number};
type FormulaCanvasEdge={id:string;type:'smoothstep';source:string;sourceHandle:'bottom';target:string;sourceX:number;sourceY:number;targetX:number;targetY:number;centerY:number};
type FormulaHorizontalEdge={id:string;type:'straight';source:string;target:string;sourceHandle:'right';targetHandle:'left';sourceX:number;targetX:number;y:number};
const formulaCanvasItemId=(expressionId:string,itemId:string)=>`${expressionId}-${itemId}`;

function formulaSequenceSize(items:ParsedFormulaItem[],nodeHeight:number,inBracket=false,nodeWidth=FORMULA_NODE_WIDTH,groups=classicGroups):FormulaItemSize {
  if(groups.metric==='inset') return insetSequence(items,{...groups,metricWidth:nodeWidth,metricHeight:nodeHeight});
  const sizes=items.map(item=>formulaItemVisualSize(item,nodeHeight,inBracket,nodeWidth,groups));
  return {
    width:sizes.reduce((sum,size)=>sum+size.width,0)+Math.max(0,sizes.length-1)*FORMULA_ITEM_GAP,
    height:Math.max(0,...sizes.map(size=>size.height)),
  };
}

function formulaItemVisualSize(item:ParsedFormulaItem,nodeHeight:number,inBracket=false,nodeWidth=FORMULA_NODE_WIDTH,groups=classicGroups):FormulaItemSize {
  if(groups.metric==='inset'||(item.type==='function'||item.type==='expression')&&groups[item.type]==='inset')return insetItemSize(item,{...groups,metricWidth:nodeWidth,metricHeight:nodeHeight});
  if(item.type==='metric')return {width:nodeWidth,height:nodeHeight};
  if(item.type==='operator')return inBracket?{width:32,height:32}:{width:46,height:46};
  if(item.type==='constant')return {width:Math.max(32,String(item.value).length*8+22),height:32};
  const content=formulaSequenceSize(item.items,nodeHeight,item.type==='expression',nodeWidth,groups);
  if(groups[item.type]==='folder') return {
    width:Math.max(item.type==='function'?Math.max(120,formatFunctionNodeLabel(item.name).length*12+54):126,content.width+26),
    height:content.height+formulaGroupTopPadding(item.items,'folder',groups)+formulaGroupBottomPadding(
      item.items.map(child=>({type:child.type,hasChildren:child.type==='metric'&&!!child.node.children?.length})),'folder',
      item.type==='function'&&!(item.items.length===1&&item.items[0].type==='metric'),
    ),
  };
  const labelWidth=item.type==='function'?Math.max(88,formatFunctionNodeLabel(item.name).length*12+54):104;
  return {
    width:Math.max(labelWidth,content.width+FORMULA_GROUP_PADDING),
    height:content.height+FORMULA_GROUP_EXTRA_HEIGHT+formulaGroupTopPadding(item.items,'classic',groups)-FORMULA_GROUP_BASE_PADDING,
  };
}

function formulaItemBlockWidth(item:ParsedFormulaItem,expanded:Set<string>,nodeHeight:number,nodeWidth=FORMULA_NODE_WIDTH,groups=classicGroups):number {
  const visual=formulaItemVisualSize(item,nodeHeight,false,nodeWidth,groups).width;
  if(item.type==='metric'&&expanded.has(item.node.id)) {
    return Math.max(visual,buildFormulaExpressionLayout(parseFormulaExpression(item.node),expanded,nodeHeight,nodeWidth,groups).width);
  }
  if(item.type==='expression'||item.type==='function') {
    const nested=buildFormulaExpressionLayout(item.items,expanded,nodeHeight,nodeWidth,groups).width+(groups[item.type]==='inset'?20:groups[item.type]==='folder'?26:FORMULA_GROUP_PADDING);
    return Math.max(visual,nested);
  }
  return visual;
}

function visualMetricAnchors(items:ParsedFormulaItem[],originX:number,originY:number,nodeHeight:number,inBracket=false,nodeWidth=FORMULA_NODE_WIDTH,groups=classicGroups):FormulaMetricAnchor[] {
  const anchors:FormulaMetricAnchor[]=[];
  if(groups.metric==='inset'||groups.function==='inset'||groups.expression==='inset') {
    const sequence=insetSequence(items,{...groups,metricWidth:nodeWidth,metricHeight:nodeHeight},!inBracket&&groups.function==='inset');
    items.forEach((item,index)=>{
      const entry=sequence.entries[index],x=originX+entry.x,y=originY+entry.y;
      if(item.type==='metric') anchors.push({node:item.node,itemId:item.id,centerX:x+nodeWidth/2,topY:y});
      if(item.type==='function'||item.type==='expression')anchors.push(...visualMetricAnchors(item.items,x+10,y+40,nodeHeight,item.type==='expression',nodeWidth,groups));
    });
    return anchors;
  }
  const rowHeight=formulaSequenceSize(items,nodeHeight,inBracket,nodeWidth,groups).height;
  let cursor=originX;
  items.forEach(item=>{
    const size=formulaItemVisualSize(item,nodeHeight,inBracket,nodeWidth,groups);
    const topY=originY+(rowHeight-size.height)/2;
    if(item.type==='metric')anchors.push({node:item.node,itemId:item.id,centerX:cursor+nodeWidth/2,topY});
    if(item.type==='expression'||item.type==='function') {
      const folder=groups[item.type]==='folder';
      anchors.push(...visualMetricAnchors(item.items,cursor+(folder?13:17),topY+(folder?0:1)+formulaGroupTopPadding(item.items,groups[item.type],groups),nodeHeight,item.type==='expression',nodeWidth,groups));
    }
    cursor+=size.width+FORMULA_ITEM_GAP;
  });
  return anchors;
}

function buildFormulaExpressionLayout(items:ParsedFormulaItem[],expanded:Set<string>,nodeHeight:number,nodeWidth=FORMULA_NODE_WIDTH,groups=classicGroups):FormulaExpressionLayout {
  const entries:FormulaExpressionEntry[]=[];
  const anchors:FormulaMetricAnchor[]=[];
  let cursor=0;
  const sequence=groups.metric==='inset'?insetSequence(items,{...groups,metricWidth:nodeWidth,metricHeight:nodeHeight}):undefined;
  const height=sequence?.height??formulaSequenceSize(items,nodeHeight,false,nodeWidth,groups).height;
  items.forEach((item,index)=>{
    const size=formulaItemVisualSize(item,nodeHeight,false,nodeWidth,groups);
    const cellWidth=formulaItemBlockWidth(item,expanded,nodeHeight,nodeWidth,groups);
    const visualX=cursor+(cellWidth-size.width)/2;
    const visualY=sequence?.entries[index].y??(height-size.height)/2;
    entries.push({item,cellX:cursor,cellWidth,visualX,visualY,size});
    if(item.type==='metric')anchors.push({node:item.node,itemId:item.id,centerX:visualX+nodeWidth/2,topY:visualY});
    if(item.type==='expression'||item.type==='function') {
      const folder=groups[item.type]==='folder',inset=groups[item.type]==='inset';
      anchors.push(...visualMetricAnchors(item.items,visualX+(inset?10:folder?13:17),visualY+(inset?40:(folder?0:1)+formulaGroupTopPadding(item.items,groups[item.type],groups)),nodeHeight,item.type==='expression',nodeWidth,groups));
    }
    cursor+=cellWidth+FORMULA_ITEM_GAP;
  });
  // Operand positions are final before placing each binary operator between
  // their visible borders, independently of the widths reserved for children.
  entries.forEach((entry,index)=>{
    const left=entries[index-1],right=entries[index+1];
    if(entry.item.type==='operator'&&left&&right&&left.item.type!=='operator'&&right.item.type!=='operator') {
      entry.visualX=(left.visualX+left.size.width+right.visualX)/2-entry.size.width/2;
    }
  });
  return {width:Math.max(0,cursor-(items.length?FORMULA_ITEM_GAP:0)),height,reference:sequence?.reference??height/2,entries,anchors};
}

function bracketItem(item:ParsedFormulaItem,context:FormulaRenderContext,expressionId:string):BracketExpressionItem {
  const id=formulaCanvasItemId(expressionId,item.id);
  if(item.type==='metric')return {id,type:'metric',content:<MetricTopologyNode nodeId={id} {...formulaMetricProps(item.node,context)}/>};
  if(item.type==='constant')return {id,type:'constant',value:item.value};
  if(item.type==='operator')return {id,type:'operator',operator:item.operator};
  if(item.type==='expression')return {id,type:'expression',items:item.items.map(child=>bracketItem(child,context,expressionId))};
  return {id,type:'function',content:formulaExpressionItem(item,context,id,expressionId)};
}

function functionItem(item:ParsedFormulaItem,context:FormulaRenderContext,expressionId:string):FunctionFormulaItem {
  const id=formulaCanvasItemId(expressionId,item.id);
  if(item.type==='metric')return {id,type:'metric',metric:{nodeId:id,...formulaMetricProps(item.node,context)}};
  if(item.type==='constant')return {id,type:'constant',value:item.value};
  if(item.type==='operator')return {id,type:'operator',operator:item.operator};
  if(item.type==='expression')return {id,type:'expression',expression:{nodeId:id,items:item.items.map(child=>bracketItem(child,context,expressionId))}};
  return {id,type:'function',name:item.name,items:item.items.map(child=>functionItem(child,context,expressionId))};
}

function formulaExpressionItem(item:ParsedFormulaItem,context:FormulaRenderContext,nodeId:string,expressionId:string) {
  if(item.type==='metric')return <MetricTopologyNode nodeId={nodeId} {...formulaMetricProps(item.node,context)}/>;
  if(item.type==='constant')return <ConstantTopologyNode value={item.value}/>;
  if(item.type==='operator')return <CalculationOperatorNode nodeId={nodeId} operator={item.operator}/>;
  if(item.type==='expression')return <BracketExpressionNode nodeId={nodeId} items={item.items.map(child=>bracketItem(child,context,expressionId))}/>;
  if(item.items.length===1&&item.items[0].type==='metric') {
    const metricItem=item.items[0];
    return <FunctionTopologyNode nodeId={nodeId} name={item.name} variant="metric" metric={{nodeId:formulaCanvasItemId(expressionId,metricItem.id),...formulaMetricProps(metricItem.node,context)}}/>;
  }
  return <FunctionTopologyNode nodeId={nodeId} name={item.name} variant="formula" items={item.items.map(child=>functionItem(child,context,expressionId))}/>;
}

function buildFormulaCanvas(root:FormulaNode,expanded:Set<string>,targetCount:number,nodeWidth=FORMULA_NODE_WIDTH,groups=classicGroups,formulaGap=10) {
  const nodeHeight=FORMULA_NODE_BASE_HEIGHT+targetCount*24+formulaGap-10-(groups.metric==='inset'?2:0);
  const expressions:FormulaCanvasExpression[]=[];
  const edges:FormulaCanvasEdge[]=[];
  const horizontalEdges:FormulaHorizontalEdge[]=[];
  const visited=new Set<string>();
  const levelReferences:number[]=[];
  if(groups.metric==='inset') {
    const collect=(node:FormulaNode,level:number)=>{
      if(!expanded.has(node.id))return;
      const items=parseFormulaExpression(node);
      const sequence=insetSequence(items,{...groups,metricWidth:nodeWidth,metricHeight:nodeHeight});
      levelReferences[level]=Math.max(levelReferences[level]??0,sequence.reference);
      const visit=(entries:ParsedFormulaItem[])=>entries.forEach(item=>{
        if(item.type==='metric')collect(item.node,level+1);
        else if(item.type==='function'||item.type==='expression')visit(item.items);
      });
      visit(items);
    };
    collect(root,1);
  }

  const placeExpression=(node:FormulaNode,parentCenterX:number,parentY:number,path:string,sourceNodeId:string,level=1)=>{
    if(!expanded.has(node.id)||visited.has(`${path}:${node.id}`))return;
    visited.add(`${path}:${node.id}`);
    const items=parseFormulaExpression(node);
    const layout=buildFormulaExpressionLayout(items,expanded,nodeHeight,nodeWidth,groups);
    let x=parentCenterX-layout.width/2;
    const rowTop=parentY+nodeHeight+FORMULA_LEVEL_GAP;
    const y=rowTop+(groups.metric==='inset'?(levelReferences[level]??layout.reference)-layout.reference:0);
    // Nested operands share a compact visible row. Reserve separate drill-down
    // rows while retaining the actual parent anchors and their alignment.
    if(groups.metric==='inset') {
      const occupied=expressions.filter(other=>y<other.y+other.layout.height&&y+layout.height>other.y)
        .sort((left,right)=>left.x-right.x);
      for(const other of occupied) {
        if(x<other.x+other.layout.width+FORMULA_ITEM_GAP&&x+layout.width>other.x-FORMULA_ITEM_GAP) {
          x=other.x+other.layout.width+FORMULA_ITEM_GAP;
        }
      }
    }
    const expressionId=`${path}-${node.id}`;
    expressions.push({id:expressionId,level,items,layout,x,y});
    layout.entries.slice(1).forEach((right,index)=>{
      const left=layout.entries[index];
      const sourceX=x+left.visualX+left.size.width;
      const targetX=x+right.visualX;
      if(targetX-sourceX<=30)return;
      horizontalEdges.push({
        id:`${expressionId}-horizontal-${left.item.id}-${right.item.id}`,
        type:'straight',
        source:formulaCanvasItemId(expressionId,left.item.id),
        target:formulaCanvasItemId(expressionId,right.item.id),
        sourceHandle:'right',
        targetHandle:'left',
        sourceX,targetX,y:y+layout.reference,
      });
    });
    layout.entries.forEach(entry=>{
      if(entry.item.type==='operator')return;
      edges.push({
        id:`${path}-${node.id}-${entry.item.id}`,
        type:'smoothstep',
        source:sourceNodeId,
        sourceHandle:'bottom',
        target:formulaCanvasItemId(expressionId,entry.item.id),
        sourceX:parentCenterX,
        sourceY:parentY+nodeHeight+METRIC_SOURCE_OFFSET+(groups.metric==='inset'?2:0),
        targetX:x+entry.visualX+entry.size.width/2,
        targetY:y+entry.visualY+((entry.item.type==='function'||entry.item.type==='expression')&&groups[entry.item.type]==='folder'?26:0),
        centerY:rowTop-FORMULA_LEVEL_GAP/2,
      });
    });
    layout.anchors.forEach(anchor=>{
      const cardId=formulaCanvasItemId(expressionId,anchor.itemId);
      placeExpression(anchor.node,x+anchor.centerX,y+anchor.topY,cardId,cardId,level+1);
    });
  };

  placeExpression(root,0,0,'root',root.id);
  const minX=Math.min(-nodeWidth/2,...expressions.map(item=>item.x));
  const maxX=Math.max(nodeWidth/2,...expressions.map(item=>item.x+item.layout.width));
  const maxY=Math.max(nodeHeight,...expressions.map(item=>item.y+item.layout.height));
  const offsetX=48-minX;
  const offsetY=48;
  return {
    rootX:offsetX-nodeWidth/2,
    rootY:offsetY,
    expressions:expressions.map(item=>({...item,x:item.x+offsetX,y:item.y+offsetY})),
    edges:edges.map(edge=>({
      ...edge,
      sourceX:edge.sourceX+offsetX,
      sourceY:edge.sourceY+offsetY,
      targetX:edge.targetX+offsetX,
      targetY:edge.targetY+offsetY,
      centerY:edge.centerY+offsetY,
    })),
    horizontalEdges:horizontalEdges.map(edge=>({
      ...edge,sourceX:edge.sourceX+offsetX,targetX:edge.targetX+offsetX,y:edge.y+offsetY,
    })),
    nodeHeight,
    width:maxX-minX+96,
    height:maxY+96,
  };
}

function FormulaExpressionRow({expression,context}:{expression:FormulaCanvasExpression;context:FormulaRenderContext}) {
  return <div className="formula-expression-row" data-formula-level={expression.level} style={{width:expression.layout.width,height:expression.layout.height}} onPointerDown={event=>event.stopPropagation()}>
    {expression.layout.entries.map(entry=><div
      className={`formula-expression-cell is-${entry.item.type}`}
      style={{left:entry.visualX,top:entry.visualY,width:entry.size.width,height:entry.size.height}}
      data-node-id={formulaCanvasItemId(expression.id,entry.item.id)}
      key={entry.item.id}
    >
      {formulaExpressionItem(entry.item,context,formulaCanvasItemId(expression.id,entry.item.id),expression.id)}
    </div>)}
  </div>;
}

export function FormulaCanvas({tree,row,expanded,toggle,onTrend,onDetails=()=>{},detailsOpen=false,targets,height,allowFullscreen=true,viewport,onViewportChange,metricNodeWidth=FORMULA_NODE_WIDTH,groupStyle=classicGroups,minZoom=.25,metricFormulaGap=10}:{tree:FormulaNode;row:AnalysisRow;expanded:Set<string>;toggle:(id:string)=>void;onTrend:(id:string)=>void;onDetails?:(node:FormulaNode)=>void;detailsOpen?:boolean;targets:string[];height?:string;allowFullscreen?:boolean;viewport?:TopologyCanvasViewport;onViewportChange?:(viewport:TopologyCanvasViewport)=>void;metricNodeWidth?:number;groupStyle?:FormulaGroupStyle;minZoom?:number;metricFormulaGap?:number}) {
  const connectorId=`formula-canvas-connector-${useId().replace(/:/g,'')}`;
  const [fullscreen,setFullscreen]=useState(false);
  const canvasAnchorRef=useRef<HTMLDivElement>(null);
  const pendingActionRef=useRef<{type:'trend';id:string}|null>(null);
  const closeFullscreen=()=>setFullscreen(false);
  const handleTrend=(id:string)=>{
    if(!fullscreen){onTrend(id);return;}
    pendingActionRef.current={type:'trend',id};
    closeFullscreen();
  };
  const graph=useMemo(()=>buildFormulaCanvas(tree,expanded,targets.length,metricNodeWidth,groupStyle,metricFormulaGap),[tree,expanded,targets.length,metricNodeWidth,groupStyle,metricFormulaGap]);
  const context={row,expanded,toggle,onTrend:handleTrend,onDetails,targets};
  const canvas=<FormulaGroupContext.Provider value={{...groupStyle,metricWidth:metricNodeWidth,metricHeight:graph.nodeHeight}}><TopologyCanvasShell
    title="指标公式"
    className="pricing-formula-flow"
    height={fullscreen?'100%':height || 'calc(100vh - 300px)'}
    minHeight={0}
    canvasWidth={graph.width}
    canvasHeight={graph.height}
    minZoom={minZoom}
    maxZoom={1.4}
    showLegend={false}
    viewport={viewport}
    onViewportChange={onViewportChange}
    isFullscreen={fullscreen}
    onToggleFullscreen={allowFullscreen?()=>fullscreen?closeFullscreen():setFullscreen(true):undefined}
  >
    <defs>
      <marker
        id={connectorId}
        markerWidth="13"
        markerHeight="12"
        refX="6.5"
        refY="9.5"
        orient="0"
        markerUnits="userSpaceOnUse"
        viewBox="0 0 13 12"
      >
        <path
          d="M1.33096 3.25674C1.74145 2.8873 2.3736 2.9205 2.74307 3.33096L5.75664 6.67903C6.15388 7.12036 6.84592 7.12036 7.24316 6.67903L10.2567 3.33096C10.6262 2.9205 11.2584 2.8873 11.6688 3.25674C12.0793 3.62621 12.1125 4.25836 11.7431 4.66885L7.98623 8.84268C7.19174 9.72544 5.80806 9.72544 5.01357 8.84268L1.25674 4.66885C0.887298 4.25836 0.9205 3.62621 1.33096 3.25674Z"
          className="formula-canvas-connector-end"
        />
      </marker>
    </defs>
    <g className="formula-canvas-edges">
      {graph.horizontalEdges.map(edge=><path
        key={edge.id}
        d={`M ${edge.sourceX} ${edge.y} L ${edge.targetX} ${edge.y}`}
        className="formula-horizontal-edge"
        data-type={edge.type}
        data-source={edge.source}
        data-target={edge.target}
        data-source-handle={edge.sourceHandle}
        data-target-handle={edge.targetHandle}
      />)}
    </g>
    <g className="formula-canvas-nodes">
      <foreignObject x={graph.rootX} y={graph.rootY} width={metricNodeWidth} height={graph.nodeHeight}>
        <div className="formula-canvas-node" onPointerDown={event=>event.stopPropagation()}>
          <FormulaCard node={tree} context={context}/>
        </div>
      </foreignObject>
      {graph.expressions.map(expression=><foreignObject
        key={expression.id}
        x={expression.x}
        y={expression.y}
        width={expression.layout.width}
        height={expression.layout.height}
      >
        <FormulaExpressionRow expression={expression} context={context}/>
      </foreignObject>)}
    </g>
    {/* SVG paints in document order: drill-down edges must cross group frames. */}
    <g className="formula-canvas-edges formula-canvas-drill-edges" data-z-index="10">
      {graph.edges.map(edge=>{
        const [path]=getSmoothStepPath({
          sourceX:edge.sourceX,
          sourceY:edge.sourceY,
          sourcePosition:Position.Bottom,
          targetX:edge.targetX,
          targetY:edge.targetY,
          targetPosition:Position.Top,
          centerY:edge.centerY,
          borderRadius:16,
        });
        return <path
          key={edge.id}
          d={path}
          className="formula-canvas-edge"
          data-source={edge.source}
          data-source-handle={edge.sourceHandle}
          data-target={edge.target}
          data-type={edge.type}
          data-beam-y={edge.centerY}
          markerEnd={`url(#${connectorId})`}
        />;
      })}
    </g>
  </TopologyCanvasShell></FormulaGroupContext.Provider>;
  return <>
    <div ref={canvasAnchorRef} className="pricing-formula-canvas-anchor">
      {fullscreen?<div className="pricing-formula-canvas-placeholder" aria-hidden="true"/>:canvas}
    </div>
    <Modal
      className="pricing-formula-fullscreen-modal"
      style={{display:'inline-flex'}}
      wrapStyle={{padding:0}}
      closable={false}
      modalRender={modal=>React.isValidElement(modal)
        ?React.cloneElement(modal as React.ReactElement<{'aria-label'?:string}>,{'aria-label':'指标公式'})
        :modal}
      visible={fullscreen}
      focusLock={!detailsOpen}
      escToExit={!detailsOpen}
      alignCenter
      unmountOnExit
      footer={null}
      onCancel={closeFullscreen}
      afterClose={()=>{
        const action=pendingActionRef.current;
        pendingActionRef.current=null;
        if(action?.type==='trend')onTrend(action.id);
        else canvasAnchorRef.current?.querySelector<HTMLButtonElement>('button[aria-label="全屏"]')?.focus({preventScroll:true});
      }}
    >
      {fullscreen&&<div className="analysis-page pricing-formula-fullscreen-page">{canvas}</div>}
    </Modal>
  </>;
}

export default function PricingTab({ filters, topologyOnly = false }: AnalysisProps & { topologyOnly?: boolean }) {
  const isTos = filters.product === TOS;
  const supported = filters.product === BYTEGRAPH || isTos;
  const rows = useMemo(() => getRows(filters), [filters]);
  const filterKey = JSON.stringify(filters);
  const formulaScopeKey = JSON.stringify({ ...filters, targets: undefined });
  const [priceSort, setPriceSort] = useState<SortState>({ key: 'monthDeviation', order: 'descend' });
  const [formulaUnit, setFormulaUnit] = useState(DEMO_FORMULA_SCOPE.unit);
  const [formulaArea, setFormulaArea] = useState(DEMO_FORMULA_SCOPE.area);
  const [formulaRegion, setFormulaRegion] = useState(DEMO_FORMULA_SCOPE.region);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['root']));
  const [metric, setMetric] = useState('root');
  const [metricSort, setMetricSort] = useState<SortState>({ key: 'deviation', order: 'descend' });
  const [evidence, setEvidence] = useState(false);
  const [detailNode, setDetailNode] = useState<FormulaNode | null>(null);
  const [timeGrain, setTimeGrain] = useState<'month' | 'day'>('month');
  const [aggregation, setAggregation] = useState<'total' | 'dailyAverage'>('total');
  const [trendMonthRange, setTrendMonthRange] = useState<string[]>([`${filters.month.slice(0, 4)}-01`, filters.month]);
  const monthlyTargets = filters.targets.includes('月度目标值');
  const quarterlyTargets = filters.targets.includes('季度目标值');
  const annualTargets = filters.targets.includes('年度目标值');
  const hasTargets = filters.targets.length > 0;
  const availableUnits = unique(rows.map(row => row.unit));
  const activeUnit = availableUnits.includes(formulaUnit) ? formulaUnit : availableUnits[0] || '';
  const availableAreas = unique(rows.filter(row => row.unit === activeUnit).map(row => row.area));
  const activeArea = availableAreas.includes(formulaArea) ? formulaArea : availableAreas[0] || '';
  const availableRegions = unique(rows.filter(row => row.unit === activeUnit && row.area === activeArea).map(row => row.region));
  const activeRegion = availableRegions.includes(formulaRegion) ? formulaRegion : availableRegions[0] || '';
  const formulaRow = rows.find(row => row.unit === activeUnit && row.area === activeArea && row.region === activeRegion);
  const tree = formulaRow ? isTos ? tosTree(formulaRow) : filters.product === BYTEGRAPH && activeUnit === 'bytegraph.cpu' ? cpuTree(formulaRow) : null : null;
  const nodes = tree ? flattenTree(tree).filter(supportsMetricTrend) : [];
  const selectedNode = nodes.find(node => node.id === metric) || nodes[0];
  const canUseDailyAverage = supportsDailyAverage(selectedNode, isTos);
  const dailyAverage = timeGrain === 'month' && canUseDailyAverage && aggregation === 'dailyAverage';
  useEffect(() => {
    setTrendMonthRange([`${filters.month.slice(0, 4)}-01`, filters.month]);
  }, [filterKey]);
  useEffect(() => {
    if (!canUseDailyAverage || timeGrain !== 'month') setAggregation('total');
  }, [canUseDailyAverage, selectedNode?.id, timeGrain]);
  const monthlyFormulaRows = unique(snapshot.map(row => row.month)).sort().filter(month =>
    trendMonthRange.length !== 2 || (month >= trendMonthRange[0] && month <= trendMonthRange[1])
  ).flatMap(month => {
    const row = getRows(filters, month).find(item => item.unit === activeUnit && item.area === activeArea && (isTos || item.region === activeRegion));
    if (!row || (!isTos && activeUnit !== 'bytegraph.cpu')) return [];
      const demoRoot=metric==='root'&&activeUnit===DEMO_FORMULA_SCOPE.unit&&activeArea===DEMO_FORMULA_SCOPE.area&&activeRegion===DEMO_FORMULA_SCOPE.region
        ?DEMO_ROOT_TREND[month]
        :undefined;
      if(demoRoot)return [{
        id:`${row.id}-${metric}`,
        month,
        unit:row.unit,
        area:row.area,
        region:row.region,
        unitLabel:'USD / 核·日',
        actual:demoRoot.actual,
        target:demoRoot.month,
        deviation:metricDeviation(demoRoot.actual,demoRoot.month,'price'),
        quarterTarget:demoRoot.quarter,
        quarterDeviation:metricDeviation(demoRoot.actual,demoRoot.quarter,'price'),
        annualActual:null,
        annualTarget:demoRoot.annual,
        annualDeviation:null,
      }];
    const monthTree = isTos ? tosTree(row) : cpuTree(row);
    const node = flattenTree(monthTree).filter(supportsMetricTrend).find(item => item.id === selectedNode?.id) || monthTree;
    const actual=node.value===null?null:node.type==='ratio'?node.value*100:node.value;
    const monthlyTarget=formulaTarget(node,row,'month'),quarterTarget=formulaTarget(node,row,'quarter'),annualTarget=formulaTarget(node,row,'annual');
    const normalizedTarget=(value:number|null)=>value===null?null:node.type==='ratio'?value*100:value;
    const annualActual=actual===null?null:['amount','quantity'].includes(node.type)?actual*Number(month.slice(-2)):actual;
    const normalizedAnnualTarget=annualTarget===null?null:['amount','quantity'].includes(node.type)?normalizedTarget(annualTarget)!*12:normalizedTarget(annualTarget);
    return [{ id: `${row.id}-${metric}`, month, unit: row.unit, area: row.area, region: isTos ? '' : row.region, unitLabel: node.unit, actual, target: normalizedTarget(monthlyTarget), deviation: metricDeviation(actual,normalizedTarget(monthlyTarget),node.type==='ratio'?'rate':'price'), quarterTarget: normalizedTarget(quarterTarget), quarterDeviation: metricDeviation(actual,normalizedTarget(quarterTarget),node.type==='ratio'?'rate':'price'), annualActual, annualTarget: normalizedAnnualTarget, annualDeviation: metricDeviation(annualActual,normalizedAnnualTarget,node.type==='ratio'?'rate':'price') }];
  }).map(row => {
    if (!dailyAverage) return row;
    const divide = (value: number | null) => value === null ? null : value / daysInMonth(row.month);
    return {
      ...row,
      actual: divide(row.actual),
      target: divide(row.target),
      quarterTarget: divide(row.quarterTarget),
      annualActual: divide(row.annualActual),
      annualTarget: divide(row.annualTarget),
    };
  });
  const metricSeries = ['实际值', ...(monthlyTargets ? ['月度目标'] : []), ...(quarterlyTargets ? ['季度目标'] : []), ...(annualTargets ? ['年度目标'] : [])];
  const metricTrendValues: ChartValue[] = monthlyFormulaRows.flatMap(row => metricSeries.map(series => ({
    x: row.month,
    series,
    value: series === '实际值' ? row.actual : series === '月度目标' ? row.target : series === '季度目标' ? row.quarterTarget : row.annualTarget,
  })));
  const metricUnavailable = timeGrain === 'day';
  const metricUnavailableText = '按天粒度暂未接入，暂无可展示的日趋势与明细；请切换“按月”查看。';
  useEffect(() => { setPriceSort({ key: 'monthDeviation', order: 'descend' }); setMetric('root'); setTimeGrain('month'); setAggregation('total'); }, [filterKey]);
  useEffect(() => { setExpanded(new Set(['root'])); }, [formulaScopeKey]);
  useEffect(() => { setExpanded(new Set(['root'])); setMetric('root'); setMetricSort({ key: 'deviation', order: 'descend' }); }, [activeUnit, activeArea, activeRegion]);
  useEffect(() => { setMetricSort({ key: 'deviation', order: 'descend' }); }, [metric]);
  const toggle = (id: string) => setExpanded(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const showTrend = (id: string) => { setMetric(id); setTimeout(() => document.getElementById('pricing-metric-trend')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80); };
  const detailRows = detailNode ? rows
    .filter(row => row.unit === activeUnit && row.area === activeArea)
    .flatMap(row => {
      const rowTree = isTos ? tosTree(row) : row.unit === 'bytegraph.cpu' ? cpuTree(row) : null;
      const node = rowTree ? flattenTree(rowTree).find(item => item.id === detailNode.id) : null;
      if (!node) return [];
      const normalize = (value:number|null) => value === null ? null : node.type === 'ratio' ? value * 100 : value;
      const actual = normalize(node.value);
      const monthTarget = normalize(formulaTarget(node,row,'month'));
      const quarterTarget = normalize(formulaTarget(node,row,'quarter'));
      const annualTarget = normalize(formulaTarget(node,row,'annual'));
      return [{
        id:`${row.id}-${node.id}`,
        unit:row.unit,
        area:row.area,
        region:isTos ? '-' : row.region,
        unitLabel:node.unit,
        actual,
        monthTarget,
        monthDeviation:metricDeviation(actual,monthTarget,node.type === 'ratio' ? 'rate' : 'price'),
        quarterTarget,
        quarterDeviation:metricDeviation(actual,quarterTarget,node.type === 'ratio' ? 'rate' : 'price'),
        annualTarget,
        annualDeviation:metricDeviation(actual,annualTarget,node.type === 'ratio' ? 'rate' : 'price'),
      }];
    }) : [];
  const detailValue = (value:number|null) => detailNode?.type === 'ratio'
    ? tablePercent(value)
    : detailNode?.type === 'amount'
      ? tableAmount(value)
      : detailNode?.type === 'quantity'
        ? tableQuantity(value)
        : tablePrice(value);
  const detailColumns:any[] = [
    {title:'计费单元',dataIndex:'unit',width:170,fixed:'left'},
    {title:'大区',dataIndex:'area',width:100,fixed:'left'},
    {title:'收入售卖区域',dataIndex:'region',width:160,fixed:'left'},
    {title:'单位',dataIndex:'unitLabel',width:140},
    {title:'实际值',dataIndex:'actual',width:150,render:detailValue},
    ...(monthlyTargets?[
      {title:'月度目标',dataIndex:'monthTarget',width:150,render:detailValue},
      {title:'月度目标偏差幅度',dataIndex:'monthDeviation',width:180,render:trendPercent},
    ]:[]),
    ...(quarterlyTargets?[
      {title:'季度目标',dataIndex:'quarterTarget',width:150,render:detailValue},
      {title:'季度目标偏差幅度',dataIndex:'quarterDeviation',width:180,render:trendPercent},
    ]:[]),
    ...(annualTargets?[
      {title:'年度目标',dataIndex:'annualTarget',width:150,render:detailValue},
      {title:'年度目标偏差幅度',dataIndex:'annualDeviation',width:180,render:trendPercent},
    ]:[]),
  ];
  const priceRows: PriceRow[] = rows.map(row => {
    const price=normalizedPrice(row),monthTarget=targetPrice(row,'month'),quarterTarget=targetPrice(row,'quarter'),annualTarget=targetPrice(row,'annual');
    return {...row,price,monthTarget,monthDeviation:metricDeviation(price,monthTarget,'price'),quarterTarget,quarterDeviation:metricDeviation(price,quarterTarget,'price'),annualTarget,annualDeviation:metricDeviation(row.cumulativePrice,annualTarget,'price')};
  });
  const sortedPrices = sortRows(priceRows, priceSort);
  const trendItems = priceTrendItems(rows,isTos);
  const priceTrendView = useTableTrend(trendItems,filterKey);
  const trendItemByDimension = new Map(trendItems.map(item=>[item.id,item]));
  const priceDimensionCell = (value:string,row:PriceRow,key:'area'|'region') => {
    const text=<OverflowText>{value}</OverflowText>;
    if(key!==(isTos?'area':'region'))return text;
    const item=trendItemByDimension.get(priceDimensionKey(row,isTos));
    return <span className="analysis-trend-dimension">{text}{item&&<TrendDrillIcon
      label={priceDimensionLabel(item,isTos)}
      onClick={()=>priceTrendView.drill(item)}
    />}</span>;
  };
  const priceColumns: any[] = [
    { title: '账期月份', dataIndex: 'month', width: 120, fixed: 'left', ...sortColumn('month', priceSort) },
    { title: '计费单元', dataIndex: 'unit', width: 170, fixed: 'left' },
    { title: '大区', dataIndex: 'area', width: 100, fixed: 'left', render: (value:string,row:PriceRow)=>priceDimensionCell(value,row,'area') },
    ...(!isTos?[{ title: '售卖区域', dataIndex: 'region', width: 160, fixed: 'left', render: (value:string,row:PriceRow)=>priceDimensionCell(value,row,'region') }]:[]),
    { title: '月度测算单价', dataIndex: 'price', width: 165, ...sortColumn('price', priceSort), render: tablePrice },
    { title: '单位', width: 170, className: 'pricing-price-unit', render: (_: any, row: AnalysisRow) => <span className={`pricing-nowrap pricing-price-unit-text ${isTos ? 'pricing-price-unit-tos' : ''}`}>{currencyUnit(row)}</span> },
    ...(monthlyTargets ? [
        { title: '月度目标单价', dataIndex: 'monthTarget', width: 150, ...sortColumn('monthTarget', priceSort), render: tablePrice },
        { title: priceDeviationHeader('月度偏差幅度','月度偏差幅度 =（月度测算单价 - 月度目标单价）/ 月度目标单价 × 100%'), dataIndex: 'monthDeviation', width: 160, ...sortColumn('monthDeviation', priceSort), render: trendPercent },
    ] : []),
    ...(quarterlyTargets ? [
        { title: '季度目标单价', dataIndex: 'quarterTarget', width: 150, ...sortColumn('quarterTarget', priceSort), render: tablePrice },
        { title: '季度偏差幅度', dataIndex: 'quarterDeviation', width: 140, ...sortColumn('quarterDeviation', priceSort), render: trendPercent },
    ] : []),
    { title: '年度累计测算单价', dataIndex: 'cumulativePrice', width: 180, ...sortColumn('cumulativePrice', priceSort), render: tablePrice },
    ...(annualTargets ? [
        { title: '年度目标单价', dataIndex: 'annualTarget', width: 150, ...sortColumn('annualTarget', priceSort), render: tablePrice },
        { title: priceDeviationHeader('年度累计偏差幅度','年度累计偏差幅度 =（年度累计测算单价 - 年度目标单价）/ 年度目标单价 × 100%。'), dataIndex: 'annualDeviation', width: 190, ...sortColumn('annualDeviation', priceSort), render: trendPercent },
    ] : []),
    { title: '计费方式', width: 135, className: 'pricing-billing-method', render: () => <span className="pricing-nowrap pricing-billing-method-text">按加和量日结</span> },
  ];
  const priceTrendColumns=hasTargets?[monthlyTargets,quarterlyTargets,annualTargets].filter(Boolean).length:2;
  const priceTrend = <div className="analysis-chart-grid" data-testid="pricing-price-trends" style={{gridTemplateColumns:`repeat(${Math.max(1,priceTrendColumns)},minmax(0,1fr))`}}>
    {!hasTargets && <>
      <PriceComparisonChart title="月度测算单价趋势" filters={filters} cadence="month" items={trendItems} selected={priceTrendView.selected} range={priceTrendView.range('month')} onRangeChange={value=>priceTrendView.setRange('month',value)} isTos={isTos}/>
      <PriceComparisonChart title="年度累计测算单价趋势" filters={filters} cadence="annual" items={trendItems} selected={priceTrendView.selected} range={priceTrendView.range('annual')} onRangeChange={value=>priceTrendView.setRange('annual',value)} isTos={isTos}/>
    </>}
    {monthlyTargets && <PriceComparisonChart title="月度目标偏差趋势" filters={filters} cadence="month" items={trendItems} selected={priceTrendView.selected} range={priceTrendView.range('month')} onRangeChange={value=>priceTrendView.setRange('month',value)} isTos={isTos}/>}
    {quarterlyTargets && <PriceComparisonChart title="季度目标偏差趋势" filters={filters} cadence="quarter" items={trendItems} selected={priceTrendView.selected} range={priceTrendView.range('quarter')} onRangeChange={value=>priceTrendView.setRange('quarter',value)} isTos={isTos}/>}
    {annualTargets && <PriceComparisonChart title="年度累计单价与偏差趋势" filters={filters} cadence="annual" items={trendItems} selected={priceTrendView.selected} range={priceTrendView.range('annual')} onRangeChange={value=>priceTrendView.setRange('annual',value)} isTos={isTos}/>}
  </div>;
  const metricColumns: any[] = [
    { title: '账期月份', dataIndex: 'month', width: 120, fixed: 'left', ...sortColumn('month', metricSort) },
    { title: '计费单元', dataIndex: 'unit', width: 170, fixed: 'left' },
    { title: '大区', dataIndex: 'area', width: 80, fixed: 'left' },
    { title: '售卖区域', dataIndex: 'region', width: 150, fixed: 'left' },
    { title: '单位', dataIndex: 'unitLabel', width: 140 },
    { title: dailyAverage ? '月日均实际值' : '月度实际值', dataIndex: 'actual', width: 160, ...sortColumn('actual', metricSort), render: (value: number | null) => selectedNode?.type === 'ratio' ? tablePercent(value) : selectedNode?.type === 'amount' ? tableAmount(value) : selectedNode?.type === 'quantity' ? tableQuantity(value) : tablePrice(value) },
    ...(monthlyTargets ? [
        { title: '月度目标值', dataIndex: 'target', width: 150, ...sortColumn('target', metricSort), render: (value:number|null) => selectedNode?.type==='ratio'?tablePercent(value):selectedNode?.type==='amount'?tableAmount(value):selectedNode?.type==='quantity'?tableQuantity(value):tablePrice(value) },
        { title: '月度偏差幅度', dataIndex: 'deviation', width: 150, ...sortColumn('deviation', metricSort), render: trendPercent },
    ] : []),
    ...(quarterlyTargets ? [
        { title: '季度目标值', dataIndex: 'quarterTarget', width: 150, ...sortColumn('quarterTarget', metricSort), render: (value:number|null) => selectedNode?.type==='ratio'?tablePercent(value):selectedNode?.type==='amount'?tableAmount(value):selectedNode?.type==='quantity'?tableQuantity(value):tablePrice(value) },
        { title: '季度偏差幅度', dataIndex: 'quarterDeviation', width: 150, ...sortColumn('quarterDeviation', metricSort), render: trendPercent },
    ] : []),
      { title: '年度累计实际值', dataIndex: 'annualActual', width: 150, render: (value:number|null) => selectedNode?.type==='ratio'?tablePercent(value):selectedNode?.type==='amount'?tableAmount(value):selectedNode?.type==='quantity'?tableQuantity(value):tablePrice(value) },
    ...(annualTargets ? [
        { title: '年度目标值', dataIndex: 'annualTarget', width: 150, ...sortColumn('annualTarget', metricSort), render: (value:number|null) => selectedNode?.type==='ratio'?tablePercent(value):selectedNode?.type==='amount'?tableAmount(value):selectedNode?.type==='quantity'?tableQuantity(value):tablePrice(value) },
        { title: '年度偏差幅度', dataIndex: 'annualDeviation', width: 150, render: trendPercent },
    ] : []),
  ];
  if (!supported) return <Section title="成本定价"><EmptyState text="暂不支持该商品定价分析"/><p className="plain-text">当前商品未接入定价模型，不使用其他商品的公式或数据替代。</p></Section>;
  return <>
    {!topologyOnly && <section id="pricing-item-income" className="analysis-section pricing-target-gap-section">
      <TableTrendView title="单价目标差距" sectionTitle label="单价目标差距" view={priceTrendView.view} onChange={priceTrendView.setView}
        selectedLabel={priceTrendView.selected?priceDimensionLabel(priceTrendView.selected,isTos):undefined}
        onClearSelection={priceTrendView.clearSelection}
        table={rows.length === 0 ? <EmptyState text="当前筛选组合暂无线上单价数据"/> : <SourceTable key={filterKey} columns={priceColumns} data={sortedPrices} pagination={sourcePaginationProps(sortedPrices.length)} width={priceColumns.reduce((sum, column) => sum + (column.width || 150), 0)} onChange={(_pagination:any, sorter:any) => setPriceSort(stateFromSorter(sorter, { key: 'monthDeviation', order: 'descend' }))}/>}
        trend={priceTrend}
      />
    </section>}
    <Section title="计费项定价公式" id="pricing-item-formula">
      <div className="formula-filter">
        <Select addBefore="收入计费单元" defaultActiveFirstOption={false} showSearch={availableUnits.length > SELECT_SEARCH_THRESHOLD} value={activeUnit || undefined} options={availableUnits} placeholder={getSelectPlaceholder(availableUnits.length > SELECT_SEARCH_THRESHOLD)} onChange={value => { setFormulaUnit(value); setFormulaArea(''); setFormulaRegion(''); }}/>
        <Select addBefore="大区" defaultActiveFirstOption={false} showSearch={availableAreas.length > SELECT_SEARCH_THRESHOLD} value={activeArea || undefined} options={availableAreas} placeholder={getSelectPlaceholder(availableAreas.length > SELECT_SEARCH_THRESHOLD)} onChange={value => { setFormulaArea(value); setFormulaRegion(''); }}/>
        <Select addBefore="收入售卖区域" defaultActiveFirstOption={false} showSearch={!isTos && availableRegions.length > SELECT_SEARCH_THRESHOLD} disabled={isTos} value={isTos ? undefined : activeRegion || undefined} options={availableRegions} placeholder={getSelectPlaceholder(!isTos && availableRegions.length > SELECT_SEARCH_THRESHOLD)} onChange={setFormulaRegion}/>
      </div>
      {!tree ? <EmptyState text={rows.length === 0 ? '当前公式链路筛选组合暂无可用于公式归因的指标数据' : '当前计费单元暂无已接入的定价公式链路，不使用 CPU 公式替代'}/> : <>
        <div className="pricing-formula-container"><FormulaCanvas tree={tree} row={formulaRow!} expanded={expanded} toggle={toggle} onTrend={showTrend} onDetails={setDetailNode} detailsOpen={!!detailNode} targets={filters.targets}/></div>
        <div id="pricing-metric-trend" className="pricing-metric-panel">
          <div className="pricing-metric-panel-heading">
            <h3>指标趋势</h3>
            <span className="pricing-metric-detail-label pricing-scope-tag" aria-label="当前指标分析范围" title={isTos ? `${activeUnit} / ${activeArea}` : `${activeUnit} / ${activeArea} / ${activeRegion}`}>
              <span className="pricing-metric-detail-label-prefix">{isTos ? '收入计费单元&大区' : '收入计费单元&售卖区域'}</span>
              <span className="pricing-metric-detail-label-text">{isTos ? `${activeUnit} / ${activeArea}` : `${activeUnit} / ${activeArea} / ${activeRegion}`}</span>
            </span>
          </div>
          <div className="pricing-metric-panel-body">
          <div className="pricing-trend-controls">
            <div className="pricing-month-range"><DatePicker.RangePicker mode="month" format="YYYY-MM" value={trendMonthRange} onChange={setTrendMonthRange} allowClear={false} placeholder={['开始月份', '结束月份']} aria-label="指标趋势月份范围"/></div>
            <Select addBefore="指标" className="pricing-metric-select" defaultActiveFirstOption={false} showSearch={nodes.length > SELECT_SEARCH_THRESHOLD} placeholder={getSelectPlaceholder(nodes.length > SELECT_SEARCH_THRESHOLD)} value={selectedNode?.id} options={nodes.map(node => ({ value: node.id, label: node.title }))} onChange={setMetric}/>
            <div role="group" aria-label="趋势时间粒度"><Tabs className="pricing-pipeline-tabs" type="capsule" size="default" activeTab={timeGrain} onChange={key => setTimeGrain(key as 'month' | 'day')}><Tabs.TabPane key="month" title="按月"/><Tabs.TabPane key="day" title="按日"/></Tabs></div>
            {timeGrain === 'month' && canUseDailyAverage && <div role="group" aria-label="趋势聚合口径"><Tabs className="pricing-pipeline-tabs" type="capsule" size="default" activeTab={aggregation} onChange={key => setAggregation(key as 'total' | 'dailyAverage')}><Tabs.TabPane key="total" title="月总计"/><Tabs.TabPane key="dailyAverage" title="月日均"/></Tabs></div>}
          </div>
          {metricUnavailable ? <div data-testid="pricing-metric-unavailable"><Note tone="warning">{metricUnavailableText}</Note><EmptyState text="暂无按日数据"/></div> : <>
            <AnalysisChart key={`${metric}-${activeUnit}-${activeArea}-${activeRegion}`} title={selectedNode?.title || '公式指标月度趋势'} values={metricTrendValues} dashedSeries={['月度目标', '季度目标', '年度目标']} dottedSeries={['年度目标']} percent={selectedNode?.type === 'ratio'} unit={selectedNode?.unit || ''} height={270}/>
            <SourceTable columns={metricColumns} data={sortRows(monthlyFormulaRows, metricSort)} pagination={sourcePaginationProps(monthlyFormulaRows.length)} width={metricColumns.reduce((sum, column) => sum + (column.width || 150), 0)} onChange={(_pagination:any, sorter:any) => setMetricSort(stateFromSorter(sorter, { key: 'deviation', order: 'descend' }))} noDataElement={<EmptyState text="当前全局筛选结果下暂无可展示的组合维度月度趋势明细" compact size={60}/>}/>
          </>}
          </div>
        </div>
      </>}
    </Section>
    <Drawer
      title={<div className="pricing-metric-detail-drawer-title">
        <span>查看指标详细数据</span>
        {detailNode ? <span className="pricing-metric-detail-label" title={detailNode.title}>
          <span className="pricing-metric-detail-label-prefix">指标</span>
          <span className="pricing-metric-detail-label-text">{detailNode.title}</span>
        </span> : null}
      </div>}
      visible={!!detailNode}
      zIndex={1051}
      focusLock
      width={960}
      footer={null}
      onCancel={() => setDetailNode(null)}
    >
      <section className="pricing-metric-detail">
        <SourceTable
          className="pricing-metric-detail-table"
          columns={detailColumns}
          data={detailRows}
          pagination={sourcePaginationProps(detailRows.length,{hideOnSinglePage:true,sizeCanChange:false})}
          width={detailColumns.reduce((sum,column)=>sum+(column.width||150),0)}
          noDataElement={<EmptyState text="暂无数据" compact size={60}/>}
        />
      </section>
    </Drawer>
    <Drawer title="数据完整性 · 归因证据" visible={evidence} width={700} footer={<Button type="primary" onClick={() => setEvidence(false)}>关闭</Button>} onCancel={() => setEvidence(false)}>
      <div className="pricing-evidence"><Alert className="pricing-evidence-status" type="warning" content="原型目标仅用于界面验证"/><h3>受影响对象</h3><p>{filters.product}<br/>{activeUnit || '当前筛选计费单元'} / {activeArea || '当前筛选大区'}{!isTos && activeRegion ? ` / ${activeRegion}` : ''}</p><h3>目标适用月份</h3><p>2026-01 至 2026-12</p><h3>当前数据状态</h3><ul><li>月度、季度、年度目标：原型目标版本 V1。</li><li>目标偏差：按页面展示口径实时计算。</li><li>公式版本：文档截图链路用于交互展示，未与线上模型核验。</li></ul><h3>判定规则</h3><p>金额类目标按账期累计，单价和比率按同口径直接比较。正式接入时仍需匹配商品、指标、账期年度、币种与适用范围。</p><h3>证据来源</h3><p>页面实际值与目标值均使用共享原型快照，不连接实时财务数据。</p><h3>管理动作边界</h3><p>当前结果仅用于验证分析流程，不执行调价或 True Up。</p></div>
    </Drawer>
  </>;
}
