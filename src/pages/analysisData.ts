// References: none — new analysis page based on the supplied PRD and screenshots.
// Shared prototype snapshot; not connected to live financial data. Target values are deterministic demo data.
export type AnalysisTab = 'overview' | 'income' | 'pricing';
export interface AnalysisFilters { month: string; product: string; productLine: string; trueUp: string; sameProduct: string; targets: string[]; regions: string[] | null; areas: string[] | null; categories: string[] | null; units: string[] | null; }
export interface DrillFocus { units?: string[]; areas?: string[]; regions?: string[] | null; categories?: string[]; }
export interface AnalysisProps { filters: AnalysisFilters; onDrill: (tab: AnalysisTab, anchor: string, focus?: DrillFocus) => void; }
export const BYTEGRAPH = '分布式图数据库系统-Bytegraph';
export const TOS = '对象存储tos';
export const OTHER = '强一致的键值数据库';
export const products = [BYTEGRAPH, TOS, OTHER];
export const months = Array.from({length:9}, (_, i) => `2026-${String(9-i).padStart(2,'0')}`);
export const areaNames: Record<string,string> = { cn:'中国', us:'美国', eu:'欧洲 TTP', ap:'海外其他', OCI:'美国 TTP' };
export const areaRegions: Record<string,string[]> = {cn:['cn-east-1','cn-east-2','cn-north-1','cn-north-2','cn-north-3','cn-north-5','cn-north-6'],us:['us-east-1','us-west-1'],eu:['eu-west-1'],ap:['ap-1','ap-thailand','Asia-SouthEastBD'],OCI:['us-ttp-1']};
// References: none — V205 target display options backed by a local prototype target version.
export const targetOptions = ['月度目标值','季度目标值','年度目标值'];
export const defaultFilters: AnalysisFilters = {month:'2026-09', product:BYTEGRAPH, productLine:'研发商品中心-基础架构', trueUp:'不包含', sameProduct:'否', targets:[...targetOptions], areas:null, regions:null, categories:null, units:null};
export const normalizeAnalysisFilters = (filters:AnalysisFilters):AnalysisFilters => filters.product===TOS ? {...filters,regions:null} : filters;
export const unitCategories = (product:string):Record<string,string[]> => product===TOS ? {'请求':['Request'],'存储':['Storage','StorageEC']} : product===BYTEGRAPH ? {'计算':['bytegraph.cpu','bytegraph.mem'],'存储':['bytegraph.storage']} : {'其他':['kv.storage']};
export const unitOptions = (product:string, categories:string[]|null=null) => Object.entries(unitCategories(product)).filter(([category]) => categories===null || categories.includes(category)).flatMap(([,units])=>units);
export interface AnalysisRow { id:string; month:string; product:string; category:string; unit:string; area:string; region:string; income:number; cost:number|null; profit:number|null; rate:number|null; quantity:number; capacity:number|null; price:number|null; cumulativePrice:number|null; priceStatus:string; unitLabel:string; modelVersion:string; dataVersion:string; }
export const chartSeriesName=(dimensions:readonly (string|undefined)[],metric?:string)=>[dimensions.filter(Boolean).join('|'),metric].filter(Boolean).join(', ');
const pattern=[0.72,0.74,0.82,0.79,0.88,0.94,0.97,1.04,1];
export const snapshot:AnalysisRow[] = products.flatMap(product=>unitOptions(product).flatMap((unit,ui)=>Object.entries(areaRegions).flatMap(([area,regions],ai)=>regions.map((region,ri)=>Array.from({length:9},(_,mi)=>{
  const isTos=product===TOS, month=`2026-${String(mi+1).padStart(2,'0')}`;
  const scale=pattern[mi]*(1+ri*0.07);
  const base=(isTos?[12771000,203911000,123747000]:[5184000,6490000,4300000])[ui] ?? 1580000;
  const income=base*scale*(ai===0?1/7:[0,0.15,0.045,0.08,0.035][ai])/regions.length*(ai===0?7:1);
  const cost=isTos&&area!=='cn'?null:income*(isTos?[0.463,0.8975,0.8345][ui]:(ai===0?0.83:[0,1.32,0.95,1.09,0.94][ai]))*[1.1,1.06,1.12,.99,1.07,1.05,1.01,.97,1][mi];
  const quantity=income/(isTos?(ui===0?0.0015733115:0.0147295612):(ui===0?0.0338448634:ui===1?0.0089117632:0.0192460219));
  const price=isTos&&area!=='cn'?null:(isTos?(ui===0?0.0015733115:0.0147295612):(ui===0?0.0338448634:ui===1?0.0089117632:0.0192460219))*(1+(mi-8)*0.012);
  return {id:`${product}-${unit}-${area}-${region}-${month}`,month,product,category:Object.entries(unitCategories(product)).find(([,units])=>units.includes(unit))![0],unit,area,region,income,cost,profit:cost===null?null:income-cost,rate:cost===null||cost===0?null:(income-cost)/cost*100,quantity,capacity:cost===null?null:quantity/(ui===0?1.0159:0.824),price,cumulativePrice:price===null?null:price*0.986,priceStatus:'原型年度累计加权快照',unitLabel:isTos?(ui===0?'万次':'GB·月'):(ui===0?'核·日':ui===1?'GB·日':'GB·月'),modelVersion:'V2 · 2026-09',dataVersion:'原型目标 V1 · 2026-09'};
})).flat())));
const selected = (values:string[]|null,value:string)=>values===null||values.includes(value);
export function getRows(filters:AnalysisFilters, month=filters.month):AnalysisRow[] {
 return snapshot.filter(row=>row.product===filters.product&&row.month===month&&selected(filters.areas,row.area)&&selected(filters.categories,row.category)&&selected(filters.units,row.unit)&&(filters.product===TOS||selected(filters.regions,row.region))).map(row=>{
 const multiplier=(filters.trueUp==='包含'?1.012:1)*(filters.sameProduct==='是'?0.965:1);
 const income=row.income*multiplier;
 return {...row,income,profit:row.cost===null?null:income-row.cost,rate:row.cost===null||!row.cost?null:(income-row.cost)/row.cost*100};
 });
}
export function totals(rows:AnalysisRow[]) { const income=rows.reduce((s,r)=>s+r.income,0); const comparable=rows.filter(r=>r.cost!==null); const cost=comparable.reduce((s,r)=>s+(r.cost||0),0); const profit=comparable.reduce((s,r)=>s+(r.profit||0),0); return {income,cost,profit,rate:cost?profit/cost*100:null}; }
export function monthList(month:string) {return Array.from({length:Number(month.slice(-2))},(_,i)=>`2026-${String(i+1).padStart(2,'0')}`);}
export type FinancialMetric = 'income'|'cost'|'profit'|'rate';
export interface FinancialTargetSummary {
  monthlyActual:number|null;
  quarterlyActual:number|null;
  monthlyTarget:number|null;
  monthlyDeviation:number|null;
  quarterlyTarget:number|null;
  quarterlyDeviation:number|null;
  annualTarget:number|null;
  annualDeviation:number|null;
  yearToDateActual:number|null;
  annualTargetShare:number|null;
}
const stableHash=(value:string)=>Array.from(value).reduce((hash,char)=>(hash*31+char.charCodeAt(0))>>>0,2166136261);
export const prototypeTargetMultiplier=(row:AnalysisRow,seed:string,min=.92,max=1.12)=>{
  const ratio=(stableHash(`${seed}|${row.product}|${row.unit}|${row.area}|${row.region}|${row.month}`)%1001)/1000;
  return min+(max-min)*ratio;
};
export const prototypeTargetValue=(value:number|null|undefined,row:AnalysisRow,seed:string,min=.92,max=1.12)=>
  value===null||value===undefined||!Number.isFinite(value)?null:value*prototypeTargetMultiplier(row,seed,min,max);
const rowTarget=(row:AnalysisRow,key:Exclude<FinancialMetric,'rate'>)=>{
  if(key==='income')return prototypeTargetValue(row.income,row,'income-target',.94,1.1);
  if(key==='cost')return prototypeTargetValue(row.cost,row,'cost-target',.91,1.07);
  const income=prototypeTargetValue(row.income,row,'income-target',.94,1.1);
  const cost=prototypeTargetValue(row.cost,row,'cost-target',.91,1.07);
  return income===null||cost===null?null:income-cost;
};
export function financialMetricValue(rows:AnalysisRow[],key:FinancialMetric):number|null {
  const result=totals(rows);
  if(key==='income')return result.income;
  if(!rows.some(row=>row.cost!==null))return null;
  return result[key];
}
export function financialTargetValue(rows:AnalysisRow[],key:FinancialMetric):number|null {
  const comparable=rows.filter(row=>row.cost!==null);
  if(key==='income')return rows.reduce((sum,row)=>sum+(rowTarget(row,'income')||0),0);
  if(!comparable.length)return null;
  const cost=comparable.reduce((sum,row)=>sum+(rowTarget(row,'cost')||0),0);
  const profit=comparable.reduce((sum,row)=>sum+(rowTarget(row,'profit')||0),0);
  return key==='cost'?cost:key==='profit'?profit:cost?profit/cost*100:null;
}
export const metricDeviation=(actual:number|null,target:number|null,key:FinancialMetric|'price')=>
  actual===null||target===null||!Number.isFinite(actual)||!Number.isFinite(target)||target===0
    ?null
    :key==='rate'?actual-target:(actual-target)/Math.abs(target)*100;
const relativeTargetDeviation=(actual:number|null,target:number|null)=>
  actual===null||target===null||!Number.isFinite(actual)||!Number.isFinite(target)||target===0
    ?null
    :(actual-target)/Math.abs(target)*100;
export const quarterMonthList=(month:string)=>{
  const current=Number(month.slice(-2)),start=Math.floor((current-1)/3)*3+1;
  return Array.from({length:current-start+1},(_,index)=>`${month.slice(0,5)}${String(start+index).padStart(2,'0')}`);
};
export function annualTargetValue(rows:AnalysisRow[],key:FinancialMetric):number|null {
  const target=financialTargetValue(rows,key);
  if(target===null||key==='rate')return target;
  const coveredMonths=new Set(rows.map(row=>row.month)).size;
  return coveredMonths?target*12/coveredMonths:null;
}
export function financialTargetSummary(filters:AnalysisFilters,key:FinancialMetric):FinancialTargetSummary {
  const currentRows=getRows(filters);
  const quarterRows=quarterMonthList(filters.month).flatMap(month=>getRows(filters,month));
  const yearToDateRows=monthList(filters.month).flatMap(month=>getRows(filters,month));
  const annualRows=monthList('2026-09').flatMap(month=>getRows(filters,month));
  const actual=financialMetricValue(currentRows,key);
  const quarterActual=financialMetricValue(quarterRows,key);
  const yearToDateActual=financialMetricValue(yearToDateRows,key);
  const monthlyTarget=financialTargetValue(currentRows,key);
  const quarterlyTarget=financialTargetValue(quarterRows,key);
  const annualTarget=annualTargetValue(annualRows,key);
  return {
    monthlyActual:actual,
    quarterlyActual:key==='rate'?actual:quarterActual,
    monthlyTarget,
    monthlyDeviation:key==='rate'?relativeTargetDeviation(actual,monthlyTarget):metricDeviation(actual,monthlyTarget,key),
    quarterlyTarget,
    quarterlyDeviation:key==='rate'?relativeTargetDeviation(actual,quarterlyTarget):metricDeviation(quarterActual,quarterlyTarget,key),
    annualTarget,
    annualDeviation:metricDeviation(yearToDateActual,annualTarget,key),
    yearToDateActual,
    annualTargetShare:yearToDateActual===null||annualTarget===null||annualTarget===0?null:yearToDateActual/annualTarget*100,
  };
}
export function trendValues(filters:AnalysisFilters,key:'income'|'cost'|'profit'|'rate') {return monthList(filters.month).map(month=>({x:month, series:'实际值', value:totals(getRows(filters,month))[key] ?? 0}));}
export const amount=(value:number|null|undefined)=>value==null||!Number.isFinite(value)?'—':Math.abs(value)>=1e8?`${(value/1e8).toFixed(2)} 亿元`:Math.abs(value)>=1e4?`${(value/1e4).toFixed(2)} 万元`:`${value.toLocaleString('zh-CN',{maximumFractionDigits:2,minimumFractionDigits:2})} 元`;
export const percent=(value:number|null|undefined)=>value==null||!Number.isFinite(value)?'—':`${value.toFixed(2)}%`;
export const priceFormat=(value:number|null|undefined)=>value==null||!Number.isFinite(value)?'—':value.toFixed(10);
export const quantityFormat=(value:number|null|undefined)=>value==null?'—':Math.abs(value)>=1e8?`${(value/1e8).toFixed(2)} 亿`:Math.abs(value)>=1e4?`${(value/1e4).toFixed(2)} 万`:value.toLocaleString('zh-CN',{maximumFractionDigits:4});
