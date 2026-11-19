// References: none — newly built from PRD section 3 and its four overview screenshots.
import React, {useMemo} from 'react';
import {Tag} from '@byted-babi/babi-design';
import {IconP0, IconP1, IconP3, IconP4, IconP5} from '@arco-design/iconbox-react-ve-o-design';
import {
  AnalysisProps, AnalysisRow, DrillFocus, TOS, BYTEGRAPH,
  getRows, totals, areaNames, amount, percent,
  metricDeviation, prototypeTargetValue, monthList, financialMetricValue, financialTargetValue,
} from './analysisData';
import {Section, EmptyState, AnalysisChart, DataTable, QuickLink, TrendValue, SemanticMetricCard, tableAmount, tablePercent, trendPercent} from './analysisUI';
import AIDataInterpretation from './AIDataInterpretation';
import './overview.css';

interface OperatingGroup {
  id: string;
  unit?: string;
  area?: string;
  region?: string;
  rows: AnalysisRow[];
  income: number;
  cost: number | null;
  profit: number | null;
  rate: number | null;
}
interface UnitInsight {
  id: string;
  unit: string;
  rows: AnalysisRow[];
  priceChange: number | null;
  capacityChange: number | null;
  salesRate: number | null;
  price: number | null;
  cumulativePrice: number | null;
  annualTarget: number | null;
  annualDeviation: number | null;
}
type PriorityLevel = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
interface ActionRow {
  id: string;
  priority: PriorityLevel;
  scope: string;
  object: string;
  basis: string;
  action: string;
  link: string;
  tab: 'income' | 'pricing';
  anchor: string;
  focus: DrillFocus;
}
const priorityIconMap:Record<PriorityLevel, React.ComponentType<{width?:number;height?:number;className?:string}>>={
  P0:IconP0,
  P1:IconP3,
  P2:IconP4,
  P3:IconP5,
  P4:IconP1,
};
const PriorityIcon=({level}:{level:PriorityLevel})=>{
  const Icon=priorityIconMap[level];
  return <span className="priority-icon" aria-hidden="true"><Icon width={16} height={16}/></span>;
};
const PriorityCell=({value}:{value:PriorityLevel})=><span className="priority-cell"><PriorityIcon level={value}/><span>{value}</span></span>;
const finiteTotal = (rows:AnalysisRow[], key:'quantity'|'capacity') => {
  const values=rows.map(row=>row[key]).filter((v):v is number=>v!==null&&Number.isFinite(v));
  return values.length ? values.reduce((sum,v)=>sum+v,0) : null;
};
const relativeChange = (current:number|null, previous:number|null) => current===null||previous===null||previous===0 ? null : (current-previous)/previous*100;
const changeText = (value:number|null) => <TrendValue value={value} unavailable="不可比"/>;
const weightedPrice = (rows:AnalysisRow[], key:'price'|'cumulativePrice') => {
  const usable=rows.filter(row=>row[key]!==null&&Number.isFinite(row[key])&&row.quantity>0);
  const quantity=usable.reduce((sum,row)=>sum+row.quantity,0);
  return quantity ? usable.reduce((sum,row)=>sum+(row[key]||0)*row.quantity,0)/quantity : null;
};
const weightedTargetPrice = (rows:AnalysisRow[]) => {
  const targets=rows.map(row=>({row,value:prototypeTargetValue(row.cumulativePrice,row,'annual-price-target',.95,1.07)})).filter((item):item is {row:AnalysisRow;value:number}=>item.value!==null&&Number.isFinite(item.value)&&item.row.quantity>0);
  const quantity=targets.reduce((sum,item)=>sum+item.row.quantity,0);
  return quantity?targets.reduce((sum,item)=>sum+item.value*item.row.quantity,0)/quantity:null;
};
const splitRows = (rows:AnalysisRow[], key:(row:AnalysisRow)=>string) => {
  const groups=new Map<string,AnalysisRow[]>();
  rows.forEach(row=>groups.set(key(row), [...(groups.get(key(row))||[]),row]));
  return Array.from(groups.entries());
};
export default function OverviewTab({filters,onDrill}:AnalysisProps) {
  const isTos=filters.product===TOS;
  const supported=filters.product===TOS||filters.product===BYTEGRAPH;
  const rows=useMemo(()=>getRows(filters),[filters]);
  const comparableRows=rows.filter(row=>row.cost!==null);
  const current=totals(comparableRows);
  const hasComparable=comparableRows.length>0;
  const previousMonth=Number(filters.month.slice(-2))>1 ? `2026-${String(Number(filters.month.slice(-2))-1).padStart(2,'0')}` : null;
  const previousRows=previousMonth?getRows(filters,previousMonth):[];
  const negativeAreas=splitRows(comparableRows,row=>row.area)
    .filter(([,areaRows])=>totals(areaRows).profit<0)
    .map(([area])=>area);
  const hasMonthlyTarget=filters.targets.includes('月度目标值');
  const profitPoints=monthList(filters.month).slice(-2).map(month=>{
    const monthRows=getRows(filters,month).filter(row=>row.cost!==null);
    return hasMonthlyTarget?metricDeviation(financialMetricValue(monthRows,'profit'),financialTargetValue(monthRows,'profit'),'profit'):null;
  });
  const previousDeviation=profitPoints.length>=2?profitPoints[profitPoints.length-2]:null;
  const latestDeviation=profitPoints.length?profitPoints[profitPoints.length-1]:null;
  const deviationDelta=latestDeviation===null||previousDeviation===null?null:latestDeviation-previousDeviation;
  const trendTone=deviationDelta===null?'neutral':deviationDelta>0.5?'green':deviationDelta<-0.5?'red':'blue';
  const trendText=deviationDelta===null?'趋势待补':deviationDelta>0.5?'目标差距收窄':deviationDelta<-0.5?'目标差距扩大':'目标差距持平';
  const conclusionTag=!rows.length?{text:'暂不能判断',color:'gold'}:
    isTos&&rows.some(row=>row.cost===null||!Number.isFinite(row.cost))?{text:'需要治理',color:'red'}:
    {text:'基本符合但需关注',color:'blue'};
  // References: none — TOS only compares known CN costs, never distributes costs by sales region.
  const operatingGroups:OperatingGroup[]=splitRows(isTos?comparableRows:rows,row=>isTos?row.unit:`${row.area}|${row.region}`).map(([id,group])=>{
    const total=totals(group), costAvailable=group.some(row=>row.cost!==null);
    return {id,unit:isTos?group[0].unit:undefined,area:group[0].area,region:isTos?undefined:group[0].region,rows:group,income:total.income,cost:costAvailable?total.cost:null,profit:costAvailable?total.profit:null,rate:costAvailable?total.rate:null};
  });
  const insights:UnitInsight[]=splitRows(rows,row=>row.unit).map(([unit,group])=>{
    // TOS quantity and capacity must use the same CN scope; do not mix overseas quantities into CN efficiency.
    const comparableGroup=isTos?group.filter(row=>row.area==='cn'):group;
    const prior=previousRows.filter(row=>row.unit===unit&&(!isTos||row.area==='cn'));
    const quantity=finiteTotal(comparableGroup,'quantity'), capacity=finiteTotal(comparableGroup,'capacity');
    const price=weightedPrice(comparableGroup,'price');
    const cumulativePrice=weightedPrice(comparableGroup,'cumulativePrice'),annualTarget=weightedTargetPrice(comparableGroup);
    return {id:unit,unit,rows:comparableGroup.length?comparableGroup:group,priceChange:relativeChange(price,weightedPrice(prior,'price')),capacityChange:relativeChange(capacity,finiteTotal(prior,'capacity')),salesRate:capacity&&quantity!==null?quantity/capacity*100:null,price,cumulativePrice,annualTarget,annualDeviation:metricDeviation(cumulativePrice,annualTarget,'price')};
  });
  const focusFor=(group:AnalysisRow[]):DrillFocus=>({units:Array.from(new Set(group.map(row=>row.unit))),areas:Array.from(new Set(group.map(row=>row.area))),regions:isTos?null:Array.from(new Set(group.map(row=>row.region)))});
  const chartGroups=isTos?operatingGroups:splitRows(rows,row=>row.area).map(([area,group])=>{
    const total=totals(group);return {id:area,area,rows:group,...total};
  });
  const operatingValues=chartGroups.flatMap(group=>[
    {x:isTos?group.id:(areaNames[group.area||'']||group.area||group.id),series:'收入',value:group.income},
    {x:isTos?group.id:(areaNames[group.area||'']||group.area||group.id),series:'成本',value:group.cost},
    {x:isTos?group.id:(areaNames[group.area||'']||group.area||group.id),series:'利润',value:group.profit},
  ]);
  const incomeColumns:any[]=[
    ...(isTos?[{title:'计费单元',dataIndex:'unit',width:115,responsiveFixed:'left'}]:[
      {title:'大区',dataIndex:'area',width:90,render:(v:string)=>areaNames[v]||v},
      {title:'售卖区域',dataIndex:'region',width:116},
    ]),
    {title:`${Number(filters.month.slice(-2))}月收入`,dataIndex:'income',width:125,sorter:(a:OperatingGroup,b:OperatingGroup)=>a.income-b.income,render:tableAmount},
    {title:`${Number(filters.month.slice(-2))}月成本`,dataIndex:'cost',width:125,render:tableAmount},
    {title:`${Number(filters.month.slice(-2))}月利润`,dataIndex:'profit',width:125,render:(v:number|null)=><span className={v!==null&&v<0?'red-value':''}>{tableAmount(v)}</span>},
    {title:'成本利润率',dataIndex:'rate',width:105,render:tablePercent},
    {title:isTos?'下钻方向':'解读',dataIndex:'id',width:250,render:(_:string,group:OperatingGroup)=><div>
      <span>{group.cost===null?'当前范围成本不可比，仅查看收入。':(group.profit||0)<0?'当前范围亏损；需核验计费项成本与公式。':'实际经营盈利，可继续查看原型目标差距。'}</span>
      <br/><QuickLink onClick={()=>onDrill('income','product-income-expense',focusFor(group.rows))}>商品收支</QuickLink>
    </div>},
  ];
  const formulaColumns:any[]=[
    {title:'计费单元',dataIndex:'unit',width:126,responsiveFixed:'left'},
    {title:'单价环比',dataIndex:'priceChange',width:95,render:changeText},
    {title:'容量环比',dataIndex:'capacityChange',width:95,render:changeText},
    {title:'售卖率',dataIndex:'salesRate',width:85,render:tablePercent},
    {title:'归因判断',dataIndex:'id',width:280,render:(_:string,insight:UnitInsight)=><div>
      <span>{insight.salesRate===null?'同粒度物理容量缺失，原因待确认。':'售卖率口径可比；可结合目标偏差继续归因。'}</span>
      <QuickLink disabled={!supported} onClick={()=>onDrill('pricing','pricing-item-formula',focusFor(insight.rows))}>{supported?'计费项公式':'暂无定价公式'}</QuickLink>
    </div>},
  ];
  // References: none — V205 combined overview detail; financial and attribution values share each unit's actual scope, never an index-based join.
  const operatingSummary=insights.map(insight=>{
    const total=totals(insight.rows),costAvailable=insight.rows.some(row=>row.cost!==null);
    return {...insight,income:total.income,cost:costAvailable?total.cost:null,profit:costAvailable?total.profit:null,rate:costAvailable?total.rate:null};
  });
  const operatingSummaryColumns:any[]=[
    {title:'对象',dataIndex:'unit',width:140,responsiveFixed:'left'},
    ...incomeColumns.filter(column=>['income','cost','profit','rate'].includes(column.dataIndex)),
    ...formulaColumns.filter(column=>['priceChange','salesRate','id'].includes(column.dataIndex)),
  ];
  const yearlyColumns:any[]=[
    {title:'对象',dataIndex:'unit',width:135,responsiveFixed:'left'},
    {title:'年度累计单价偏差',dataIndex:'annualDeviation',width:145,align:'right',render:trendPercent},
    {title:'月趋势判断',dataIndex:'annualDeviation',width:190,render:(value:number|null)=>value===null?'暂无可比数据':value<-5?'低于年度目标':value>5?'高于年度目标':'目标附近波动'},
    {title:'建议动作',dataIndex:'id',width:280,render:(_:string,insight:UnitInsight)=><div>
      <span>{insight.annualDeviation===null?'核验累计价格取数。':Math.abs(insight.annualDeviation)>5?'复核偏差较大的计费组合。':'保持观察并跟踪后续月份。'}</span><br/>
      <QuickLink disabled={!supported} onClick={()=>onDrill('pricing','pricing-item-income',focusFor(insight.rows))}>计费项收入</QuickLink>
    </div>},
  ];
  // References: none — actions are evidence-backed review entry points, not execution workflows.
  const actions:ActionRow[]=rows.length?[
    ...negativeAreas.map(area=>{
      const areaRows=comparableRows.filter(row=>row.area===area),result=totals(areaRows);
      return {id:`loss-${area}`,priority:'P1' as const,scope:`${isTos?'TOS':'ByteGraph'} / ${area.toUpperCase()}`,object:Array.from(new Set(areaRows.map(row=>row.unit))).join('、'),basis:`当前月利润 ${amount(result.profit)}，成本利润率 ${percent(result.rate)}；负利润仅说明经营结果，原因待确认。`,action:'拆分成本商品，核验同粒度公式指标与资源成本，暂不直接调价。',link:'计费项成本',tab:'pricing' as const,anchor:'pricing-item-cost',focus:focusFor(areaRows)};
    }),
    {id:'target-version',priority:'P1',scope:filters.product,object:'原型目标版本与年度累计价格',basis:'已生成月度、季度、年度原型目标，可用于验证目标差距和偏差排序。',action:'联调正式数据时替换原型目标，并核验适用账期、币种与模型版本。',link:'计费项收入',tab:'pricing',anchor:'pricing-item-income',focus:focusFor(rows)},
    ...(isTos&&rows.some(row=>row.area!=='cn')?[{id:'tos-overseas',priority:'P2' as const,scope:'TOS / 海外',object:'当前所选海外计费单元',basis:'当前成本源仅支持“计费单元 × 大区”的 CN 范围；海外成本缺失，不能推断利润。',action:'作为收入变化单独跟踪，不用 CN 成本推断海外利润。',link:'计费项收支',tab:'income' as const,anchor:'charge-income-expense',focus:focusFor(rows.filter(row=>row.area!=='cn'))}]:[]),
    {id:'formula-review',priority:'P2',scope:filters.product,object:insights.map(insight=>insight.unit).join('、'),basis:'已展示测算单价及物理容量变化；现阶段尚无经验证的归因贡献值。',action:'沿计费项、单位成本与售卖率核验公式关系，保留证据后再评审。',link:supported?'计费项公式':'暂无定价公式',tab:'pricing',anchor:'pricing-item-formula',focus:focusFor(rows)},
  ]:[];
  const actionColumns:any[]=[
    {title:'优先级',dataIndex:'priority',width:85,render:(v:PriorityLevel)=><PriorityCell value={v}/>},
    {title:'商品 / 范围',dataIndex:'scope',width:185},
    {title:'下钻对象',dataIndex:'object',width:235},
    {title:'定位依据',dataIndex:'basis',width:370},
    {title:'管理动作',dataIndex:'action',width:385,responsiveFixed:'right',render:(v:string,row:ActionRow)=><div>{v}<br/><QuickLink disabled={row.tab==='pricing'&&!supported} onClick={()=>onDrill(row.tab,row.anchor,row.focus)}>{row.link}</QuickLink></div>},
  ];
  const operatingItems=[
    'Bytegraph 的主要问题不是“整体收入差”，而是 US 区域亏损与售卖量断崖式下滑；同时海外目标偏低导致部分区域年度达成率被放大。成本定价公式拆解显示，Bytegraph 计算层价格主要受单位成本、综合售卖率、其他成本加成和策略加成影响；9 月 US 的策略加成稳定，异常更集中在售卖率与其他成本加成，US 其他成本加成从 6 月 20.9% 升至 9 月 66.6%。',
  ];
  const annualItems=isTos
    ? ['Request 负偏差优先治理、Storage/StorageEC 为 P1 观察。']
    : ['US Storage/MEM 负偏差优先治理'];
  return <>
    <Section title={<span className="conclusion-title">商品经营结论<Tag size="small" color={conclusionTag.color} bordered={false} className={`conclusion-status-tag conclusion-status-tag-${conclusionTag.color}`}>{conclusionTag.text}</Tag></span>} id="overview-conclusion">
      <div className="conclusion-grid">
        <SemanticMetricCard
          title="经营状态"
          tone={!hasComparable?'neutral':current.profit>=0?'green':'red'}
          text={hasComparable?(current.profit>=0?'整体盈利':'整体亏损'):'暂无可比成本'}
          noteFields={hasComparable?[{label:'利润',value:amount(current.profit)},{label:'成本利润率',value:percent(current.rate)}]:undefined}
          description={!hasComparable?'当前范围暂无完整收入与成本数据':undefined}
        />
        <SemanticMetricCard
          title="主要风险"
          tone={negativeAreas.length?'red':'neutral'}
          text={negativeAreas.length?`${negativeAreas.length} 个亏损大区`:'版本与公式待核验'}
          description={negativeAreas.length?negativeAreas.slice(0,3).map(area=>areaNames[area]||area).join('、'):rows.length?'无亏损大区':'当前筛选无数据'}
        />
        <SemanticMetricCard
          title="目标差距趋势"
          tone={trendTone}
          text={trendText}
          noteFields={deviationDelta===null?undefined:[{label:'最近一期利润月度偏差',value:<TrendValue value={latestDeviation}/>} ]}
          description={deviationDelta===null?(hasMonthlyTarget?'最近两期目标偏差不可比':'未选择月度目标值'):undefined}
        />
        <SemanticMetricCard
          title="动作边界"
          tone="blue"
          text="暂不直接调价"
          description="年度累计偏差持续扩大并越界后再评审"
        />
      </div>
    </Section>
    <Section title="经营现状" id="overview-operating">
      <AIDataInterpretation context="经营现状" items={operatingItems}/>
      {/* Financial and price charts share the operating summary below. */}
      <div className="overview-operating-charts" data-testid="overview-operating-charts">
        {operatingGroups.length?<AnalysisChart title="收支分析" type="bar" values={operatingValues} height={300} unit="元"/>:<EmptyState text={rows.length?'当前范围暂无可比成本，仅支持查看收入':'当前筛选无数据'}/>}
        {insights.length?<AnalysisChart title="单价分析" type="bar" values={insights.map(insight=>({x:insight.unit,series:'单价环比',value:insight.priceChange}))} height={285} percent/>:<EmptyState/>}
      </div>
      <div className="overview-operating-summary" data-testid="overview-operating-summary">{operatingSummary.length?<DataTable className="overview-operating-table" columns={operatingSummaryColumns} data={operatingSummary} width={1185} maxHeight={340}/>:<EmptyState/>}</div>
      {/* References: none — retain the complete region and attribution details, including their existing drill and evidence entry points. */}
      <h3 className="subsection-title">收支分析</h3>
      {operatingGroups.length?<DataTable className="overview-income-table" columns={incomeColumns} data={operatingGroups} width={isTos?845:950} maxHeight={340}/>:<EmptyState text={rows.length?'当前范围暂无可比成本，仅支持查看收入':'当前筛选无数据'}/>}
      <h3 className="subsection-title">公式归因</h3>
      {insights.length?<DataTable className="overview-formula-table" columns={formulaColumns} data={insights} width={775}/>:<EmptyState/>}
    </Section>
    <Section title="年度累计价差" id="overview-yearly">
      <AIDataInterpretation context="年度累计价差" items={annualItems}/>
      {insights.length?<div className={filters.targets.includes('年度目标值')?'analysis-two-col equal':undefined}>
        {filters.targets.includes('年度目标值')&&<AnalysisChart title="年度累计单价偏差" type="bar" values={insights.map(insight=>({x:insight.unit,series:'年度累计单价偏差',value:insight.annualDeviation}))} height={265} percent/>}
        <DataTable className="overview-yearly-table" columns={yearlyColumns} data={insights} width={750}/>
      </div>:<EmptyState/>}
    </Section>
    <Section title="处理动作" id="overview-actions">
      {actions.length?<DataTable className="overview-actions-table" columns={actionColumns} data={actions} width={1260}/>:<EmptyState text="当前筛选无数据，暂无可用的处理动作"/>}
    </Section>
  </>;
}
