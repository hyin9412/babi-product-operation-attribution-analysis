// References: none — shared existing prototype cost snapshot presentation for income and pricing; no business allocation is inferred.
import React, { useState } from 'react';
import { Tooltip } from '@byted-babi/babi-design';
import { AnalysisFilters, AnalysisRow, TOS, amount, areaNames, getRows, monthList, normalizeAnalysisFilters, quantityFormat } from './analysisData';
import { AnalysisChart, ChartValue, DataTable, EmptyState, ExactValue, Fold, Note, Section, SourceTable, SourceTableSummary, sourcePaginationProps, trendMonthLabel } from './analysisUI';
import './pricing.css';

interface CostRow { id:string;unit:string;category:string;area:string;region?:string;capacity:number;unitLabel:string;cost:number;goods:Record<string,number>; }
const unique=(items:string[])=>Array.from(new Set(items));
const byteGoods=['Abase','其他商品','强一致的键值数据库','ByteStore池化存储'];
const tosGoods=['对象存储资源','系统云存储','其他商品'];
// References: none — retain the existing illustrative cost composition, explicitly not an attribution result.
function costRows(rows:AnalysisRow[],isTos:boolean):CostRow[] {
 const groups=new Map<string,CostRow>();
 rows.filter(row=>row.cost!==null).forEach(row=>{
  const id=`${row.unit}/${row.area}${isTos?'':'/'+row.region}`;
  const group=groups.get(id)||{id,unit:row.unit,category:row.category,area:row.area,region:isTos?undefined:row.region,capacity:0,unitLabel:row.unitLabel,cost:0,goods:{}};
  group.capacity+=row.capacity||0;group.cost+=row.cost||0;groups.set(id,group);
 });
 return Array.from(groups.values()).map(row=>{const names=isTos?tosGoods:byteGoods,weights=isTos?[.76,.19,.05]:[.583,.235,.152,.03];return {...row,goods:Object.fromEntries(names.map((name,i)=>[name,row.cost*weights[i]]))};});
}
function trends(filters:AnalysisFilters,category:string,kind:'cost'|'goods',grouping:'overall'|'area'|'region'='overall'):ChartValue[] {
 const tos=filters.product===TOS;
 return monthList(filters.month).flatMap(month=>{
  const original=getRows({...filters,regions:tos?null:filters.regions},month).filter(row=>row.category===category),rows=costRows(original,tos),x=month.slice(5)+'月';
  if(kind==='goods'){
   const names=tos?tosGoods:byteGoods;
   if(grouping==='overall')return names.map(series=>({x,series,value:rows.reduce((sum,row)=>sum+(row.goods[series]||0),0)}));
   const groups=new Map<string,number>();
   rows.forEach(row=>names.forEach(name=>{const series=`${row.unit} / ${grouping==='region'?row.region:row.area} / ${name}`;groups.set(series,(groups.get(series)||0)+(row.goods[name]||0));}));
   return Array.from(groups,([series,value])=>({x,series,value}));
  }
  return rows.map(row=>({x,series:`${row.unit} / ${row.area}${tos?'':'/'+row.region}`,value:row.cost}));
 });
}
const chartInsight=(values:ChartValue[],month:string,title:string)=>{
 const peak=values.filter((point):point is ChartValue&{value:number}=>point.value!==null&&Number.isFinite(point.value)).reduce<(ChartValue&{value:number})|null>((result,point)=>!result||point.value>=result.value?point:result,null);
 const highlight=peak?.series||'—';
 const peakMonth=peak?trendMonthLabel(month,peak.x):'—';
 const peakValue=peak?peak.value.toLocaleString('zh-CN',{maximumFractionDigits:2}):'—';
 return {summary:peak?`${highlight} 在 ${peakMonth} 达到${title}峰值 ${peakValue}。`:'当前范围暂无可用趋势数据。',moreInfo:[`口径月：${month}`,`高亮：${highlight}`,`峰值：${peak?`${peakMonth} ${peakValue}`:'—'}`],annotationPoint:peak?{x:peak.x,series:peak.series,value:peak.value}:null};
};
function CostCategory({category,rows,filters,detailed,showChartInsights,embeddedIncome=false}:{category:string;rows:CostRow[];filters:AnalysisFilters;detailed:boolean;showChartInsights:boolean;embeddedIncome?:boolean}) {
 const tos=filters.product===TOS,goods=tos?tosGoods:byteGoods;
 const [sort,setSort]=useState({key:'cost',order:'descend'});
 const columnSort=(key:string)=>({sorter:true,sortOrder:sort.key===key?sort.order:undefined,sortDirections:['descend','ascend']});
 const sorted=rows.map(row=>({...row,...row.goods})).sort((a,b)=>{const av=(a as any)[sort.key],bv=(b as any)[sort.key];return (sort.order==='descend'?-1:1)*(Number(av)-Number(bv))||a.unit.localeCompare(b.unit);});
 const dimensions:any[]=[
  {title:embeddedIncome?'收入计费单元':'计费单元',dataIndex:'unit',width:180,fixed:'left'},
  {title:'大区',dataIndex:'area',width:100,fixed:'left',render:(value:string)=><Tooltip content={areaNames[value]}>{value}</Tooltip>},
  ...(!tos?[{title:embeddedIncome?'收入售卖区域':'售卖区域',dataIndex:'region',width:160,fixed:'left'}]:[]),
 ];
 const capacityColumns:any[]=embeddedIncome?[]:[
  {title:'物理容量',dataIndex:'capacity',width:150,...columnSort('capacity'),render:(value:number)=><ExactValue value={value}>{quantityFormat(value)}</ExactValue>},
  {title:'单位',dataIndex:'unitLabel',width:100},
 ];
 const columns:any[]=[...dimensions,...capacityColumns,{title:'成本合计（人民币）',dataIndex:'cost',width:180,...columnSort('cost'),render:amount},...goods.map(name=>({title:name,dataIndex:name,width:180,...columnSort(name),render:amount}))];
 const sum=rows.reduce((total,row)=>total+row.cost,0);
 const unitLabels=unique(rows.map(row=>row.unitLabel));
 const capacity=rows.reduce((total,row)=>total+row.capacity,0);
 const goodsTotals=Object.fromEntries(goods.map(name=>[name,rows.reduce((total,row)=>total+(row.goods[name]||0),0)]));
 const capacitySummaryCells=unitLabels.length===1?[
  <SourceTableSummary.Cell key="capacity" className="analysis-summary-number"><ExactValue value={capacity}>{quantityFormat(capacity)}</ExactValue></SourceTableSummary.Cell>,
  <SourceTableSummary.Cell key="unit">{unitLabels[0]}</SourceTableSummary.Cell>,
 ]:[<SourceTableSummary.Cell key="capacity-unavailable" colSpan={2} className="analysis-summary-empty">不同单位不汇总</SourceTableSummary.Cell>];
 const summaryDetailCells=embeddedIncome?[]:capacitySummaryCells;
 const summary=()=> <SourceTableSummary fixed="top">
  <SourceTableSummary.Row className="analysis-summary-row">
   <SourceTableSummary.Cell colSpan={tos?2:3} className="analysis-summary-label">总计</SourceTableSummary.Cell>
   {summaryDetailCells}
   <SourceTableSummary.Cell className="analysis-summary-number">{amount(sum)}</SourceTableSummary.Cell>
   {goods.map(name=><SourceTableSummary.Cell key={name} className="analysis-summary-number">{amount(goodsTotals[name])}</SourceTableSummary.Cell>)}
  </SourceTableSummary.Row>
 </SourceTableSummary>;
 const composition=goods.map(name=>({id:name,product:name,item:name==='其他商品'?'其他资源计费项':`${name} · 纯资源成本`,amount:rows.reduce((total,row)=>total+(row.goods[name]||0),0)}));
 const trendChart=(title:string,values:ChartValue[],unit:string)=>{
  const insight=showChartInsights?chartInsight(values,filters.month,title):null;
  return <AnalysisChart title={title} values={values} unit={unit} summary={insight?.summary} moreInfo={insight?.moreInfo} annotationPoint={insight?.annotationPoint}/>;
 };
 const tableWidth=dimensions.reduce((sum,column)=>sum+column.width,0)+capacityColumns.reduce((sum,column)=>sum+column.width,0)+180+goods.length*180;
 const incomeTrendTitle=tos?'收入计费单元 & 大区 & 成本商品月趋势':'收入计费单元 & 收入售卖区域 & 成本商品月趋势';
 return <div className={`pricing-cost-category ${embeddedIncome?'income-cost-breakdown':''}`}>
  {!embeddedIncome&&<div className="pricing-category-head"><span>{category==='计算'?'计算资源':category==='存储'?'存储资源':category}</span></div>}
  <SourceTable columns={columns} data={sorted} pagination={sourcePaginationProps(sorted.length)} width={tableWidth} maxHeight={embeddedIncome?360:320} summary={summary} onChange={(_pagination:any,sorter:any)=>setSort(sorter?.field&&sorter?.direction?{key:sorter.field,order:sorter.direction}:{key:'cost',order:'descend'})}/>
  {!embeddedIncome&&<Fold title="查看成本商品计费项构成"><p className="plain-text">构成金额按原型快照示意比例展示，仅用于还原成本明细交互，不作为业务归因依据。</p><DataTable columns={[{title:'成本商品',dataIndex:'product',width:220},{title:'成本计费项',dataIndex:'item',width:300},{title:'金额',dataIndex:'amount',render:amount,sorter:(a:any,b:any)=>a.amount-b.amount}]} data={composition}/></Fold>}
  <Fold title="月趋势" appearance="filter"><div className={`analysis-chart-grid ${embeddedIncome?'income-cost-trend-grid':''}`}>{embeddedIncome
   ?trendChart(incomeTrendTitle,trends(filters,category,'goods',tos?'area':'region'),'人民币')
   :<>{trendChart('成本月趋势',trends(filters,category,'cost'),'人民币')}{trendChart('成本商品月趋势',trends(filters,category,'goods',detailed?'area':'overall'),'人民币')}{detailed&&!tos&&trendChart('计费单元 × 售卖区域 × 成本商品月趋势',trends(filters,category,'goods','region'),'人民币')}</>}</div></Fold>
 </div>;
}
export default function CostAnalysis({filters,id='pricing-item-cost',detailed=false,showChartInsights=false,embeddedIncome=false}:{filters:AnalysisFilters;id?:string;detailed?:boolean;showChartInsights?:boolean;embeddedIncome?:boolean}) {
 const safeFilters=normalizeAnalysisFilters(filters);
 const tos=safeFilters.product===TOS,rows=costRows(getRows(safeFilters),tos),categories=unique(rows.map(row=>row.category));
 if(embeddedIncome){
  return <div className="income-cost-breakdown-list">
   {rows.length===0?<EmptyState text="当前筛选无数据"/>:categories.map(category=><CostCategory key={`${safeFilters.product}-${category}-${safeFilters.month}`} category={category} rows={rows.filter(row=>row.category===category)} filters={safeFilters} detailed showChartInsights={showChartInsights} embeddedIncome/>)}
  </div>;
 }
 return <Section title="计费项成本" id={id} blue>
  {tos&&<Note tone="warning">对象存储 TOS 的成本源数据仅支持“计费单元 × 大区”，不按售卖区域拆分，也不按收入占比分摊。请移除“售卖区域”分析维度后查看，避免把大区成本误认为售卖区域成本。</Note>}
  {rows.length===0?<EmptyState text="当前筛选无数据"/>:categories.map(category=><CostCategory key={`${safeFilters.product}-${category}-${safeFilters.month}`} category={category} rows={rows.filter(row=>row.category===category)} filters={safeFilters} detailed={detailed} showChartInsights={showChartInsights}/>)}
 </Section>;
}
