// References: none — new PRD page controller; screenshot layout and explicit query/drill state contract.
import React, {useEffect,useMemo,useRef,useState} from 'react';
import {Alert, Button, Message, Tabs, Tag} from '@byted-babi/babi-design';
import Popover from './AnalysisPopover';
import AnalysisMonthPicker from './AnalysisMonthPicker';
import AnalysisFilterGrid from './AnalysisFilterGrid';
import {getMultiFilterSummary,type FilterSummaryItem} from './analysisFilterSummary';
import {IconDown, IconRight} from '@arco-design/iconbox-react-ve-o-design';
import {useSearchParams} from 'react-router-dom';
import OverviewTab from './OverviewTab';
import IncomeTab from './IncomeTab';
import PricingTab from './PricingTab';
import {AnalysisFilters,AnalysisTab,DrillFocus,BYTEGRAPH,TOS,products,months,areaNames,areaRegions,defaultFilters,normalizeAnalysisFilters,unitCategories,unitOptions,targetOptions} from './analysisData';
import {AnalysisSelect as Select,Field,FilterSummary,MultiFilter,SELECT_SEARCH_THRESHOLD,getSelectPlaceholder} from './analysisUI';
import './analysis.css';
const tabNames:Record<AnalysisTab,string>={overview:'商品概览',income:'收支分析',pricing:'成本定价'};
const TOS_REGION_DISABLED_TIP='不适用';
export default function AnalysisPage(){
 const [params,setParams]=useSearchParams();
 const initialProduct=params.get('product')==='tos'?TOS:params.get('product')&&products.includes(params.get('product')!)?params.get('product')!:BYTEGRAPH;
 const readSelection=(key:string):string[]|null=>params.has(key)?(params.get(key)?params.get(key)!.split(','):(key==='areas'||key==='regions'?null:[])):null;
 const initialFilters:AnalysisFilters=normalizeAnalysisFilters({...defaultFilters,targets:params.has('targets')?(params.get('targets')||'').split(',').filter(value=>targetOptions.includes(value)):[...targetOptions],product:initialProduct,month:months.includes(params.get('month')||'')?params.get('month')!:defaultFilters.month,units:readSelection('units'),categories:readSelection('categories'),areas:readSelection('areas'),regions:readSelection('regions')});
 const [tab,setTab]=useState<AnalysisTab>(['overview','income','pricing'].includes(params.get('tab')||'')?params.get('tab') as AnalysisTab:'overview');
 const [draft,setDraft]=useState<AnalysisFilters>(initialFilters),[applied,setApplied]=useState<AnalysisFilters>(initialFilters);
 // References: none — user-requested pricing draft/query isolation; results and URL retain the last submitted filters.
 const [pricing,setPricing]=useState<AnalysisFilters>(initialFilters);
 const [pricingDraft,setPricingDraft]=useState<AnalysisFilters>(initialFilters);
 const [expanded,setExpanded]=useState(true);
 useEffect(()=>{
  let previousY=window.scrollY;
  const collapseOnScroll=()=>{
   const currentY=window.scrollY;
   if(currentY>previousY)setExpanded(false);
   previousY=currentY;
  };
  window.addEventListener('scroll',collapseOnScroll,{passive:true});
  return()=>window.removeEventListener('scroll',collapseOnScroll);
 },[]);
 const [loading,setLoading]=useState(false);
 const [queryAttempted,setQueryAttempted]=useState(false);
 useEffect(()=>{setQueryAttempted(false);},[tab]);
 const stickyHeaderRef=useRef<HTMLDivElement>(null);
 // References: none — fixed page controls share one sticky surface; anchor offsets follow expanded/collapsed filter height.
 useEffect(()=>{const header=stickyHeaderRef.current;if(!header)return;const updateOffset=()=>header.parentElement?.style.setProperty('--analysis-sticky-offset',`${header.getBoundingClientRect().height+48}px`);updateOffset();const observer=new ResizeObserver(updateOffset);observer.observe(header);return()=>observer.disconnect();},[]);
 const filters=tab==='pricing'?pricingDraft:draft;
 const active=tab==='pricing'?pricing:applied;
 const dirty=JSON.stringify(filters)!==JSON.stringify(active);
 const categoryOptions=Object.keys(unitCategories(filters.product));
 const units=unitOptions(filters.product,filters.categories);
 const areas=Object.keys(areaNames);
 const regions=(filters.areas===null?areas:filters.areas).flatMap(area=>areaRegions[area]||[]);
 const updateUrl=(nextTab:AnalysisTab,nextFilters:AnalysisFilters)=>{const next=normalizeAnalysisFilters(nextFilters);const query:Record<string,string>={tab:nextTab,product:next.product===TOS?'tos':next.product,month:next.month,targets:next.targets.join(',')};(['units','categories','areas','regions'] as const).forEach(key=>{if(next[key]!==null)query[key]=next[key]!.join(',');});setParams(query,{replace:true});};
 useEffect(()=>{document.title='透明化分析 · BABI';document.documentElement.classList.add('analysis-scroll');return()=>document.documentElement.classList.remove('analysis-scroll');},[]);
 useEffect(()=>{const requested=params.get('tab') as AnalysisTab;if(requested&&requested!==tab&&requested in tabNames){setTab(requested);setExpanded(true);setDraft(initialFilters);setApplied(initialFilters);setPricing(initialFilters);setPricingDraft(initialFilters);}},[params]);
 const update=(key:keyof AnalysisFilters,value:any)=>{
  setQueryAttempted(false);
  const current=filters;
  let next:AnalysisFilters={...current,[key]:value};
  if(key==='month'&&tab!=='pricing')next={...defaultFilters,month:value,trueUp:current.trueUp,sameProduct:current.sameProduct,targets:current.targets};
  if(key==='productLine')next={...next,product:BYTEGRAPH,areas:null,regions:null,categories:null,units:null};
  if(key==='product')next={...next,areas:null,regions:null,categories:null,units:null};
  if(key==='categories')next={...next,units:null,areas:null,regions:null};
  if(key==='units')next={...next,areas:null,regions:null};
  if(key==='areas')next={...next,regions:Array.isArray(value)&&value.length===0?[]:null};
  if(next.product===TOS)next.regions=null;
  next=normalizeAnalysisFilters(next);
  if(tab==='pricing')setPricingDraft(next);else setDraft(next);
 };
 const changeTab=(next:AnalysisTab)=>{if(next===tab||loading)return;setTab(next);setExpanded(true);if(next==='pricing'){const nextPricing=normalizeAnalysisFilters(applied);setPricing(nextPricing);setPricingDraft(nextPricing);updateUrl(next,nextPricing);}else updateUrl(next,applied);window.scrollTo({top:0,behavior:'smooth'});};
  const requiredFields:[keyof AnalysisFilters,string][]=[['month','账期'],['product','商品名称'],['areas',tab==='pricing'?'大区':'售卖大区']];
  if(tab==='pricing')requiredFields.push(['categories','收入计费单元类别'],['units','收入计费单元']);
  else requiredFields.push(['trueUp','海外即时 True Up 账单'],['sameProduct','同商品过滤'],['productLine','部门收支_产品线名称']);
  if(filters.product!==TOS)requiredFields.push(['regions','收入售卖区域']);
  const missing=requiredFields.filter(([key])=>{
   const value=filters[key];
   if(Array.isArray(value))return value.length===0;
   if(value===null){
    if(key==='categories')return categoryOptions.length===0;
    if(key==='units')return units.length===0;
    if(key==='areas')return areas.length===0;
    if(key==='regions')return regions.length===0;
   }
   return value==='';
  });
 const queryDisabled=!dirty||loading;
 const query=()=>{
  if(!dirty||loading)return;
  setQueryAttempted(true);
  if(missing.length){Message.error({content:`请选择必填项：${missing.map(([,label])=>label).join('、')}`});return;}
  setLoading(true);const snapshot=normalizeAnalysisFilters({...filters});window.setTimeout(()=>{if(tab==='pricing')setPricing(snapshot);else setApplied(snapshot);updateUrl(tab,snapshot);setLoading(false);Message.success({content:'数据已更新'});},480);
 };
 const onDrill=(nextTab:AnalysisTab,anchor:string,focus:DrillFocus={})=>{
  let next=normalizeAnalysisFilters({...applied,...focus});
  if(nextTab==='pricing'){if(next.product===TOS&&next.areas===null)next.areas=['cn'];setPricing(next);setPricingDraft(next);}else{setApplied(next);setDraft(next);}
  setTab(nextTab);setExpanded(true);updateUrl(nextTab,next);
  if(nextTab==='pricing'){window.scrollTo({top:0,behavior:'instant'});}else{window.setTimeout(()=>{document.getElementById(anchor)?.scrollIntoView({behavior:'smooth',block:'start'});},180);}
};
 // References: none — all tabs summarize submitted filters, never pending draft selections.
 const summaryRegionOptions=(active.areas===null?areas:active.areas).flatMap(area=>areaRegions[area]||[]);
 const summary:FilterSummaryItem[]=tab==='pricing'?
  [['商品名称',active.product],['账期',active.month],
   getMultiFilterSummary('收入计费单元类别',active.categories,Object.keys(unitCategories(active.product))),
   getMultiFilterSummary('收入计费单元',active.units,unitOptions(active.product,active.categories)),
   getMultiFilterSummary('大区',active.areas,areas),
   active.product===TOS?['收入售卖区域',TOS_REGION_DISABLED_TIP]:getMultiFilterSummary('收入售卖区域',active.regions,summaryRegionOptions),
   getMultiFilterSummary('目标值对比',active.targets,targetOptions,'不对比')]:
  [['部门收支_产品线名称',active.productLine],['商品名称',active.product],
   getMultiFilterSummary('售卖大区',active.areas,areas),
   active.product===TOS?['收入售卖区域',TOS_REGION_DISABLED_TIP]:getMultiFilterSummary('收入售卖区域',active.regions,summaryRegionOptions),
   ['账期',active.month],getMultiFilterSummary('目标值对比',active.targets,targetOptions,'不对比'),
   ['海外即时 True Up 账单',active.trueUp],['同商品过滤',active.sameProduct]];
  const single=(label:string,key:keyof AnalysisFilters,options:string[])=>{
   const searchable=key==='productLine'||key==='product'||options.length > SELECT_SEARCH_THRESHOLD;
   return <Field label={label} required><Select aria-label={label} aria-required defaultActiveFirstOption={false} showSearch={searchable} value={filters[key] as string} options={options} placeholder={getSelectPlaceholder(searchable)} onChange={value=>update(key,value)}/></Field>;
  };
 const multi=(label:string,key:keyof AnalysisFilters,options:string[],disabled=false)=> <Field label={label} required={key!=='targets'}><MultiFilter value={filters[key] as string[]|null} options={options} onChange={value=>update(key,value)} disabled={disabled} requiredLabel={key==='areas'||key==='regions'?label:undefined} showValidation={queryAttempted} allowClear={key!=='areas'&&key!=='regions'}/></Field>;
 const regionDisabled=filters.product===TOS || filters.areas?.length===0;
 const regionFilter=regionDisabled?<Field label="收入售卖区域" required><Popover content={filters.product===TOS?TOS_REGION_DISABLED_TIP:'请先选择售卖大区'} trigger="hover" position="top" unmountOnExit><span className="filter-disabled-popover-trigger"><Select defaultActiveFirstOption={false} disabled placeholder="请选择"/></span></Popover></Field>:multi('收入售卖区域','regions',regions);
 return <main className={`analysis-page${loading?' content-loading':''}`} aria-busy={loading}><div className="analysis-sticky-header" ref={stickyHeaderRef}><header className="analysis-page-header"><h1>透明化分析</h1><Tabs className="analysis-tabs" type="line" activeTab={tab} headerPadding={false} onChange={key=>changeTab(key as AnalysisTab)}>{(Object.keys(tabNames) as AnalysisTab[]).map(key=><Tabs.TabPane key={key} title={tabNames[key]}/>)}</Tabs><a href={`${import.meta.env.BASE_URL}docs/operation-conclusion-card-guide-topology.html`} target="_blank" rel="noopener noreferrer" style={{marginLeft:'auto',paddingLeft:16,color:'rgb(var(--primary-6))',fontSize:12,whiteSpace:'nowrap'}}>交互说明</a></header>
 <div className={`filter-panel${expanded?'':' filter-panel-collapsed'}`}><div className="filter-heading"><Popover content={expanded?'收起':'展开'} trigger="hover" position="top" unmountOnExit><span className="filter-toggle-popover-trigger"><Button type="text" size="mini" shape="square" className="filter-toggle" icon={expanded?<IconDown width="16" height="16"/>:<IconRight width="16" height="16"/>} aria-label={expanded?'收起筛选':'展开筛选'} aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}/></span></Popover><h2 style={{ 'fontSize': '14px' }}>全局筛选</h2><div className="filter-caliber"><Tag size="small" bordered className="filter-caliber-tag">日正式+月正式</Tag><Tag size="small" bordered className="filter-caliber-tag">人民币</Tag><Tag size="small" bordered className="filter-caliber-tag">纯资源</Tag></div></div>
 {expanded?<><AnalysisFilterGrid className={tab==='pricing'?'pricing-filters':''}>
 {tab==='pricing'?<>{single('商品名称','product',products)}<Field label="账期" required><AnalysisMonthPicker value={filters.month} onChange={value=>update('month',value)}/></Field>{multi('收入计费单元类别','categories',categoryOptions)}{multi('收入计费单元','units',units)}{multi('大区','areas',areas)}{regionFilter}{multi('目标值对比','targets',targetOptions)}</>:<>{single('部门收支_产品线名称','productLine',['研发商品中心-基础架构'])}{single('商品名称','product',products)}{multi('售卖大区','areas',areas)}{regionFilter}<Field label="账期" required><AnalysisMonthPicker value={filters.month} onChange={value=>update('month',value)}/></Field>{multi('目标值对比','targets',targetOptions)}{single('海外即时 True Up 账单','trueUp',['不包含','包含'])}{single('同商品过滤','sameProduct',['否','是'])}</>}
   <div className="filter-query-slot"><Button type="primary" disabled={queryDisabled} loading={loading} className={!queryDisabled?'pending-query':''} onClick={query}>查询</Button></div>
  </AnalysisFilterGrid></>:<FilterSummary items={summary}/>}
 </div>
 {dirty&&<Alert className="pending-warning" type="warning" content="筛选条件已变更，当前仍展示上次查询结果，请点击“查询”刷新数据"/>}</div>

 {tab==='overview'?<OverviewTab filters={active} onDrill={onDrill}/>:tab==='income'?<IncomeTab filters={active} onDrill={onDrill}/>:<PricingTab filters={active} onDrill={onDrill}/>}
 </main>;
}
