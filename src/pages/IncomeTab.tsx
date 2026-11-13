// References: none — new income analysis tab, based on section 4 of the supplied PRD and its screenshots.
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Table, Tag, Tooltip } from '@byted-babi/babi-design';
import {
  AnalysisProps, AnalysisFilters, AnalysisRow, BYTEGRAPH, TOS, areaNames,
  amount, percent, getRows, monthList, totals, trendValues,
} from './analysisData';
import { AnalysisChart, ChartValue, DataTable, EmptyState, Fold, MultiFilter, Note, Section } from './analysisUI';
import CostAnalysis from './CostAnalysis';
import './income.css';

type Metric = 'income' | 'cost' | 'profit' | 'rate';
type DisplayRow = { id: string; unit: string; area: string; region: string; income: number; cost: number | null; profit: number | null; rate: number | null; accumulatedIncome: number; accumulatedCost: number | null; accumulatedProfit: number | null };
const metrics: {key: Metric; label: string}[] = [
  { key:'rate', label:'纯资源成本利润率' },
  { key:'income', label:'纯资源收入' },
  { key:'cost', label:'纯资源成本' },
  { key:'profit', label:'纯资源利润' },
];
const valueText = (key:Metric, value:number|null|undefined) => key==='rate' ? percent(value) : amount(value);
const compare = (a:number|null, b:number|null) => a===null ? (b===null?0:1) : b===null ? -1 : a-b;
function scopeTotal(rows:AnalysisRow[]) {
  const result=totals(rows);
  const comparable=rows.some(row=>row.cost!==null);
  return { ...result, cost: comparable?result.cost:null, profit:comparable?result.profit:null, rate:comparable?result.rate:null };
}
function previousMonth(month:string) { const number=Number(month.slice(-2)); return number>1?`${month.slice(0,5)}${String(number-1).padStart(2,'0')}`:null; }
function difference(current:number|null, previous:number|null, rate=false) {
  if(current===null||previous===null||(!rate&&previous===0))return null;
  return rate?current-previous:(current-previous)/Math.abs(previous)*100;
}
function grouped(rows:AnalysisRow[], tos:boolean):DisplayRow[] {
  const groups=new Map<string,AnalysisRow[]>();
  rows.forEach(row=>{ const id=[row.unit,row.area,...(tos?[]:[row.region])].join('|'); groups.set(id,[...(groups.get(id)||[]),row]); });
  return Array.from(groups.entries()).map(([id,group])=>({ id,unit:group[0].unit,area:group[0].area,region:tos?'':group[0].region,...scopeTotal(group), accumulatedIncome:0, accumulatedCost:null, accumulatedProfit:null }));
}
function availableTrend(filters:AnalysisFilters,key:Metric):ChartValue[] {
  const existing=trendValues(filters,key);
  return existing.map((point,index)=>({ ...point, value:scopeTotal(getRows(filters,monthList(filters.month)[index]))[key] }));
}

// References: none — each class retains its own unit selection, table sorting, resizing, totals and folded trend.
function CategoryCard({category,filters,onDrill}:AnalysisProps&{category:string}) {
  const tos=filters.product===TOS;
  const source=useMemo(()=>getRows({...filters,categories:[category]}),[filters,category]);
  const candidates=useMemo(()=>Array.from(new Set(source.map(row=>row.unit))).sort(),[source]);
  const [units,setUnits]=useState<string[]|null>(null);
  const [widths,setWidths]=useState<Record<string,number>>({unit:210,area:112,region:160});
  const [sort,setSort]=useState<{field:string;direction:'ascend'|'descend'}>({field:'rate',direction:'descend'});
  useEffect(()=>{setUnits(null);setSort({field:'rate',direction:'descend'});},[filters,category]);
  const localFilters:AnalysisFilters={...filters,categories:[category],units:units===null?candidates:units};
  const selectedRows=getRows(localFilters);
  const currentRows=grouped(selectedRows,tos);
  const accumulatedRows=monthList(filters.month).flatMap(month=>getRows(localFilters,month));
  const accumulated=grouped(accumulatedRows,tos);
  const lookup=new Map(accumulated.map(row=>[row.id,row]));
  const displayRows=currentRows.map(row=>{const annual=lookup.get(row.id);return {...row,accumulatedIncome:annual?.income??0,accumulatedCost:annual?.cost??null,accumulatedProfit:annual?.profit??null};});
  const sortedRows=[...displayRows].sort((a,b)=>{
    const av=(a as any)[sort.field],bv=(b as any)[sort.field];
    if(av===null||bv===null)return compare(av,bv);
    const order=typeof av==='number'?av-bv:String(av).localeCompare(String(bv));
    return (sort.direction==='ascend'?order:-order)||a.unit.localeCompare(b.unit);
  });
  const monthTargets=filters.targets.includes('月度目标值');
  const quarterTargets=filters.targets.includes('季度目标值');
  const yearTargets=filters.targets.includes('年度目标值');
  const startResize=(event:React.PointerEvent,key:string)=>{
    event.preventDefault();event.stopPropagation();
    const x=event.clientX,initial=widths[key];
    const move=(pointer:PointerEvent)=>setWidths(previous=>({...previous,[key]:Math.max(88,initial+pointer.clientX-x)}));
    const up=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);};
    window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);
  };
  const dimension=(key:'unit'|'area'|'region',label:string)=>({title:<div className="income-resizable-title"><span>{label}</span><span role="separator" aria-label={`调整${label}列宽`} className="income-resize-handle" onPointerDown={event=>startResize(event,key)} /></div>,dataIndex:key,width:widths[key],fixed:'left',render:(value:string)=><Tooltip content={key==='area'?`${value} · ${areaNames[value]||value}`:value}><span className="income-dimension-text">{value}</span></Tooltip>});
  const columns:any[]=[dimension('unit','计费单元'),dimension('area','大区'),...(!tos?[dimension('region','售卖区域')]:[])];
  const flatFields:{field:string;render:(value:any)=>React.ReactNode;width:number}[]=[];
  const groups:Metric[]=['income','cost','profit','rate'];
  groups.forEach(key=>{
    const label=metrics.find(metric=>metric.key===key)!.label;
    const children:any[]=[{title:'实际值',dataIndex:key,width:146,align:'right',sorter:true,sortOrder:sort.field===key?sort.direction:undefined,render:(value:number|null)=><strong className={value===null?'muted-value':'income-actual'}>{valueText(key,value)}</strong>}];
    flatFields.push({field:key,render:value=>valueText(key,value),width:146});
    if(monthTargets){
      children.push({title:'月度目标',dataIndex:`${key}MonthlyTarget`,width:146,align:'right',render:()=> <Tooltip content="未提供有效目标值"><span className="muted-value">—</span></Tooltip>},{title:'月度偏差',dataIndex:`${key}MonthlyDeviation`,width:130,align:'right',render:()=> <span className="muted-value">—</span>});
      flatFields.push({field:'missing',render:()=> '—',width:146},{field:'missing',render:()=> '—',width:130});
    }
    // References: none — quarterly fields follow the display selection; no approved target is fabricated.
    if(quarterTargets){
      children.push({title:'季度目标',dataIndex:`${key}QuarterTarget`,width:146,align:'right',render:()=> <Tooltip content="未提供有效季度目标值"><span className="muted-value">—</span></Tooltip>},{title:'季度偏差',dataIndex:`${key}QuarterDeviation`,width:130,align:'right',render:()=> <span className="muted-value">—</span>});
      flatFields.push({field:'missing',render:()=> '—',width:146},{field:'missing',render:()=> '—',width:130});
    }
    if(yearTargets){
      children.push({title:key==='rate'?'年度目标率':'年度目标',dataIndex:`${key}YearTarget`,width:146,align:'right',render:()=> <Tooltip content="未提供有效年度目标值"><span className="muted-value">—</span></Tooltip>});
      flatFields.push({field:'missing',render:()=> '—',width:146});
      if(key!=='rate'){
        const accumulatedKey=`accumulated${key.charAt(0).toUpperCase()+key.slice(1)}`;
        children.push({title:'1月至今累计实际值',dataIndex:accumulatedKey,width:182,align:'right',sorter:true,sortOrder:sort.field===accumulatedKey?sort.direction:undefined,render:(value:number|null)=>amount(value)},{title:'年度目标累积占比',dataIndex:`${key}YearDeviation`,width:162,align:'right',render:()=> <span className="muted-value">—</span>});
        flatFields.push({field:accumulatedKey,render:value=>amount(value),width:182},{field:'missing',render:()=> '—',width:162});
      }else{
        children.push({title:'与年度目标率的比较',dataIndex:'rateYearDeviation',width:174,align:'right',render:()=> <span className="muted-value">—</span>});
        flatFields.push({field:'missing',render:()=> '—',width:174});
      }
    }
    columns.push({title:label,children});
  });
  const tableWidth=widths.unit+widths.area+(!tos?widths.region:0)+flatFields.reduce((sum,column)=>sum+column.width,0);
  const summaryCurrent=scopeTotal(selectedRows),summaryAnnual=scopeTotal(accumulatedRows);
  const summaryValues={...summaryCurrent,accumulatedIncome:summaryAnnual.income,accumulatedCost:summaryAnnual.cost,accumulatedProfit:summaryAnnual.profit};
  const summary=()=> <Table.Summary fixed="bottom"><Table.Summary.Row><Table.Summary.Cell colSpan={tos?2:3} className="income-summary-dimension">总计</Table.Summary.Cell>{flatFields.map((column,index)=><Table.Summary.Cell key={index} style={{textAlign:'right'}}><strong className={column.field==='missing'?'muted-value':''}>{column.render((summaryValues as any)[column.field])}</strong></Table.Summary.Cell>)}</Table.Summary.Row></Table.Summary>;
  const trendCombos=grouped(selectedRows,tos);
  const comboTrends=(key:Metric)=>monthList(filters.month).flatMap(month=>{
    const monthRows=grouped(getRows(localFilters,month),tos);
    const monthMap=new Map(monthRows.map(row=>[row.id,row]));
    return trendCombos.map(combo=>({x:month.slice(5)+'月',series:`${combo.unit} | ${combo.area}${tos?'':` | ${combo.region}`}`,value:monthMap.get(combo.id)?.[key]??null}));
  });
  const supported=filters.product===BYTEGRAPH||tos;
  return <div className="income-category-card">
    <div className="income-category-heading"><div className="income-category-controls"><span className="income-category-title">{category}</span><div className="income-unit-select"><MultiFilter value={units} options={candidates} onChange={setUnits}/></div><Button type="text" className="income-formula-link" disabled={!supported||!selectedRows.length} onClick={()=>onDrill('pricing','pricing-item-formula',{categories:[category],units:units===null?candidates:units,areas:Array.from(new Set(selectedRows.map(row=>row.area))),regions:null})}>{supported?'定价公式分析':'暂无定价公式'}</Button></div><span className="income-table-hint">拖动维度列边缘调整列宽</span></div>
    {units!==null&&!units.length?<EmptyState text="当前筛选无数据，请至少选择一项或点击“全选”"/>:<div className="income-detail-table"><Table rowKey="id" size="small" border={{wrapper:true}} stripe columns={columns} data={sortedRows} pagination={false} scroll={{x:tableWidth,y:320}} noDataElement={<EmptyState/>} summary={summary} onChange={(_pagination:any,sorter:any)=>{if(sorter?.field&&sorter?.direction)setSort({field:sorter.field,direction:sorter.direction});else setSort({field:'rate',direction:'descend'});}}/></div>}
    <Fold title="月趋势"><div className="analysis-chart-grid">{metrics.map(metric=><AnalysisChart key={metric.key} title={metric.label} values={comboTrends(metric.key)} percent={metric.key==='rate'} unit={metric.key==='rate'?'%':'人民币'} height={250}/>)}</div></Fold>
    {/* References: none — reuse the snapshot cost view inside this category's unit selection, preserving TOS scope and illustrative-cost notices. */}
    <CostAnalysis filters={localFilters} id={`income-item-cost-${encodeURIComponent(filters.product)}-${encodeURIComponent(category)}`} detailed/>
  </div>;
}

// References: none — all targets are intentionally unavailable until an effective target version exists.
export default function IncomeTab({filters,onDrill}:AnalysisProps) {
  const rows=useMemo(()=>getRows(filters),[filters]);
  const current=scopeTotal(rows);
  const prior=previousMonth(filters.month);
  const previous=prior?scopeTotal(getRows(filters,prior)):null;
  const candidates=useMemo(()=>Array.from(new Set(rows.map(row=>row.category||'其他'))).sort(),[rows]);
  const [categories,setCategories]=useState<string[]|null>(null);
  useEffect(()=>setCategories(null),[filters]);
  const activeCategories=categories===null?candidates:categories;
  const selectedCategories=activeCategories.filter(category=>candidates.includes(category));
  const categoryTrends=(key:Metric):ChartValue[]=>monthList(filters.month).flatMap(month=>selectedCategories.map(category=>({x:month.slice(5)+'月',series:category,value:scopeTotal(getRows({...filters,categories:[category]},month))[key]})));
  const hasTargets=filters.targets.length>0;
  return <div className="income-tab">
    <Section title="商品收支" id="product-income-expense" blue>
      <Note>月度偏差 =（当月实际值 - 月度目标值）/ 月度目标值；收入、成本、利润的年度目标为全年总值，年度目标累积占比 = 1月至当前账期累计实际值 / 全年目标；成本利润率直接对比目标利润率。偏差颜色为红正绿负，0 为灰色。</Note>
      {filters.product===TOS&&<Note tone="warning">对象存储 TOS 的成本仅支持“计费单元 × 大区”。海外当前只能查看收入，不使用 CN 成本推断海外利润。</Note>}
      {!rows.length?<EmptyState/>:<><div className="kpi-grid">{metrics.map(metric=>{
        const key=metric.key,change=difference(current[key],previous?.[key]??null,key==='rate');
        return <div key={key} className="kpi-card"><div className="kpi-label">{metric.label}</div><div className="kpi-value">{valueText(key,current[key])}</div><div className="comparison">上月 {prior?valueText(key,previous?.[key]):'—'} <Tag size="small" color={change===null||change===0?undefined:change>0?'red':'green'} className="income-change">环比 {change===null?'不可比':`${change>0?'+':''}${change.toFixed(2)}${key==='rate'?'pp':'%'}`}</Tag></div><div className="comparison">去年同期 — <Tag size="small" className="income-change">同比 不可比</Tag></div>{hasTargets&&<div className="kpi-targets">{filters.targets.includes('月度目标值')&&<div className="kpi-target">月度目标<strong>—</strong><span>未提供目标值</span></div>}{filters.targets.includes('季度目标值')&&<div className="kpi-target">季度目标<strong>—</strong><div>季度偏差 <strong>—</strong></div><span>未提供目标值</span></div>}{filters.targets.includes('年度目标值')&&<div className="kpi-target">年度目标<strong>—</strong><span>未提供目标值</span>{key!=='rate'&&<><div>1月至今累计实际值</div><strong>{valueText(key,scopeTotal(monthList(filters.month).flatMap(month=>getRows(filters,month)))[key])}</strong></>}</div>}</div>}</div>;
      })}</div><div className="analysis-chart-grid income-product-trends">{metrics.map(metric=><AnalysisChart key={metric.key} title={`${filters.month} ${metric.label}实际值 ${valueText(metric.key,current[metric.key])}`} values={availableTrend(filters,metric.key)} percent={metric.key==='rate'} unit={metric.key==='rate'?'%':'人民币'} height={250}/>)}</div></>}
      {hasTargets&&<div className="income-target-notice">目标版本未生效：实际数据继续展示，目标及偏差为“—”，不绘制目标线。</div>}
    </Section>
    <Section title="计费项收支" id="charge-income-expense" blue subtitle={filters.product===TOS?'分析粒度：计费单元 × 大区；局部筛选即时生效，不影响商品收支。':'分析粒度：计费单元 × 大区 × 售卖区域；局部筛选即时生效，不影响商品收支。'}>
      <div className="analysis-toolbar income-category-filter"><div><span>计费单元类型</span><MultiFilter value={categories} options={candidates} onChange={setCategories}/></div><span className="plain-text">数据版本：快照 2026-09 · 与商品实时查询口径分开展示</span></div>
      {!candidates.length?<EmptyState/>:categories!==null&&!categories.length?<EmptyState text="当前未选择计费单元类型，数据表已隐藏"/>:<>
        <Fold title="计费单元类别整体月趋势" defaultOpen><div className="analysis-chart-grid">{metrics.map(metric=><AnalysisChart key={metric.key} title={metric.label} values={categoryTrends(metric.key)} percent={metric.key==='rate'} unit={metric.key==='rate'?'%':'人民币'} height={250}/>)}</div></Fold>
        {selectedCategories.map(category=><CategoryCard key={`${filters.product}-${category}`} category={category} filters={filters} onDrill={onDrill}/>)}
      </>}
    </Section>
  </div>;
}
