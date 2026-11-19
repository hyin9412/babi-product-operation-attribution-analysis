// References: none — new income analysis tab, based on section 4 of the supplied PRD and its screenshots.
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@byted-babi/babi-design';
import IconFx from './IconFx';
import {
  AnalysisProps, AnalysisFilters, AnalysisRow, BYTEGRAPH, TOS, areaNames,
  amount, percent, getRows, monthList, totals, trendValues, FinancialMetric,
  annualTargetValue, financialMetricValue, financialTargetSummary, financialTargetValue,
  metricDeviation, quarterMonthList, chartSeriesName,
} from './analysisData';
import { AnalysisChart, ChartValue, DataTable, EmptyState, Fold, MultiFilter, Note, OverflowText, Section, SourceTable, SourceTableSummary, sourcePaginationProps, tableAmount, tablePercent, trendMonthLabel, trendPercent } from './analysisUI';
import CostAnalysis from './CostAnalysis';
import IncomeMetricCard, { IncomeMetricValueParts } from './IncomeMetricCard';
import TableTrendView, { TrendDrillIcon, TrendRangeControl, rankedTrendRows, useTableTrend } from './TableTrendView';
import './income.css';

type Metric = 'income' | 'cost' | 'profit' | 'rate';
type DisplayRow = { id: string; unit: string; area: string; region: string; income: number; cost: number | null; profit: number | null; rate: number | null; accumulatedIncome: number; accumulatedCost: number | null; accumulatedProfit: number | null; sourceRows:AnalysisRow[] } & Record<string,unknown>;
const metrics: {key: Metric; label: string}[] = [
  { key:'rate', label:'成本利润率' },
  { key:'income', label:'收入' },
  { key:'cost', label:'成本' },
  { key:'profit', label:'利润' },
];
const resourceCategoryLabel=(category:string)=>category==='计算'?'计算资源':category==='存储'?'存储资源':category;
const mergedHeaderDivider = '1px solid #EAEDF1';
const valueText = (key:Metric, value:number|null|undefined) => key==='rate' ? percent(value) : amount(value);
const tableValue = (key:Metric, value:number|null|undefined) => key==='rate' ? tablePercent(value) : tableAmount(value);
const chartInsight=(values:ChartValue[],key:Metric,month:string)=>{
  const points=values.filter((point):point is ChartValue&{value:number}=>point.value!==null&&Number.isFinite(point.value));
  const peak=points.reduce<(ChartValue&{value:number})|null>((result,point)=>!result||point.value>=result.value?point:result,null);
  const highlight=peak?.series||'—';
  const peakMonth=peak?trendMonthLabel(month,peak.x):'—';
  const peakText=peak?`${peakMonth} ${valueText(key,peak.value)}`:'—';
  return {summary:peak?`${highlight} 在 ${peakMonth} 达到${metrics.find(metric=>metric.key===key)?.label||''}峰值 ${valueText(key,peak.value)}。`:'当前范围暂无可用趋势数据。',moreInfo:[`口径月：${month}`,`高亮：${highlight}`,`峰值：${peakText}`],annotationPoint:peak?{x:peak.x,series:peak.series,value:peak.value}:null};
};
const valueParts = (key:Metric,value:number|null|undefined):IncomeMetricValueParts => {
  if(value===null||value===undefined||!Number.isFinite(value))return {number:'-'};
  if(key==='rate')return {number:value.toFixed(2),unit:'%'};
  if(Math.abs(value)>=1e8)return {number:(value/1e8).toFixed(2),scale:'亿',unit:'元'};
  if(Math.abs(value)>=1e4)return {number:(value/1e4).toFixed(2),scale:'万',unit:'元'};
  return {number:value.toLocaleString('zh-CN',{maximumFractionDigits:2,minimumFractionDigits:2}),unit:'元'};
};
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
  return Array.from(groups.entries()).map(([id,group])=>({ id,unit:group[0].unit,area:group[0].area,region:tos?'':group[0].region,...scopeTotal(group), accumulatedIncome:0, accumulatedCost:null, accumulatedProfit:null,sourceRows:group }));
}
function targetFields(currentRows:AnalysisRow[],quarterRows:AnalysisRow[],annualRows:AnalysisRow[],yearToDateRows:AnalysisRow[]) {
  return metrics.reduce<Record<string,number|null>>((fields,{key})=>{
    const prefix=key;
    const actual=financialMetricValue(currentRows,key);
    const quarterActual=financialMetricValue(quarterRows,key);
    const yearToDateActual=financialMetricValue(yearToDateRows,key);
    const monthlyTarget=financialTargetValue(currentRows,key);
    const quarterlyTarget=financialTargetValue(quarterRows,key);
    const yearTarget=annualTargetValue(annualRows,key);
    fields[`${prefix}MonthlyTarget`]=monthlyTarget;
    fields[`${prefix}MonthlyDeviation`]=metricDeviation(actual,monthlyTarget,key);
    fields[`${prefix}QuarterTarget`]=quarterlyTarget;
    fields[`${prefix}QuarterDeviation`]=metricDeviation(quarterActual,quarterlyTarget,key);
    fields[`${prefix}YearTarget`]=yearTarget;
    if(key==='rate')fields.rateYearDeviation=metricDeviation(yearToDateActual,yearTarget,key);
    else fields[`${prefix}YearDeviation`]=yearToDateActual===null||yearTarget===null||yearTarget===0?null:yearToDateActual/yearTarget*100;
    return fields;
  },{});
}
function availableTrend(filters:AnalysisFilters,key:Metric):ChartValue[] {
  const existing=trendValues(filters,key);
  return existing.map((point,index)=>({ ...point, value:scopeTotal(getRows(filters,monthList(filters.month)[index]))[key] }));
}
const PRODUCT_TREND_COLOR_INDEXES={实际值:0,月度目标:1,季度目标:2};
function productTrend(filters:AnalysisFilters,key:Metric):ChartValue[] {
  const months=monthList(filters.month);
  const values=availableTrend(filters,key);
  if(filters.targets.includes('月度目标值')){
    values.push(...months.map(month=>({x:month,series:'月度目标',value:financialTargetValue(getRows(filters,month),key)})));
  }
  if(filters.targets.includes('季度目标值')){
    values.push(...months.map(month=>{
      const quarterMonths=quarterMonthList(month);
      const target=financialTargetValue(quarterMonths.flatMap(quarterMonth=>getRows(filters,quarterMonth)),key);
      return {x:month,series:'季度目标',value:key==='rate'||target===null?target:target/quarterMonths.length};
    }));
  }
  return values;
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
  const quarterRows=grouped(quarterMonthList(filters.month).flatMap(month=>getRows(localFilters,month)),tos);
  const quarterLookup=new Map(quarterRows.map(row=>[row.id,row]));
  const annualRows=grouped(monthList('2026-09').flatMap(month=>getRows(localFilters,month)),tos);
  const annualLookup=new Map(annualRows.map(row=>[row.id,row]));
  const displayRows=currentRows.map(row=>{
    const yearToDate=lookup.get(row.id),quarter=quarterLookup.get(row.id),annual=annualLookup.get(row.id);
    return {...row,accumulatedIncome:yearToDate?.income??0,accumulatedCost:yearToDate?.cost??null,accumulatedProfit:yearToDate?.profit??null,...targetFields(row.sourceRows,quarter?.sourceRows||[],annual?.sourceRows||[],yearToDate?.sourceRows||[])};
  });
  const sortedRows=[...displayRows].sort((a,b)=>{
    const av=(a as any)[sort.field],bv=(b as any)[sort.field];
    if(av===null||bv===null)return compare(av,bv);
    const order=typeof av==='number'?av-bv:String(av).localeCompare(String(bv));
    return (sort.direction==='ascend'?order:-order)||a.unit.localeCompare(b.unit);
  });
  const trendView=useTableTrend(sortedRows,JSON.stringify(localFilters));
  const dimensionLabel=(row:DisplayRow)=>chartSeriesName([row.unit,row.area,...(tos?[]:[row.region])]);
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
  const dimension=(key:'unit'|'area'|'region',label:string)=>({title:<div className="income-resizable-title"><span>{label}</span><span role="separator" aria-label={`调整${label}列宽`} className="income-resize-handle" onPointerDown={event=>startResize(event,key)} /></div>,dataIndex:key,width:widths[key],fixed:'left',render:(value:string,row:DisplayRow)=>{
    const text=<OverflowText className="income-dimension-text">{value}</OverflowText>;
    return key===(tos?'area':'region')?<span className="analysis-trend-dimension">{text}<TrendDrillIcon label={dimensionLabel(row)} onClick={()=>trendView.drill(row)}/></span>:text;
  }});
  const columns:any[]=[dimension('unit','原始收入计费单元'),dimension('area','大区'),...(!tos?[dimension('region','收入售卖区域')]:[])];
  const flatFields:{field:string;render:(value:any)=>React.ReactNode;width:number}[]=[];
  const groups:Metric[]=metrics.map(metric=>metric.key);
  groups.forEach(key=>{
    const label=metrics.find(metric=>metric.key===key)!.label;
    const children:any[]=[{title:'实际值',dataIndex:key,width:146,align:'right',sorter:true,sortOrder:sort.field===key?sort.direction:undefined,render:(value:number|null)=><span className={value===null?'muted-value':'income-actual'}>{tableValue(key,value)}</span>}];
    flatFields.push({field:key,render:value=>tableValue(key,value),width:146});
    if(monthTargets){
      children.push({title:'月度目标',dataIndex:`${key}MonthlyTarget`,width:146,align:'right',render:(value:number|null)=>tableValue(key,value)},{title:'月度偏差',dataIndex:`${key}MonthlyDeviation`,width:130,align:'right',render:trendPercent});
      flatFields.push({field:`${key}MonthlyTarget`,render:value=>tableValue(key,value),width:146},{field:`${key}MonthlyDeviation`,render:trendPercent,width:130});
    }
    if(quarterTargets){
      children.push({title:'季度目标',dataIndex:`${key}QuarterTarget`,width:146,align:'right',render:(value:number|null)=>tableValue(key,value)},{title:'季度偏差',dataIndex:`${key}QuarterDeviation`,width:130,align:'right',render:trendPercent});
      flatFields.push({field:`${key}QuarterTarget`,render:value=>tableValue(key,value),width:146},{field:`${key}QuarterDeviation`,render:trendPercent,width:130});
    }
    if(yearTargets){
      children.push({title:'年度目标',dataIndex:`${key}YearTarget`,width:146,align:'right',render:(value:number|null)=>tableValue(key,value)});
      flatFields.push({field:`${key}YearTarget`,render:value=>tableValue(key,value),width:146});
      if(key!=='rate'){
        const accumulatedKey=`accumulated${key.charAt(0).toUpperCase()+key.slice(1)}`;
        children.push({title:'1月至今累计实际值',dataIndex:accumulatedKey,width:182,align:'right',sorter:true,sortOrder:sort.field===accumulatedKey?sort.direction:undefined,render:tableAmount},{title:'年度目标累积占比',dataIndex:`${key}YearDeviation`,width:162,align:'right',render:tablePercent});
        flatFields.push({field:accumulatedKey,render:tableAmount,width:182},{field:`${key}YearDeviation`,render:tablePercent,width:162});
      }else{
        children.push({title:'年度偏差',dataIndex:'rateYearDeviation',width:174,align:'right',render:trendPercent});
        flatFields.push({field:'rateYearDeviation',render:trendPercent,width:174});
      }
    }
    children.forEach(column=>{
      column.sorter=true;
      column.sortOrder=sort.field===column.dataIndex?sort.direction:undefined;
      column.sortDirections=['descend','ascend'];
    });
    // Figma 222:21126: multiple two-level headers separate every group vertically and both header levels horizontally.
    children[0]={...children[0],headerCellStyle:{...children[0].headerCellStyle,borderLeft:mergedHeaderDivider}};
    columns.push({title:label,children,headerCellStyle:{borderLeft:mergedHeaderDivider,borderBottom:mergedHeaderDivider}});
  });
  const tableWidth=widths.unit+widths.area+(!tos?widths.region:0)+flatFields.reduce((sum,column)=>sum+column.width,0);
  const summaryCurrent=scopeTotal(selectedRows),summaryAnnual=scopeTotal(accumulatedRows);
  const summaryValues={...summaryCurrent,accumulatedIncome:summaryAnnual.income,accumulatedCost:summaryAnnual.cost,accumulatedProfit:summaryAnnual.profit,...targetFields(selectedRows,quarterRows.flatMap(row=>row.sourceRows),annualRows.flatMap(row=>row.sourceRows),accumulatedRows)};
  const summaryCells=flatFields.reduce<{field:string;render:(value:any)=>React.ReactNode;colSpan:number}[]>((cells,column)=>{
    const previous=cells[cells.length-1];
    if(column.field==='missing'&&previous?.field==='missing'){
      previous.colSpan+=1;
    }else{
      cells.push({...column,colSpan:1});
    }
    return cells;
  },[]);
  const summary=()=> <SourceTableSummary fixed="top">
    <SourceTableSummary.Row className="analysis-summary-row">
      <SourceTableSummary.Cell colSpan={tos?2:3} className="analysis-summary-label">总计</SourceTableSummary.Cell>
      {summaryCells.map((cell,index)=><SourceTableSummary.Cell key={index} colSpan={cell.colSpan} className="analysis-summary-number">{cell.render((summaryValues as any)[cell.field])}</SourceTableSummary.Cell>)}
    </SourceTableSummary.Row>
  </SourceTableSummary>;
  const comboTrends=(key:Metric,trendCombos:DisplayRow[])=>{
    const actualValues:ChartValue[]=[];
    const targetValues:ChartValue[]=[];
    const dashedSeries:string[]=[];
    const seriesColorIndexes:Record<string,number>={};
    const singleCombo=trendCombos.length===1;
    monthList(filters.month).forEach(month=>{
      const monthRows=grouped(getRows(localFilters,month),tos);
      const monthMap=new Map(monthRows.map(row=>[row.id,row]));
      const quarterMonths=quarterMonthList(month);
      const quarterRows=grouped(quarterMonths.flatMap(quarterMonth=>getRows(localFilters,quarterMonth)),tos);
      const quarterMap=new Map(quarterRows.map(row=>[row.id,row]));
      trendCombos.forEach((combo,index)=>{
        const item=dimensionLabel(combo);
        const series=chartSeriesName([item],'实际值');
        const monthRow=monthMap.get(combo.id);
        const quarterRow=quarterMap.get(combo.id);
        seriesColorIndexes[series]=index;
        actualValues.push({x:month,series,value:monthRow?.[key]??null});
        if(filters.targets.includes('月度目标值')){
          const monthlySeries=chartSeriesName([item],'月度目标');
          seriesColorIndexes[monthlySeries]=singleCombo?1:index;
          if(!dashedSeries.includes(monthlySeries))dashedSeries.push(monthlySeries);
          targetValues.push({x:month,series:monthlySeries,value:financialTargetValue(monthRow?.sourceRows||[],key)});
        }
        if(filters.targets.includes('季度目标值')){
          const quarterlySeries=chartSeriesName([item],'季度目标');
          seriesColorIndexes[quarterlySeries]=singleCombo?2:index;
          if(!dashedSeries.includes(quarterlySeries))dashedSeries.push(quarterlySeries);
          const target=financialTargetValue(quarterRow?.sourceRows||[],key);
          targetValues.push({x:month,series:quarterlySeries,value:key==='rate'||target===null?target:target/quarterMonths.length});
        }
      });
    });
    const valuesBySeries=new Map<string,ChartValue[]>();
    [...actualValues,...targetValues].forEach(value=>valuesBySeries.set(value.series,[...(valuesBySeries.get(value.series)||[]),value]));
    const seriesOrder=trendCombos.flatMap(combo=>{
      const item=dimensionLabel(combo);
      return [
        chartSeriesName([item],'实际值'),
        ...(filters.targets.includes('月度目标值')?[chartSeriesName([item],'月度目标')]:[]),
        ...(filters.targets.includes('季度目标值')?[chartSeriesName([item],'季度目标')]:[]),
      ];
    });
    return {actualValues,values:seriesOrder.flatMap(series=>valuesBySeries.get(series)||[]),dashedSeries,seriesColorIndexes};
  };
  const trendChart=(metric:{key:Metric;label:string})=>{
    const selected=trendView.selected,range=trendView.range(metric.key);
    const combos=rankedTrendRows(displayRows,range,row=>{const value=row[`${metric.key}MonthlyDeviation`];return typeof value==='number'?Math.abs(value):null;},selected);
    const trend=comboTrends(metric.key,combos),insight=chartInsight(trend.actualValues,metric.key,filters.month);
    return <AnalysisChart key={`${metric.key}-${selected?.id}-${range}`} title={metric.label} legendReset titleExtra={selected?undefined:<TrendRangeControl range={range} rankingLabel="偏差" onChange={value=>trendView.setRange(metric.key,value)}/>} values={trend.values} dashedSeries={trend.dashedSeries} seriesColorIndexes={trend.seriesColorIndexes} percent={metric.key==='rate'} unit={metric.key==='rate'?'%':'人民币'} summary={insight.summary} moreInfo={insight.moreInfo} annotationPoint={insight.annotationPoint}/>;
  };
  const supported=filters.product===BYTEGRAPH||tos;
  return <div className="income-category-card">
    <div className="income-category-heading"><div className="income-category-controls"><span className="income-category-title">{resourceCategoryLabel(category)}</span><div className="income-unit-select"><MultiFilter addBefore="收入计费单元" size="default" value={units} options={candidates} onChange={setUnits}/></div><Button type="text" className="income-formula-link" icon={<IconFx width="16" height="16"/>} disabled={!supported||!selectedRows.length} onClick={()=>onDrill('pricing','pricing-item-formula',{categories:[category],units:units===null?candidates:units,areas:Array.from(new Set(selectedRows.map(row=>row.area))),regions:null})}>{supported?'定价公式分析':'暂无定价公式'}</Button></div></div>
    <div className="income-category-dashed-divider"/>
    <div className="income-category-body">
      <section className="income-category-subsection">
        <TableTrendView title="收支明细" label={`${resourceCategoryLabel(category)}收支明细`} view={trendView.view} onChange={trendView.setView} selectedLabel={trendView.selected?dimensionLabel(trendView.selected):undefined} onClearSelection={trendView.clearSelection}
          table={units!==null&&!units.length?<EmptyState text="当前筛选无数据，请至少选择一项或点击“全选”"/>:<div className="income-detail-table"><SourceTable columns={columns} data={sortedRows} pagination={sourcePaginationProps(sortedRows.length)} width={tableWidth} maxHeight={320} summary={summary} onChange={(_pagination:any,sorter:any)=>{if(sorter?.field&&sorter?.direction)setSort({field:sorter.field,direction:sorter.direction});else setSort({field:'rate',direction:'descend'});}}/></div>}
          trend={displayRows.length?<div className="analysis-chart-grid">{metrics.map(trendChart)}</div>:<EmptyState/>}
        />
      </section>
      <section className="income-category-subsection">
        <CostAnalysis filters={localFilters} embeddedIncome showChartInsights/>
      </section>
    </div>
  </div>;
}

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
  const categoryTrends=(key:Metric):ChartValue[]=>monthList(filters.month).flatMap(month=>selectedCategories.map(category=>({x:month,series:category,value:scopeTotal(getRows({...filters,categories:[category]},month))[key]})));
  const categoryTrendChart=(metric:{key:Metric;label:string})=>{
    const values=categoryTrends(metric.key),insight=chartInsight(values,metric.key,filters.month);
    return <AnalysisChart key={metric.key} title={metric.label} values={values} percent={metric.key==='rate'} unit={metric.key==='rate'?'%':'人民币'} summary={insight.summary} moreInfo={insight.moreInfo} annotationPoint={insight.annotationPoint}/>;
  };
  const yearToDate=scopeTotal(monthList(filters.month).flatMap(month=>getRows(filters,month)));
  return <div className="income-tab">
    <Section title="商品收支" id="product-income-expense" blue>
      {filters.product===TOS&&<Note tone="warning">对象存储 TOS 的成本仅支持“计费单元 × 大区”。海外当前只能查看收入，不使用 CN 成本推断海外利润。</Note>}
      {!rows.length?<EmptyState/>:<><div className="kpi-grid income-metric-grid">{metrics.map(metric=>{
        const key=metric.key,change=difference(current[key],previous?.[key]??null,key==='rate');
        const target=financialTargetSummary(filters,key as FinancialMetric);
        const monthlyTotalVal = key === 'rate' ? amount(current.income) : undefined;
        const ytdTotalVal = key === 'rate' ? amount(yearToDate.income) : undefined;
        return <IncomeMetricCard
          key={key}
          title={metric.label}
          value={valueParts(key,current[key])}
          previousValue={prior?valueText(key,previous?.[key]):'-'}
          monthOverMonth={change}
          lastYearValue="-"
          yearOverYear={null}
          changeUnit={key==='rate'?'pp':'%'}
          selectedTargets={filters.targets}
          targetSummary={target}
          monthlyTarget={valueText(key,target.monthlyTarget)}
          monthlyDeviation={target.monthlyDeviation}
          quarterlyTarget={valueText(key,target.quarterlyTarget)}
          quarterlyDeviation={target.quarterlyDeviation}
          annualTarget={valueText(key,target.annualTarget)}
          yearToDateActual={valueText(key,target.yearToDateActual)}
          annualTargetShare={target.annualTargetShare}
          annualDeviation={target.annualDeviation}
          rateProfit={key==='rate'?current.profit:undefined}
          rateCost={key==='rate'?current.cost:undefined}
          monthlyTotal={monthlyTotalVal}
          yearToDateTotal={ytdTotalVal}
        />;
      })}</div><div className="analysis-chart-grid income-product-trends">{metrics.map(metric=>{
        const targetSeries=[...(filters.targets.includes('月度目标值')?['月度目标']:[]),...(filters.targets.includes('季度目标值')?['季度目标']:[])];
        const chartLabel=metric.key==='profit'?'利润':metric.label;
        return <AnalysisChart key={metric.key} title={chartLabel} values={productTrend(filters,metric.key)} dashedSeries={targetSeries} seriesColorIndexes={PRODUCT_TREND_COLOR_INDEXES} percent={metric.key==='rate'} unit={metric.key==='rate'?'%':'人民币'} height={250}/>;
      })}</div></>}
    </Section>
    <Section title="计费项收支" id="charge-income-expense" blue>
      <div className="analysis-toolbar income-category-filter"><div><MultiFilter addBefore="计费单元类型" value={categories} options={candidates} onChange={setCategories}/></div></div>
      {!candidates.length?<EmptyState/>:categories!==null&&!categories.length?<EmptyState text="当前未选择计费单元类型，数据表已隐藏"/>:<>
        <Fold title="收入计费单元类别整体月趋势" appearance="filter" defaultOpen><div className="analysis-chart-grid">{metrics.map(categoryTrendChart)}</div></Fold>
        {selectedCategories.map(category=><CategoryCard key={`${filters.product}-${category}`} category={category} filters={filters} onDrill={onDrill}/>)}
      </>}
    </Section>
  </div>;
}
