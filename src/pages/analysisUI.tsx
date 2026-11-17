// References: none — PRD screenshot aligned primitives shared by the three analysis tabs.
import React, {useState} from 'react';
import { Alert, Button, Checkbox, Pagination, Select as BaseSelect, Tag } from '@byted-babi/babi-design';
import type { SelectProps } from '@arco-design/web-react';
import Popover from './AnalysisPopover';
import TableBlock from '@byted-babi/babi-design/es/TableBlock';
import { Table as ArcoTable } from '@arco-design/web-react';
import { IconDown, IconUp, IconRight, IconPageEmpty, IconEmptyChart, IconNoContent, IconQueryFailed } from '@arco-design/iconbox-react-babi';
import { IconDown as FilterIconDown, IconRight as FilterIconRight } from '@arco-design/iconbox-react-ve-o-design';
import { VChart } from '@visactor/react-vchart';
import trendUpIcon from '../app/static/icon/环比icon正.svg';
import trendDownIcon from '../app/static/icon/环比icon负.svg';
import trendFlatIcon from '../app/static/icon/环比icon无变化.svg';
import { percent } from './analysisData';
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
export const OverflowText=({children,className='',as='span',styleWidth,content,semantic=false}:{children:React.ReactNode;className?:string;as?:'span'|'strong'|'div'|'h3';styleWidth?:number|null;content?:React.ReactNode;semantic?:boolean})=>{
 const ref=React.useRef<HTMLElement|null>(null);
 const [isOverflowing,setIsOverflowing]=useState(false);
 React.useEffect(()=>{
  const element=ref.current;
  if(!element)return;
  const check=()=>setIsOverflowing(current=>{
   const overflows=(node:HTMLElement)=>node.clientWidth>0&&(node.scrollWidth>node.clientWidth+1||node.scrollHeight>node.clientHeight+1);
   const next=overflows(element)||Array.from(element.querySelectorAll<HTMLElement>('*')).some(node=>{
    const style=window.getComputedStyle(node);
    return (style.textOverflow==='ellipsis'||Number(style.webkitLineClamp)>0)&&overflows(node);
   });
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
 const commonProps={ref:ref as React.Ref<any>,className:`${semantic?'semantic-card-truncate':'analysis-overflow-text'} ${className}`.trim(),style:styleWidth===null||styleWidth===undefined?undefined:{width:styleWidth,flexBasis:styleWidth,maxWidth:styleWidth},'data-overflow':isOverflowing?'true':'false'};
 const hasContentPopover=React.isValidElement<{content?:React.ReactNode;disabled?:boolean}>(children)&&children.props.content!==undefined;
 const displayedChildren=isOverflowing&&hasContentPopover?React.cloneElement(children as React.ReactElement<{disabled?:boolean}>,{disabled:true}):children;
 const node=React.createElement(as,commonProps,displayedChildren);
 const fullContent=content??(hasContentPopover?(children as React.ReactElement<{content:React.ReactNode}>).props.content:textFromNode(children)||ref.current?.textContent||'');
 return isOverflowing&&fullContent?<Popover content={fullContent}>{node}</Popover>:node;
};
const SemanticTruncatedText=(props:React.ComponentProps<typeof OverflowText>)=><OverflowText {...props} semantic/>;
// Select already truncates long selected labels; expose that full label on hover.
export const AnalysisSelect=(props:SelectProps)=>{
 const renderFormat:SelectProps['renderFormat']=(option,value)=><OverflowText className="analysis-select-label">{option?.label??option?.children??(typeof value==='object'?value.label:value)}</OverflowText>;
 return <BaseSelect {...props} renderFormat={props.renderFormat??renderFormat}/>;
};
const MIN_SEMANTIC_FIELD_WIDTH=36;
const MIN_SEMANTIC_FIELD_VALUE_WIDTH=16;
export const SemanticCardFields=({fields,className=''}:{fields:SemanticCardNoteField[];className?:string})=>{
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
 return <div className={`semantic-card-fields ${className}`.trim()} ref={groupRef}>{fields.map((field,index)=>{
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
export const Field=({label,children,required=false}:{label:string;children:React.ReactNode;required?:boolean})=><div className="analysis-field"><label>{required&&<span className="analysis-field-required" aria-label="必填">*</span>}{label}</label>{children}</div>;
export const SELECT_SEARCH_THRESHOLD = 10;
export const getSelectPlaceholder = (searchable:boolean) => searchable ? '请输入' : '请选择';
// References: none — keep the region popup in the same sticky coordinate space as its summary trigger.
const getFilterPopupContainer = (node:HTMLElement) => node.closest('.analysis-sticky-header') || document.body;
// References: none — Figma 5325:124983 / 5325:125306 summary and ByteTree 7072:122364 popup list styling; supplied region names and popup direction are unchanged.
export function FilterSummary({items,regions}:{items:string[][];regions?:string[]}) {
 return <div className="filter-summary">{items.map(([label,value])=>{const isRegionLabel=label.endsWith('售卖区域');return <Tag key={label} size="small" bordered={false} className="filter-summary-tag" data-testid={isRegionLabel?'filter-region-summary':undefined}><span className="filter-summary-label">{label}：</span>{isRegionLabel && regions!==undefined ? <Popover className="filter-region-popover" style={{width:'max-content',maxWidth:280}} title={`共 ${regions.length} 个${label}`} trigger="hover" position="bl" getPopupContainer={getFilterPopupContainer} unmountOnExit content={<div className="filter-region-details" data-testid="filter-region-details">{regions.length ? <ol className="filter-region-list">{regions.map(region=><li key={region}>{region}</li>)}</ol> : <span className="filter-region-empty">当前未选择{label}</span>}</div>}><Button type="text" size="mini" className="filter-region-count" data-testid="filter-region-count">共 {regions.length} 个</Button></Popover> : <span className="filter-summary-value">{value}</span>}</Tag>;})}</div>;
}
export function MultiFilter({value,options,onChange,disabled=false,addBefore,size='default'}:{value:string[]|null;options:string[];onChange:(value:string[])=>void;disabled?:boolean;addBefore?:React.ReactNode;size?:'mini'|'small'|'default'|'large'}) {
 // References: none — Figma 5324:123773 menu presentation; existing option values and callbacks are unchanged.
 const selected = value === null ? options : value;
 const selectedCount = options.filter(option => selected.includes(option)).length;
 const allSelected = options.length > 0 && selectedCount === options.length;
 return <AnalysisSelect addBefore={addBefore} size={size} defaultActiveFirstOption={false} mode="multiple" animation={false} allowClear showSearch={options.length > SELECT_SEARCH_THRESHOLD} value={selected} options={options} placeholder={getSelectPlaceholder(options.length > SELECT_SEARCH_THRESHOLD)} maxTagCount={1} disabled={disabled} onChange={onChange} dropdownRender={menu=><div className="analysis-multi-menu"><div className="analysis-multi-options">{menu}</div><div className="analysis-multi-footer" onMouseDown={event=>event.preventDefault()}><Checkbox checked={allSelected} indeterminate={selectedCount > 0 && !allSelected} disabled={disabled || options.length === 0} onChange={checked=>onChange(checked ? options : [])}>全部<span className="analysis-multi-total">（共 {options.length} ）</span></Checkbox></div></div>}/>;
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
const sorterPopoverText=(column:any,key:string,activeSorter:any)=>{
 const sorters=(Array.isArray(activeSorter)?activeSorter:[activeSorter]).filter(Boolean);
 const active=sorters.find((item:any)=>String(item?.field)===String(column.dataIndex??key));
 const currentDirection=column.sortOrder||active?.direction;
 const directions=column.sortDirections||['ascend','descend'];
 const currentIndex=currentDirection?directions.indexOf(currentDirection):-1;
 const nextDirection=directions[currentIndex+1];
 return nextDirection==='ascend'?'点击升序':nextDirection==='descend'?'点击降序':'取消排序';
};
const uniqueColumns=(columns:any[],data:any[]=[],prefix='column',enableResponsiveFixed=false,activeSorter:any=null):any[]=>columns.map((column,index)=>{
 const {responsiveFixed,...columnProps}=column;
 const children=column.children?uniqueColumns(column.children,data,`${prefix}-${index}`,enableResponsiveFixed,activeSorter):undefined;
 const shouldAlignRight=!children&&column.align===undefined&&isComparableNumericColumn(column,data);
 const key=column.key??(column.sorter&&typeof column.dataIndex==='string'?column.dataIndex:`${prefix}-${index}`);
 const title=column.sorter&&!children?<>{column.title}<Popover content={sorterPopoverText(column,key,activeSorter)} position="top"><span className="analysis-sorter-popover-trigger" aria-hidden/></Popover></>:column.title;
 return {...columnProps,key,title,children,align:shouldAlignRight?'right':column.align,fixed:responsiveFixed?(enableResponsiveFixed?responsiveFixed:undefined):column.fixed};
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
 selectProps:{renderFormat:(option:any,value:any)=><span>{option?.label??option?.children??value}</span>},
 ...overrides,
});
const resolveTablePagination=(pagination:any,total:number)=>pagination&&pagination!==true?sourcePaginationProps(total,pagination):sourcePaginationProps(total);
const SourceBaseTable=TableBlock.Table;
export const SourceTableSummary=ArcoTable.Summary;
export const SourceTable=({columns,data,width,pagination,maxHeight,noDataElement,onChange,footer,className='',...rest}:{columns:any[];data:any[];width?:number;pagination?:any;maxHeight?:number;noDataElement?:React.ReactNode;onChange?:any;footer?:any;className?:string;[key:string]:any})=>{
 const resolvedPagination=resolveTablePagination(pagination,data.length);
 const [current,setCurrent]=React.useState(resolvedPagination.current||1);
 const [pageSize,setPageSize]=React.useState(resolvedPagination.pageSize||resolvedPagination.defaultPageSize||10);
 const [activeSorter,setActiveSorter]=React.useState<any>(null);
 const tableRef=React.useRef<HTMLDivElement|null>(null);
 const [enableResponsiveFixed,setEnableResponsiveFixed]=React.useState(false);
 // #region debug-point A:summary-row-overlap
 React.useEffect(()=>{
  if(!location.href.includes('debugSummary='))return;
  const root=tableRef.current;if(!root)return;
  let last='',frame=0;
  const capture=()=>{
   const foot=root.querySelector<HTMLElement>('div.arco-table-tfoot'),body=root.querySelector<HTMLElement>('.arco-table-body');if(!foot||!body)return;
   const f=foot.getBoundingClientRect(),b=body.getBoundingClientRect(),s=getComputedStyle(foot);
   const data={height:f.height,overlap:f.bottom-b.top,inlineMargin:foot.style.marginBottom,margin:s.marginBottom,overflowY:s.overflowY,clientHeight:foot.clientHeight,offsetHeight:foot.offsetHeight,scrollHeight:foot.scrollHeight,cellBorders:Array.from(foot.querySelectorAll('td')).map(td=>getComputedStyle(td).borderBottom)};
   const signature=JSON.stringify(data);if(signature===last)return;last=signature;
   fetch('http://127.0.0.1:7777/event',{method:'POST',body:JSON.stringify({sessionId:'summary-row-overlap',runId:location.href.includes('debugSummary=post')?'post-fix':'pre-fix',hypothesisId:'A/C',location:'analysisUI.tsx:SourceTable',msg:'[DEBUG] Summary geometry and scrollbar compensation',data,ts:Date.now()})}).catch(()=>{});
  };
  const observer=new MutationObserver(()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(capture);});
  observer.observe(root,{subtree:true,attributes:true,childList:true});capture();
  return ()=>{observer.disconnect();cancelAnimationFrame(frame);};
 },[]);
 // #endregion
 React.useEffect(()=>{setCurrent(1);},[data.length]);
 React.useLayoutEffect(()=>{
  const element=tableRef.current;
  if(!element||!width){
   setEnableResponsiveFixed(false);
   return;
  }
  const update=()=>{
   const next=width>element.clientWidth+1;
   setEnableResponsiveFixed(current=>current===next?current:next);
  };
  update();
  const Observer=typeof ResizeObserver==='undefined'?null:ResizeObserver;
  const observer=Observer?new Observer(update):null;
  observer?.observe(element);
  window.addEventListener('resize',update);
  return ()=>{
   observer?.disconnect();
   window.removeEventListener('resize',update);
  };
 },[width]);
 const safePageSize=pageSize||10;
 const maxPage=Math.max(1,Math.ceil(data.length/safePageSize));
 const safeCurrent=Math.min(current,maxPage);
 const pageData=data.slice((safeCurrent-1)*safePageSize,safeCurrent*safePageSize);
 return <div ref={tableRef} className={`analysis-table source-analysis-table ${className}`.trim()} data-horizontal-overflow={enableResponsiveFixed?'true':'false'}>
  <SourceBaseTable rowKey="id" border={{wrapper:true}} columns={uniqueColumns(columns,data,'column',enableResponsiveFixed,activeSorter)} dataSource={pageData} pagination={false} scroll={width||maxHeight?{x:width,y:maxHeight}:undefined} noDataElement={noDataElement||<EmptyState compact size={60}/>} onChange={(pagination:any,sorter:any,filters:any,extra:any)=>{setActiveSorter(sorter);onChange?.(pagination,sorter,filters,extra);}} footer={footer} showSorterTooltip={false} {...rest}/>
  <div className="source-table-pagination"><Pagination {...resolvedPagination} current={safeCurrent} pageSize={safePageSize} onChange={(nextPage:number,nextSize:number)=>{setPageSize(nextSize||safePageSize);setCurrent(nextSize&&nextSize!==safePageSize?1:nextPage);}} onPageSizeChange={(nextSize:number)=>{setPageSize(nextSize);setCurrent(1);}}/></div>
 </div>;
};
export const DataTable=SourceTable;
export type TableNumberKind='amount'|'percent'|'quantity'|'price';
export const TableNumberValue=({value,kind,unit,className=''}:{value:number|null|undefined;kind:TableNumberKind;unit?:string;className?:string})=>{
 const available=typeof value==='number'&&Number.isFinite(value);
 if(!available)return <span className={`table-number-value is-missing ${className}`.trim()}>—</span>;
 let number:string;
 let resolvedUnit=unit||'';
 if(kind==='amount'){
  if(Math.abs(value)>=1e8)number=`${(value/1e8).toFixed(2)}亿`;
  else if(Math.abs(value)>=1e4)number=`${(value/1e4).toFixed(2)}万`;
  else number=value.toLocaleString('zh-CN',{maximumFractionDigits:2,minimumFractionDigits:2});
  resolvedUnit=unit??'元';
 }else if(kind==='percent'){
  number=value.toFixed(2);
  resolvedUnit=unit??'%';
 }else if(kind==='quantity'){
  number=Math.abs(value)>=1e8?`${(value/1e8).toFixed(2)}亿`:Math.abs(value)>=1e4?`${(value/1e4).toFixed(2)}万`:value.toLocaleString('zh-CN',{maximumFractionDigits:4});
 }else{
  number=value.toFixed(10);
 }
 return <span className={`table-number-value ${className}`.trim()}><span className="table-number-main">{number}</span>{resolvedUnit&&<span className="table-number-unit">{resolvedUnit}</span>}</span>;
};
export const tableAmount=(value:number|null|undefined)=><TableNumberValue value={value} kind="amount"/>;
export const tablePercent=(value:number|null|undefined)=><TableNumberValue value={value} kind="percent"/>;
export const tableQuantity=(value:number|null|undefined)=><TableNumberValue value={value} kind="quantity"/>;
export const tablePrice=(value:number|null|undefined)=><TableNumberValue value={value} kind="price"/>;
// Figma 5354:209724: trend color lives in the arrow; value and unit retain text hierarchy.
export const TrendValue=({value,unit='%',unavailable='—'}:{value:number|null|undefined;unit?:string;unavailable?:React.ReactNode})=>{
 const comparable=typeof value==='number'&&Number.isFinite(value);
 if(!comparable)return <span className="table-trend-value is-missing">{unavailable}</span>;
 const positive=value>0,negative=value<0;
 const icon=positive?trendUpIcon:negative?trendDownIcon:trendFlatIcon;
 return <span className={`table-trend-value${positive?' is-positive':negative?' is-negative':' is-zero'}`}>
  <span className="table-trend-icon" aria-hidden><img src={icon} alt=""/></span>
  <span className="table-trend-text"><span className="table-trend-number">{positive?'+':''}{value.toFixed(2)}</span>{unit&&<span className="table-trend-unit">{unit}</span>}</span>
 </span>;
};
export const trendPercent=(value:number|null|undefined)=><TrendValue value={value}/>;
export function Fold({title,children,defaultOpen=false,appearance='default'}:{title:string;children:React.ReactNode;defaultOpen?:boolean;appearance?:'default'|'filter'}) {
 const [open,setOpen]=useState(defaultOpen);
 if(appearance==='filter') return <div className={`analysis-fold analysis-fold-filter${open?'':' analysis-fold-collapsed'}`}>
  <div className="filter-heading">
   <Popover content={open?'收起':'展开'} trigger="hover" position="top" unmountOnExit>
    <span className="filter-toggle-popover-trigger"><span role="button" tabIndex={0} className="analysis-fold-toggle" aria-label={`${open?'收起':'展开'}${title}`} aria-expanded={open} onClick={()=>setOpen(!open)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setOpen(!open);}}}>{open?<FilterIconDown width="16" height="16"/>:<FilterIconRight width="16" height="16"/>}</span></span>
   </Popover>
   <h2 style={{fontSize:'14px'}}>{title}</h2>
  </div>
  {open&&<div className="fold-content">{children}</div>}
 </div>;
 return <div className="analysis-fold"><Button long type="text" className="fold-button" onClick={()=>setOpen(!open)}>{title}<span>{open?'收起':'展开'} {open?<IconUp/>:<IconDown/>}</span></Button>{open&&<div className="fold-content">{children}</div>}</div>;
}
export interface ChartValue {x:string;series:string;value:number|null;}
export interface ChartAnnotationPoint {x:string;series:string;value:number;}
export const trendMonthLabel=(selectedMonth:string,x:string)=>{
 const pointMonth=Number(x.match(/^(\d{1,2})月$/)?.[1]);
 const selectedYear=Number(selectedMonth.slice(0,4)),selectedMonthNumber=Number(selectedMonth.slice(5,7));
 if(!Number.isFinite(pointMonth)||!Number.isFinite(selectedYear)||!Number.isFinite(selectedMonthNumber))return x;
 const year=pointMonth>selectedMonthNumber?selectedYear-1:selectedYear;
 return `${year}-${String(pointMonth).padStart(2,'0')}`;
};
// References: none — supplied Source Design categorical palette, Figma 289:209522.
const CHART_PALETTE = ['#1664FF','#1AC6FF','#FF8A00','#3CC780','#7442D4','#FFC400','#304D77','#B48DEB','#009488','#FF7DDA'];
const CHART_PALETTE_EXTENDED = ['#1664FF','#B2CFFF','#1AC6FF','#94EFFF','#FF8A00','#FFCE7A','#3CC780','#B9EDCD','#7442D4','#DDC5FA','#FFC400','#FAE878','#304D77','#8B959E','#B48DEB','#EFE3FF','#009488','#59BAA8','#FF7DDA','#FFCFEE'];
const CHART_CARD_HEIGHT=352;
const CHART_LEGEND_MAX_ROWS=2;
const CHART_TOOLTIP_MARKER_RADIUS=1.54;
const CHART_MARKER_SIZE=10;
const tooltipSquarePath=(size:number)=>{
 const radius=Math.min(CHART_TOOLTIP_MARKER_RADIUS,size/2),edge=size-radius;
 return `M${radius},0H${edge}A${radius},${radius} 0 0 1 ${size},${radius}V${edge}A${radius},${radius} 0 0 1 ${edge},${size}H${radius}A${radius},${radius} 0 0 1 0,${edge}V${radius}A${radius},${radius} 0 0 1 ${radius},0Z`;
};
const CHART_DASHED_MARKER_PATH='M-0.5,-0.0625H-0.3V0.0625H-0.5Z M-0.1,-0.0625H0.1V0.0625H-0.1Z M0.3,-0.0625H0.5V0.0625H0.3Z';
const LegendIsolateIcon=()=> <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="5"/><path d="M10 13.25V15M13 10H15M5 10H6.75M10 6.75V5"/></g></svg>;
function ChartLegend({series,colors,dashedSeries,hidden,setHidden,exclude,isolate}:{series:string[];colors:string[];dashedSeries:string[];hidden:string[];setHidden:React.Dispatch<React.SetStateAction<string[]>>;exclude:boolean;isolate:boolean}) {
 const rootRef=React.useRef<HTMLDivElement|null>(null),listRef=React.useRef<HTMLDivElement|null>(null);
 const widthsRef=React.useRef<number[]>([]);
 const [pages,setPages]=useState<number[][]>([]);
 const [page,setPage]=useState(0);
 const paginate=React.useCallback(()=>{
  const root=rootRef.current,list=listRef.current;
  if(!root||!list)return;
  const items=Array.from(list.querySelectorAll<HTMLElement>('.legend-item'));
  const previousHidden=items.map(item=>item.hidden);
  items.forEach(item=>{item.hidden=false;});
  const measured=items.map((item,index)=>{
   const toggle=item.querySelector<HTMLElement>('.legend-toggle');
   const isolate=item.querySelector<HTMLElement>('.legend-isolate');
   const measuredWidth=(toggle?.getBoundingClientRect().width||0)+(isolate?.getBoundingClientRect().width||0)+(isolate?4:0);
   return measuredWidth||item.offsetWidth||widthsRef.current[index]||80;
  });
  widthsRef.current=measured;
  items.forEach((item,index)=>{item.hidden=previousHidden[index];});
  const pack=(available:number)=>{
   const rows:number[][]=[];let row:number[]=[];let used=0;
   measured.forEach((width,index)=>{const next=width+(row.length?4:0);if(row.length&&used+next>available){rows.push(row);row=[];used=0;}row.push(index);used+=width+(row.length>1?4:0);});
   if(row.length)rows.push(row);
   return rows;
  };
  let rows=pack(root.clientWidth);
  if(rows.length>CHART_LEGEND_MAX_ROWS)rows=pack(Math.max(1,root.clientWidth-28));
  const next:number[][]=[];
  for(let index=0;index<rows.length;index+=CHART_LEGEND_MAX_ROWS)next.push(rows.slice(index,index+CHART_LEGEND_MAX_ROWS).flat());
  setPages(next);setPage(current=>Math.min(current,Math.max(0,next.length-1)));
 },[series.length,isolate]);
 React.useLayoutEffect(()=>{setPage(0);paginate();},[paginate,series.join('|')]);
 React.useEffect(()=>{const root=rootRef.current;if(!root)return;const observer=new ResizeObserver(paginate);observer.observe(root);return()=>observer.disconnect();},[paginate]);
 const visible=new Set(pages[page]||series.map((_name,index)=>index));
 return <div className="chart-legend" ref={rootRef}>
  <div className="legend-list" ref={listRef}>{series.map((name,index)=><div key={name} className="legend-item" hidden={!visible.has(index)}>
   <Popover content={exclude?(hidden.includes(name)?'点击恢复展示':'点击排除展示'):'图例'}>
    <button type="button" className={`legend-toggle${hidden.includes(name)?' legend-hidden':''}`} aria-label={`${hidden.includes(name)?'恢复':'排除'}${name}`} aria-pressed={!hidden.includes(name)} disabled={!exclude} onClick={()=>setHidden(current=>current.includes(name)?current.filter(item=>item!==name):[...current,name])}><i className={dashedSeries.includes(name)?'legend-marker-dash':undefined} style={{background:dashedSeries.includes(name)?`repeating-linear-gradient(to right, ${colors[index]} 0%, ${colors[index]} 20%, transparent 20%, transparent 40%)`:colors[index]}} aria-hidden="true"/><span className="legend-label">{name}</span></button>
   </Popover>
   {isolate&&<Popover content="点击仅展示该指标"><button type="button" className="legend-isolate" aria-label={`仅展示${name}`} onClick={()=>setHidden(series.filter(item=>item!==name))}><LegendIsolateIcon/></button></Popover>}
  </div>)}</div>
  {pages.length>1&&<div className="legend-pager" aria-label="图例翻页"><button type="button" aria-label="上一页图例" disabled={page===0} onClick={()=>setPage(current=>Math.max(0,current-1))}>⌃</button><span>{page+1}/{pages.length}</span><button type="button" aria-label="下一页图例" disabled={page===pages.length-1} onClick={()=>setPage(current=>Math.min(pages.length-1,current+1))}>⌄</button></div>}
 </div>;
}
export function AnalysisChart({title,titleExtra:providedTitleExtra,legendReset=false,values,type='line',unit='',percent:percentProp=false,percentSeries=[],dashedSeries=[],dottedSeries=[],seriesColorIndexes={},legendExclude=true,legendIsolate=true,summary,moreInfo,annotationPoint,height}:{title:string;titleExtra?:React.ReactNode;legendReset?:boolean;values:ChartValue[];type?:'line'|'bar';height?:number;unit?:string;percent?:boolean;percentSeries?:string[];dashedSeries?:string[];dottedSeries?:string[];seriesColorIndexes?:Record<string,number>;legendExclude?:boolean;legendIsolate?:boolean;summary?:React.ReactNode;moreInfo?:React.ReactNode[];annotationPoint?:ChartAnnotationPoint|null}) {
 const percent=percentProp||unit.trim()==='%';
 const dualAxis=type==='line'&&percentSeries.length>0;
 const [hidden,setHidden]=useState<string[]>([]); const series=Array.from(new Set(values.map(v=>v.series)));const filtered=values.filter(v=>v.value!==null&&!hidden.includes(v.series));
 const titleExtra=providedTitleExtra??(legendReset&&hidden.length>0?<></>:undefined);
 const chartInstance=React.useRef<any>(null);
 const tooltipElementRef=React.useRef<HTMLElement|null>(null);
 const tooltipDataRef=React.useRef<any>(null);
 const tooltipPinnedRef=React.useRef(false);
 const clearPinnedTooltip=React.useCallback(()=>{
  tooltipPinnedRef.current=false;
  chartInstance.current?.hideTooltip();
 },[]);
 React.useEffect(()=>{
  const dismissOutside=(event:PointerEvent)=>{
   const target=event.target;
   if(!(target instanceof Node)||!tooltipPinnedRef.current)return;
   if(tooltipElementRef.current?.contains(target)||chartInstance.current?.getCanvas()?.contains(target))return;
   clearPinnedTooltip();
  };
  document.addEventListener('pointerdown',dismissOutside);
  return ()=>document.removeEventListener('pointerdown',dismissOutside);
 },[clearPinnedTooltip]);
 React.useEffect(()=>{clearPinnedTooltip();},[values,hidden,clearPinnedTooltip]);
 const handleTooltipClick=(params:any)=>{
  if(tooltipPinnedRef.current){clearPinnedTooltip();return;}
  const actual=tooltipDataRef.current;
  const datum=actual?.content?.[0]?.datum;
  if(!datum||tooltipElementRef.current?.style.visibility!=='visible')return;
  const query=actual.activeType==='dimension'?{x:datum.x}:datum;
  tooltipPinnedRef.current=!!chartInstance.current?.showTooltip(query,{
   activeType:actual.activeType,alwaysShow:true,x:params.event.canvasX,y:params.event.canvasY,
  });
 };
 React.useEffect(()=>setHidden(current=>current.filter(name=>series.includes(name))),[series.join('|')]);
 // Resolve against all series, not visible data: legend toggles never reassign colors.
 // For more than 20 combinations, repeat the supplied extended palette without inventing new colors.
 const colorCount=new Set(series.map((name,index)=>seriesColorIndexes[name]??index)).size;
 const palette=colorCount<=10?CHART_PALETTE:CHART_PALETTE_EXTENDED;
 const colors=series.map((name,index)=>palette[(seriesColorIndexes[name]??index)%palette.length]);
 const colorBySeries=new Map(series.map((name,index)=>[name,colors[index]]));
 const specifiedColors=Object.fromEntries(colorBySeries);
 const markerPath=tooltipSquarePath(CHART_MARKER_SIZE);
 const abbreviateAmount=!percent&&(unit.includes('人民币')||/\bCNY\b/i.test(unit)||/(^|[/\s])(元|万元|亿元)($|[/\s])/.test(unit));
 const formatTooltipValue=(value:any)=>{
  const numeric=Number(value);
  if(abbreviateAmount&&Math.abs(numeric)>=1e8)return `${(numeric/1e8).toFixed(2)}亿`;
  if(abbreviateAmount&&Math.abs(numeric)>=1e4)return `${(numeric/1e4).toFixed(2)}万`;
  return numeric.toLocaleString('zh-CN',{maximumFractionDigits:10});
 };
 const seriesColor=(datum:any)=>colorBySeries.get(datum.series)||CHART_PALETTE[0];
 const tooltipContent={shapeType:(datum:any)=>dashedSeries.includes(datum.series)?CHART_DASHED_MARKER_PATH:markerPath,shapeFill:seriesColor,shapeStroke:seriesColor,shapeSize:CHART_MARKER_SIZE,shapeHollow:false,shapeLineWidth:0,key:(datum:any)=>datum.series,value:(datum:any)=>percentSeries.includes(datum.series)?`${Number(datum.value).toLocaleString('zh-CN',{maximumFractionDigits:2})}%`:formatTooltipValue(datum.value)};
 const updateTooltipRefs=(tooltipElement:HTMLElement,actualTooltip:any)=>{
  tooltipElementRef.current=tooltipElement;
  tooltipDataRef.current=actualTooltip;
  // Keep VChart's DOM and marker rendering, but align wrapping labels by row.
  tooltipElement.querySelectorAll<HTMLElement>('.vchart-tooltip-column').forEach((column,columnIndex)=>{
   Array.from(column.children).forEach((child,rowIndex)=>{
    const cell=child as HTMLElement;
    cell.style.gridColumn=String(columnIndex*2+1);
    cell.style.gridRow=String(rowIndex+1);
    cell.hidden=actualTooltip.content?.[rowIndex]?.visible===false;
   });
  });
 };
 const spec:any={type,autoFit:true,padding:{top:0,right:0,bottom:0,left:0},data:[{id:'data',values:filtered}],xField:type==='bar'?['x','series']:'x',yField:'value',seriesField:'series',activePoint:type==='line',color:{type:'ordinal',domain:series,range:colors,specified:specifiedColors},animation:false,axes:[{orient:'left',type:'linear',min:0,zero:true,label:{space:6,style:{fontSize:10,fill:'#737a87',fontWeight:'normal',fillOpacity:1},formatMethod:(v:any)=>percent?`${Number(v).toFixed(0)}%`:Math.abs(Number(v))>=1e8?`${(Number(v)/1e8).toFixed(1)}亿`:Math.abs(Number(v))>=1e4?`${(Number(v)/1e4).toFixed(0)}万`:Number(v).toFixed(Math.abs(Number(v))<1?4:0)},grid:{visible:true,style:{stroke:'#e9eef6',lineWidth:1,strokeOpacity:1,lineDash:[2,2]}},domainLine:{visible:false},tick:{visible:false}},{orient:'bottom',type:'band',label:{space:6,style:{fontSize:10,fill:'#737a87',fontWeight:'normal',fillOpacity:1}},grid:{visible:false},domainLine:{visible:true,style:{stroke:'#dce4ef',lineWidth:1,strokeOpacity:1}},tick:{visible:false}}],crosshair:{trigger:'hover',triggerOff:'hover',followTooltip:false,xField:type==='line'?{visible:true,line:{type:'line',style:{stroke:'#C9CDD4',lineWidth:1,lineDash:[]}},label:{visible:false}}:{visible:true,line:{type:'rect'},label:{visible:false}},yField:{visible:false}},tooltip:{visible:true,renderMode:'html',className:'analysis-chart-tooltip',offset:{x:10,y:10},updateElement:updateTooltipRefs,mark:{content:[tooltipContent]},dimension:{content:[tooltipContent]},style:{panel:{backgroundColor:'#fff',padding:{top:8,right:12,bottom:8,left:12},border:{color:'#fff',width:0,radius:4},shadow:{x:0,y:4,blur:12,spread:0,color:'rgba(33,37,44,.1)'}},spaceRow:2,shape:{size:8,spacing:6},titleLabel:{fontSize:12,lineHeight:20,fontColor:'#808893',fontWeight:'normal',spacing:0},keyLabel:{fontSize:12,lineHeight:20,fontColor:'#808893',fontWeight:'normal',spacing:26},valueLabel:{fontSize:12,lineHeight:20,fontColor:'#555960',fontWeight:'bold',spacing:0}}},line:{style:{stroke:seriesColor,zIndex:1,lineWidth:2,strokeOpacity:1,lineCap:'round',lineJoin:'round',lineDash:(datum:any)=>dottedSeries.includes(datum.series)?[2,3]:dashedSeries.includes(datum.series)?[6,6]:[0,0]}},point:{visible:false,style:{zIndex:3,size:0,symbolType:'circle',fill:seriesColor,fillOpacity:1,stroke:'#fff',lineWidth:1},state:{dimension_hover:{visible:true,size:10,symbolType:'circle',fillOpacity:1,stroke:'#fff',lineWidth:1}}},bar:{style:{fill:seriesColor,cornerRadius:0,fillOpacity:1}},legends:[]};
 // Public alwaysShow/hideTooltip APIs support both chart-click and outside dismissal.
 // CSS enables DOM scrolling without enterable's conflicting pointerleave handler.
 Object.assign(spec.tooltip,{trigger:'hover',lockAfterClick:false,enterable:false,transitionDuration:0});
 spec.tooltip.style.shape.size=CHART_MARKER_SIZE;
 spec.tooltip.mark.maxLineCount=0;
 spec.tooltip.dimension.maxLineCount=0;
 // Explicit signed y-domain prevents losing negative profit or a negative change.
 if(filtered.some(v=>(v.value||0)<0)) delete spec.axes[0].min;
 if(dualAxis){
  const amountValues=filtered.filter(value=>!percentSeries.includes(value.series));
  const percentageValues=filtered.filter(value=>percentSeries.includes(value.series));
  const leftAxis={...spec.axes[0],seriesIndex:[0],min:0};
  if(amountValues.some(value=>(value.value||0)<0))delete leftAxis.min;
  const rightAxis={...spec.axes[0],orient:'right',seriesIndex:[1],grid:{visible:false},label:{...spec.axes[0].label,containerAlign:'right',formatMethod:(value:any)=>`${Number(value).toFixed(0)}%`}};
  delete rightAxis.min;
  spec.type='common';
  spec.data=[{id:'amount-data',values:amountValues},{id:'percentage-data',values:percentageValues}];
  const sharedLine={type:'line',xField:'x',yField:'value',seriesField:'series',activePoint:true,line:spec.line,point:spec.point};
  spec.series=[{...sharedLine,dataId:'amount-data'},{...sharedLine,dataId:'percentage-data'}];
  spec.axes=[leftAxis,{...spec.axes[1],seriesIndex:[0,1]},rightAxis];
  // A dimension contains both axis series; keep billing-item metric order.
  spec.tooltip.dimension.updateContent=(content:any[])=>[...content].sort((a,b)=>series.indexOf(a.key)-series.indexOf(b.key));
 }
 const hasChartData=values.some(v=>v.value!==null);
 const chartHeight=height??CHART_CARD_HEIGHT;
 const chart=<div className="analysis-chart" style={{height:CHART_CARD_HEIGHT}}><div className="chart-heading">{titleExtra?<div className="analysis-chart-title-row"><h3>{title}</h3><div className="analysis-chart-title-actions">{titleExtra}{hidden.length>0&&<Button type="text" size="mini" aria-label="重置图例" onClick={()=>setHidden([])}>重置图例</Button>}</div></div>:<h3>{title}</h3>}{dualAxis?<div className="chart-unit-row"><span className="chart-unit">单位：{unit}</span><span className="chart-unit chart-unit-right">单位：%</span></div>:unit&&!percent&&<span className="chart-unit">单位：{unit}</span>}</div>{hasChartData?<div className="analysis-chart-slot" style={{height:chartHeight}} role="img" aria-label={`${title}趋势图`}><VChart spec={spec} onReady={instance=>{chartInstance.current=instance;}} onPointerTap={handleTooltipClick}/></div>:<div className="analysis-chart-slot analysis-chart-empty-slot" style={{height:chartHeight}}><EmptyState text="暂无可用数据" kind="chart" size={80}/></div>}{hasChartData&&<ChartLegend series={series} colors={colors} dashedSeries={dashedSeries} hidden={hidden} setHidden={setHidden} exclude={legendExclude} isolate={legendIsolate}/>}</div>;
 return chart;
}
export const ExactValue=({value,children}:{value:number|null;children:React.ReactNode})=><OverflowText content={value===null?undefined:value.toLocaleString('zh-CN',{maximumFractionDigits:10})}>{children}</OverflowText>;
