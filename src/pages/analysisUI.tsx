// References: none — PRD screenshot aligned primitives shared by the three analysis tabs.
import React, {useState} from 'react';
import { Alert, Button, Checkbox, Pagination, Popover, Select, Tag, Tooltip } from '@byted-babi/babi-design';
import TableBlock from '@byted-babi/babi-design/es/TableBlock';
import { IconDown, IconUp, IconRight, IconPageEmpty, IconEmptyChart, IconNoContent, IconQueryFailed } from '@arco-design/iconbox-react-babi';
import { VChart } from '@visactor/react-vchart';
export const Section=({title,children,id,subtitle,extra,blue=false}:{title:React.ReactNode;children:React.ReactNode;id?:string;subtitle?:React.ReactNode;extra?:React.ReactNode;blue?:boolean})=><section id={id} className={`analysis-section ${blue?'section-blue':''}`}><div className="section-heading"><h2>{title}</h2>{extra}</div>{subtitle&&<p className="section-subtitle">{subtitle}</p>}{children}</section>;
export const Note=({children,tone='info'}:{children:React.ReactNode;tone?:'info'|'warning'|'error'})=><Alert className="analysis-note" type={tone} content={children}/>;
export type SemanticCardTone = 'red' | 'blue' | 'green' | 'yellow' | 'neutral';
export interface SemanticCardNoteField {
 label: React.ReactNode;
 value: React.ReactNode;
}
export interface SemanticMetricCardProps {
 title: React.ReactNode;
 tone?: SemanticCardTone;
 icon?: React.ReactNode;
 value?: React.ReactNode;
 unit?: React.ReactNode;
 text?: React.ReactNode;
 noteFields?: SemanticCardNoteField[];
 description?: React.ReactNode;
 className?: string;
}
const SemanticTruncatedText=({children,className='',as='span',styleWidth}:{children:React.ReactNode;className?:string;as?:'span'|'strong'|'div';styleWidth?:number|null})=>{
 const ref=React.useRef<HTMLElement|null>(null);
 const [isOverflowing,setIsOverflowing]=useState(false);
 React.useEffect(()=>{
  const element=ref.current;
  if(!element)return;
  const check=()=>setIsOverflowing(current=>{
   const next=element.scrollWidth>element.clientWidth+1||element.scrollHeight>element.clientHeight+1;
   return current===next?current:next;
  });
  check();
  const Observer=typeof ResizeObserver==='undefined'?null:ResizeObserver;
  const observer=Observer?new Observer(check):null;
  observer?.observe(element);
  window.addEventListener('resize',check);
  return ()=>{
   observer?.disconnect();
   window.removeEventListener('resize',check);
  };
 },[children,isOverflowing]);
 const commonProps={ref:ref as React.Ref<any>,className:`semantic-card-truncate ${className}`.trim(),style:styleWidth===null||styleWidth===undefined?undefined:{width:styleWidth,flexBasis:styleWidth,maxWidth:styleWidth}};
 const node=as==='strong'?<strong {...commonProps}>{children}</strong>:as==='div'?<div {...commonProps}>{children}</div>:<span {...commonProps}>{children}</span>;
 return isOverflowing?<Popover content={children} trigger="hover" unmountOnExit>{node}</Popover>:node;
};
const MIN_SEMANTIC_FIELD_WIDTH=36;
const MIN_SEMANTIC_FIELD_VALUE_WIDTH=16;
const SemanticCardFields=({fields}:{fields:SemanticCardNoteField[]})=>{
 const groupRef=React.useRef<HTMLDivElement|null>(null);
 const fieldRefs=React.useRef<(HTMLDivElement|null)[]>([]);
 const [widths,setWidths]=useState<{field:number|null;label:number|null;value:number|null}[]>([]);
 React.useLayoutEffect(()=>{
  const group=groupRef.current;
  if(!group)return;
  const calculate=()=>{
   const elements=fieldRefs.current.slice(0,fields.length).filter(Boolean) as HTMLDivElement[];
   if(!elements.length)return;
   const margins=elements.reduce((sum,element,index)=>sum+(index===0?0:parseFloat(window.getComputedStyle(element).marginLeft)||0),0);
   const available=Math.max(0,group.clientWidth-margins);
   const measured=elements.map(element=>{
    const clone=element.cloneNode(true) as HTMLDivElement;
    clone.style.position='absolute';
    clone.style.visibility='hidden';
    clone.style.pointerEvents='none';
    clone.style.flex='none';
    clone.style.width='max-content';
    clone.style.maxWidth='none';
    clone.style.left='-9999px';
    clone.style.top='0';
    group.appendChild(clone);
    const width=clone.getBoundingClientRect().width;
    const labelWidth=clone.querySelector('.semantic-card-field-label')?.getBoundingClientRect().width||0;
    const valueWidth=clone.querySelector('strong')?.getBoundingClientRect().width||0;
    const gap=parseFloat(window.getComputedStyle(clone).gap)||0;
    const horizontalPadding=(parseFloat(window.getComputedStyle(clone).paddingLeft)||0)+(parseFloat(window.getComputedStyle(clone).paddingRight)||0);
    group.removeChild(clone);
    return {field:width,label:labelWidth,value:valueWidth,gap,horizontalPadding};
   });
   const desired=measured.map(item=>item.field);
   const total=desired.reduce((sum,width)=>sum+width,0);
   if(total<=available){
    const next=Array.from({length:fields.length},()=>({field:null,label:null,value:null}));
    setWidths(current=>current.length===next.length&&current.every((item,index)=>item.field===next[index].field&&item.label===next[index].label&&item.value===next[index].value)?current:next);
    return;
   }
   let remaining=available;
   const next=desired.map((width,index)=>{
    const laterCount=fields.length-index-1;
    const reserveForLater=laterCount*MIN_SEMANTIC_FIELD_WIDTH;
    const maxForCurrent=Math.max(0,remaining-reserveForLater);
    const allocated=Math.min(width,maxForCurrent);
    remaining-=allocated;
    const item=measured[index];
    const innerAvailable=Math.max(0,allocated-item.horizontalPadding-item.gap);
    if(allocated>=width)return {field:null,label:null,value:null};
    if(innerAvailable>=item.label+MIN_SEMANTIC_FIELD_VALUE_WIDTH){
     return {field:Math.max(0,allocated),label:null,value:Math.max(0,innerAvailable-item.label)};
    }
    const valueWidth=Math.min(item.value,MIN_SEMANTIC_FIELD_VALUE_WIDTH,innerAvailable);
    return {field:Math.max(0,allocated),label:Math.max(0,innerAvailable-valueWidth),value:valueWidth};
   });
   setWidths(current=>current.length===next.length&&current.every((item,index)=>item.field===next[index].field&&item.label===next[index].label&&item.value===next[index].value)?current:next);
  };
  calculate();
  const Observer=typeof ResizeObserver==='undefined'?null:ResizeObserver;
  const observer=Observer?new Observer(calculate):null;
  observer?.observe(group);
  window.addEventListener('resize',calculate);
  return ()=>{
   observer?.disconnect();
   window.removeEventListener('resize',calculate);
  };
 },[fields]);
 return <div className="semantic-card-fields" ref={groupRef}>{fields.map((field,index)=>{
  const fieldWidth=widths[index]?.field;
  const fieldStyle=fieldWidth===null||fieldWidth===undefined?{flexShrink:1+index*1000}:{flexBasis:fieldWidth,maxWidth:fieldWidth,flexShrink:1+index*1000};
  return <div className="semantic-card-field" key={index} ref={element=>{fieldRefs.current[index]=element;}} style={fieldStyle}><SemanticTruncatedText className="semantic-card-field-label" styleWidth={widths[index]?.label}>{field.label}</SemanticTruncatedText><SemanticTruncatedText as="strong" styleWidth={widths[index]?.value}>{field.value}</SemanticTruncatedText></div>;
 })}</div>;
};
export const SemanticMetricCard=({title,tone='neutral',icon,value,unit,text,noteFields,description,className=''}:SemanticMetricCardProps)=>{
 const hasValue=value!==undefined&&value!==null;
 const fields=noteFields?.filter(field=>field.label!==undefined||field.value!==undefined);
 return <article className={`semantic-card semantic-card-${tone} ${className}`.trim()}>
  <div className="semantic-card-title">{icon&&<span className="semantic-card-icon" aria-hidden>{icon}</span>}<SemanticTruncatedText>{title}</SemanticTruncatedText></div>
  <div className={`semantic-card-main ${hasValue?'is-numeric':'is-text'}`}>
   {hasValue ? <><SemanticTruncatedText className="semantic-card-value">{value}</SemanticTruncatedText>{unit!==undefined&&unit!==null&&<SemanticTruncatedText className="semantic-card-unit">{unit}</SemanticTruncatedText>}</> : <SemanticTruncatedText>{text}</SemanticTruncatedText>}
  </div>
  {!!fields?.length&&<SemanticCardFields fields={fields}/>}
  {!fields?.length&&description&&<SemanticTruncatedText as="div" className="semantic-card-description">{description}</SemanticTruncatedText>}
 </article>;
};
type EmptyKind = 'data' | 'search' | 'content' | 'chart';
type EmptySize = 48 | 60 | 80 | 96 | 120;
const emptyKindFromText = (text:string):EmptyKind => {
 if (/筛选|匹配|搜索/.test(text)) return 'search';
 if (/图表|可用数据|按日|月日均/.test(text)) return 'chart';
 if (/暂不支持|暂未接入|未接入|未选择|已隐藏|可比成本/.test(text)) return 'content';
 return 'data';
};
const normalizeEmptyTitle = (text:string) => {
 if (/筛选|匹配|搜索/.test(text)) return '未找到匹配结果';
 if (/暂不支持/.test(text)) return '暂不支持';
 if (/暂未接入|未接入|按日|月日均/.test(text)) return '暂未接入';
 if (/未选择|已隐藏/.test(text)) return '暂无内容';
 return '暂无数据';
};
export const EmptyState=({text='暂无数据',kind,compact=false,size}:{text?:string;kind?:EmptyKind;compact?:boolean;size?:EmptySize})=>{
 const resolvedKind=kind||emptyKindFromText(text);
 const title=normalizeEmptyTitle(text);
 const displayText=text!==title && text!=='当前筛选无数据' ? text : title;
 const Icon=resolvedKind==='chart'?IconEmptyChart:resolvedKind==='content'?IconNoContent:resolvedKind==='search'?IconQueryFailed:IconPageEmpty;
 const resolvedSize=size||(compact?60:resolvedKind==='content'?60:80);
 const autoResponsive=!size&&!compact&&resolvedKind==='data';
 return <div className={`analysis-empty analysis-empty-${resolvedKind}${compact?' compact':''}${autoResponsive?' auto-responsive':''}`} data-size={resolvedSize} role="status" aria-live="polite"><Icon className="analysis-empty-icon"/><div className="analysis-empty-detail">{displayText}</div></div>;
};
export const QuickLink=({children,onClick,disabled=false}:{children:React.ReactNode;onClick:()=>void;disabled?:boolean})=><Button size="small" type="text" className="quick-link" disabled={disabled} onClick={onClick}>{children}<IconRight useCurrentColor/></Button>;
export const Field=({label,children}:{label:string;children:React.ReactNode})=><div className="analysis-field"><label>{label}</label>{children}</div>;
export const SELECT_SEARCH_THRESHOLD = 10;
export const getSelectPlaceholder = (searchable:boolean) => searchable ? '请输入' : '请选择';
// References: none — keep the region popup in the same sticky coordinate space as its summary trigger.
const getFilterPopupContainer = (node:HTMLElement) => node.closest('.analysis-sticky-header') || document.body;
// References: none — Figma 5325:124983 / 5325:125306 summary and ByteTree 7072:122364 popup list styling; supplied region names and popup direction are unchanged.
export function FilterSummary({items,regions}:{items:string[][];regions?:string[]}) {
 return <div className="filter-summary">{items.map(([label,value])=>{const isRegionLabel=label.endsWith('售卖区域');return <Tag key={label} size="small" bordered={false} className="filter-summary-tag" data-testid={isRegionLabel?'filter-region-summary':undefined}><span className="filter-summary-label">{label}：</span>{isRegionLabel && regions!==undefined ? <Popover className="filter-region-popover" style={{width:'max-content',maxWidth:280}} title={`共 ${regions.length} 个${label}`} trigger="hover" position="bl" getPopupContainer={getFilterPopupContainer} unmountOnExit content={<div className="filter-region-details" data-testid="filter-region-details">{regions.length ? <ol className="filter-region-list">{regions.map(region=><li key={region}>{region}</li>)}</ol> : <span className="filter-region-empty">当前未选择{label}</span>}</div>}><Button type="text" size="mini" className="filter-region-count" data-testid="filter-region-count">共 {regions.length} 个</Button></Popover> : <span className="filter-summary-value">{value}</span>}</Tag>;})}</div>;
}
export function MultiFilter({value,options,onChange,disabled=false}:{value:string[]|null;options:string[];onChange:(value:string[])=>void;disabled?:boolean}) {
 // References: none — Figma 5324:123773 menu presentation; existing option values and callbacks are unchanged.
 const selected = value === null ? options : value;
 const selectedCount = options.filter(option => selected.includes(option)).length;
 const allSelected = options.length > 0 && selectedCount === options.length;
 return <Select defaultActiveFirstOption={false} mode="multiple" animation={false} allowClear showSearch={options.length > SELECT_SEARCH_THRESHOLD} value={selected} options={options} placeholder={getSelectPlaceholder(options.length > SELECT_SEARCH_THRESHOLD)} maxTagCount={1} disabled={disabled} onChange={onChange} dropdownRender={menu=><div className="analysis-multi-menu"><div className="analysis-multi-options">{menu}</div><div className="analysis-multi-footer" onMouseDown={event=>event.preventDefault()}><Checkbox checked={allSelected} indeterminate={selectedCount > 0 && !allSelected} disabled={disabled || options.length === 0} onChange={checked=>onChange(checked ? options : [])}>全部<span className="analysis-multi-total">（共 {options.length} ）</span></Checkbox></div></div>}/>;
}
const textFromNode=(node:any):string=>{
 if(node===null||node===undefined||typeof node==='boolean')return '';
 if(typeof node==='string'||typeof node==='number')return String(node);
 if(Array.isArray(node))return node.map(textFromNode).join('');
 if(React.isValidElement(node))return textFromNode((node.props as any)?.children);
 return '';
};
const comparableNumericTitle=/收入|成本|利润|利润率|售卖率|环比|同比|占比|比例|比率|目标|偏差|实际值|累计|金额|数量|物理容量|容量|售卖量|单价|价格|费用|达成率|差异/;
const nonComparableTitle=/对象|计费单元|大区|售卖区域|商品\s*\/\s*范围|成本商品|范围|下钻|解读|判断|建议|动作|依据|计费项|单位（|售卖量单位|单价单位|计费方式|账期月份|月份|优先级|定位/;
const nonComparableField=/^(id|unit|area|region|product|item|scope|object|basis|action|month|unitLabel|priority)$/i;
const columnField=(column:any)=>column.dataIndex??column.field??column.key;
const hasNumericData=(column:any,data:any[])=>{
 const field=columnField(column);
 if(typeof field!=='string'||nonComparableField.test(field))return false;
 return data.some(row=>typeof row?.[field]==='number'&&Number.isFinite(row[field]));
};
const isComparableNumericColumn=(column:any,data:any[])=>{
 const title=textFromNode(column.title);
 const field=String(columnField(column)??'');
 if(nonComparableField.test(field)||nonComparableTitle.test(title))return false;
 return hasNumericData(column,data)||comparableNumericTitle.test(title);
};
const uniqueColumns=(columns:any[],data:any[]=[],prefix='column'):any[]=>columns.map((column,index)=>{
 const children=column.children?uniqueColumns(column.children,data,`${prefix}-${index}`):undefined;
 const shouldAlignRight=!children&&column.align===undefined&&isComparableNumericColumn(column,data);
 return {...column,key:`${prefix}-${index}`,children,align:shouldAlignRight?'right':column.align};
});
export const TABLE_PAGE_SIZE_OPTIONS = [10,20,50,100];
export const sourcePaginationProps=(total:number,overrides:any={})=>({
 total,
 defaultPageSize:10,
 hideOnSinglePage:false,
 showTotal:(count:number)=>`共 ${count} 条`,
 sizeCanChange:true,
 sizeOptions:TABLE_PAGE_SIZE_OPTIONS,
 pageSizeChangeResetCurrent:true,
 ...overrides,
});
const resolveTablePagination=(pagination:any,total:number)=>pagination&&pagination!==true?sourcePaginationProps(total,pagination):sourcePaginationProps(total);
const SourceBaseTable=TableBlock.Table;
export const SourceTable=({columns,data,width,pagination,maxHeight,noDataElement,onChange,footer,className='',...rest}:{columns:any[];data:any[];width?:number;pagination?:any;maxHeight?:number;noDataElement?:React.ReactNode;onChange?:any;footer?:any;className?:string;[key:string]:any})=>{
 const resolvedPagination=resolveTablePagination(pagination,data.length);
 const [current,setCurrent]=React.useState(resolvedPagination.current||1);
 const [pageSize,setPageSize]=React.useState(resolvedPagination.pageSize||resolvedPagination.defaultPageSize||10);
 React.useEffect(()=>{setCurrent(1);},[data.length]);
 const safePageSize=pageSize||10;
 const maxPage=Math.max(1,Math.ceil(data.length/safePageSize));
 const safeCurrent=Math.min(current,maxPage);
 const pageData=data.slice((safeCurrent-1)*safePageSize,safeCurrent*safePageSize);
 return <div className={`analysis-table source-analysis-table ${className}`.trim()}>
  <SourceBaseTable rowKey="id" border={{wrapper:true}} columns={uniqueColumns(columns,data)} dataSource={pageData} pagination={false} scroll={width||maxHeight?{x:width,y:maxHeight}:undefined} noDataElement={noDataElement||<EmptyState compact size={60}/>} onChange={onChange} footer={footer} {...rest}/>
  <div className="source-table-pagination"><Pagination {...resolvedPagination} current={safeCurrent} pageSize={safePageSize} onChange={(nextPage:number,nextSize:number)=>{setPageSize(nextSize||safePageSize);setCurrent(nextSize&&nextSize!==safePageSize?1:nextPage);}} onPageSizeChange={(nextSize:number)=>{setPageSize(nextSize);setCurrent(1);}}/></div>
 </div>;
};
export const DataTable=SourceTable;
export function Fold({title,children,defaultOpen=false}:{title:string;children:React.ReactNode;defaultOpen?:boolean}) {const [open,setOpen]=useState(defaultOpen);return <div className="analysis-fold"><Button long type="text" className="fold-button" onClick={()=>setOpen(!open)}>{title}<span>{open?'收起':'展开'} {open?<IconUp/>:<IconDown/>}</span></Button>{open&&<div className="fold-content">{children}</div>}</div>;}
export interface ChartValue {x:string;series:string;value:number|null;}
// References: none — supplied Source Design categorical palette, Figma 289:209522.
const CHART_PALETTE = ['#1664FF','#1AC6FF','#FF8A00','#3CC780','#7442D4','#FFC400','#304D77','#B48DEB','#009488','#FF7DDA'];
const CHART_PALETTE_EXTENDED = ['#1664FF','#B2CFFF','#1AC6FF','#94EFFF','#FF8A00','#FFCE7A','#3CC780','#B9EDCD','#7442D4','#DDC5FA','#FFC400','#FAE878','#304D77','#8B959E','#B48DEB','#EFE3FF','#009488','#59BAA8','#FF7DDA','#FFCFEE'];
export function AnalysisChart({title,values,type='line',height=250,unit='',percent=false,dashedSeries=[],dottedSeries=[]}:{title:string;values:ChartValue[];type?:'line'|'bar';height?:number;unit?:string;percent?:boolean;dashedSeries?:string[];dottedSeries?:string[]}) {
 const [hidden,setHidden]=useState<string[]>([]); const series=Array.from(new Set(values.map(v=>v.series)));const filtered=values.filter(v=>v.value!==null&&!hidden.includes(v.series));
 // Resolve against all series, not visible data: legend toggles never reassign colors.
 // For more than 20 combinations, repeat the supplied extended palette without inventing new colors.
 const palette=series.length<=10?CHART_PALETTE:CHART_PALETTE_EXTENDED;
 const colors=series.map((_name,index)=>palette[index%palette.length]);
 const spec:any={type,autoFit:true,padding:{top:12,right:20,bottom:10,left:10},data:[{id:'data',values:filtered}],xField:type==='bar'?['x','series']:'x',yField:'value',seriesField:'series',color:{type:'ordinal',domain:series,range:colors},animation:false,axes:[{orient:'left',type:'linear',min:0,zero:true,label:{style:{fontSize:12,fill:'#737a87'},formatMethod:(v:any)=>percent?`${Number(v).toFixed(0)}%`:Math.abs(Number(v))>=1e8?`${(Number(v)/1e8).toFixed(1)}亿`:Math.abs(Number(v))>=1e4?`${(Number(v)/1e4).toFixed(0)}万`:Number(v).toFixed(Math.abs(Number(v))<1?4:0)},grid:{style:{stroke:'#e9eef6',lineDash:[3,3]}},domainLine:{visible:false},tick:{visible:false}},{orient:'bottom',type:'band',label:{style:{fontSize:12,fill:'#737a87'}},domainLine:{style:{stroke:'#dce4ef'}},tick:{visible:false}}],tooltip:{visible:true,mark:{content:[{key:(datum:any)=>datum.series,value:(datum:any)=>`${Number(datum.value).toLocaleString('zh-CN',{maximumFractionDigits:10})}${percent?'%':unit}`}] }},line:{style:{lineWidth:2.3,lineDash:(datum:any)=>dottedSeries.includes(datum.series)?[2,3]:dashedSeries.includes(datum.series)?[6,4]:[0,0]}},point:{visible:true,style:{size:5}},legends:[]};
 // Explicit signed y-domain prevents losing negative profit or a negative change.
 if(filtered.some(v=>(v.value||0)<0)) delete spec.axes[0].min;
 const hasChartData=values.some(v=>v.value!==null);
 return <div className="analysis-chart"><h3>{title}</h3>{unit&&<span className="chart-unit">单位：{unit}</span>}{hasChartData?<div style={{height}}><VChart spec={spec}/></div>:<div className="analysis-chart-empty-slot" style={{height}}><EmptyState text="暂无可用数据" kind="chart" size={80}/></div>}{hasChartData&&<div className="chart-legend">{series.map((name,i)=><Button key={name} size="mini" type="text" className={hidden.includes(name)?'legend-hidden':''} onClick={()=>setHidden(hidden.includes(name)?hidden.filter(s=>s!==name):[...hidden,name])}><i style={{background:colors[i%colors.length]}}/>{name}</Button>)}</div>}</div>;
}
export const ExactValue=({value,children}:{value:number|null;children:React.ReactNode})=><Tooltip content={value===null?'暂无可用数据':value.toLocaleString('zh-CN',{maximumFractionDigits:10})}><span>{children}</span></Tooltip>;
