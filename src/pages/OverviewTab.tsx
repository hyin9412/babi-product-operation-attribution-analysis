// References: none — newly built from PRD section 3 and its four overview screenshots.
import React, {useMemo, useState} from 'react';
import {Button, Drawer, Descriptions, Tag} from '@byted-babi/babi-design';
import {
  AnalysisProps, AnalysisRow, DrillFocus, TOS, BYTEGRAPH,
  getRows, totals, areaNames, amount, percent,
} from './analysisData';
import {Section, Note, EmptyState, AnalysisChart, DataTable, QuickLink} from './analysisUI';
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
  quantityChange: number | null;
  priceChange: number | null;
  capacityChange: number | null;
  salesRate: number | null;
  price: number | null;
  cumulativePrice: number | null;
}
interface Evidence {
  title: string;
  object: string;
  month: string;
  indicator: string;
  value: string;
  rule: string;
  boundary: string;
}
interface ActionRow {
  id: string;
  priority: 'P0' | 'P1' | 'P2';
  scope: string;
  object: string;
  basis: string;
  action: string;
  link: string;
  tab: 'income' | 'pricing';
  anchor: string;
  focus: DrillFocus;
}
const finiteTotal = (rows:AnalysisRow[], key:'quantity'|'capacity') => {
  const values=rows.map(row=>row[key]).filter((v):v is number=>v!==null&&Number.isFinite(v));
  return values.length ? values.reduce((sum,v)=>sum+v,0) : null;
};
const relativeChange = (current:number|null, previous:number|null) => current===null||previous===null||previous===0 ? null : (current-previous)/previous*100;
const changeText = (value:number|null) => value===null ? '不可比' : `${value>0?'+':''}${value.toFixed(2)}%`;
const weightedPrice = (rows:AnalysisRow[], key:'price'|'cumulativePrice') => {
  const usable=rows.filter(row=>row[key]!==null&&Number.isFinite(row[key])&&row.quantity>0);
  const quantity=usable.reduce((sum,row)=>sum+row.quantity,0);
  return quantity ? usable.reduce((sum,row)=>sum+(row[key]||0)*row.quantity,0)/quantity : null;
};
const splitRows = (rows:AnalysisRow[], key:(row:AnalysisRow)=>string) => {
  const groups=new Map<string,AnalysisRow[]>();
  rows.forEach(row=>groups.set(key(row), [...(groups.get(key(row))||[]),row]));
  return Array.from(groups.entries());
};

export default function OverviewTab({filters,onDrill}:AnalysisProps) {
  const [evidence,setEvidence]=useState<Evidence|null>(null);
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
    return {id:unit,unit,rows:comparableGroup.length?comparableGroup:group,quantityChange:relativeChange(quantity,finiteTotal(prior,'quantity')),priceChange:relativeChange(price,weightedPrice(prior,'price')),capacityChange:relativeChange(capacity,finiteTotal(prior,'capacity')),salesRate:capacity&&quantity!==null?quantity/capacity*100:null,price,cumulativePrice:null};
  });
  const focusFor=(group:AnalysisRow[]):DrillFocus=>({units:Array.from(new Set(group.map(row=>row.unit))),areas:Array.from(new Set(group.map(row=>row.area))),regions:isTos?null:Array.from(new Set(group.map(row=>row.region)))});
  const showTargetEvidence=()=>setEvidence({title:'数据完整性 · 有效目标版本缺失',object:filters.product,month:filters.month,indicator:'收入 / 成本 / 利润 / 成本利润率目标',value:'未提供有效目标值',rule:'目标仅使用状态为“有效”的版本；缺失或为零时，月度偏差、达成率和目标趋势均不可计算。',boundary:'当前目标表无有效版本。停止稳定价、年度价格偏差与调价结论；实际经营数据继续展示。'});
  const showEfficiencyEvidence=(insight:UnitInsight)=>setEvidence({title:'效率 · 公式关系证据',object:`${filters.product} / ${insight.unit}`,month:filters.month,indicator:'综合售卖率',value:percent(insight.salesRate),rule:'综合售卖率 = 同粒度售卖量 ÷ 物理容量。单价公式中使用售卖率作为分母，其他条件不变时，售卖率降低会使测算单价提高。',boundary:insight.salesRate===null?'缺少同粒度物理容量，不能输出确定的效率归因。':'仅说明指标及公式关系；尚无经验证的归因分解结果，不输出贡献值或调价建议。'});
  const showPriceEvidence=(insight:UnitInsight)=>setEvidence({title:'数据完整性 · 年度价格判断被阻断',object:`${filters.product} / ${insight.unit}`,month:`2026-01 至 ${filters.month}`,indicator:'年度累计测算单价 / 年度目标单价',value:isTos?'年度累计加权数据未接入':'组合维度累计快照已接入；有效年度目标 —',rule:'年度累计测算单价应由后端按同年、同组合、同单位的售卖量加权。年度目标须为有效版本，并与模型、数据版本一致。',boundary:isTos?'不得用当前月价替代累计价，也不能依据 CN 成本推断海外利润。':'年度目标版本未生效，不能计算年度累计偏差或推导调价结论。'});
  const chartGroups=isTos?operatingGroups:splitRows(rows,row=>row.area).map(([area,group])=>{
    const total=totals(group);return {id:area,area,rows:group,...total};
  });
  const operatingValues=chartGroups.flatMap(group=>[
    {x:isTos?group.id:(areaNames[group.area||'']||group.area||group.id),series:'收入',value:group.income},
    {x:isTos?group.id:(areaNames[group.area||'']||group.area||group.id),series:'成本',value:group.cost},
    {x:isTos?group.id:(areaNames[group.area||'']||group.area||group.id),series:'利润',value:group.profit},
  ]);
  const incomeColumns:any[]=[
    ...(isTos?[{title:'计费单元',dataIndex:'unit',width:115,render:(v:string)=><strong>{v}</strong>}]:[
      {title:'大区',dataIndex:'area',width:90,render:(v:string)=>areaNames[v]||v},
      {title:'售卖区域',dataIndex:'region',width:116},
    ]),
    {title:`${Number(filters.month.slice(-2))}月收入`,dataIndex:'income',width:125,sorter:(a:OperatingGroup,b:OperatingGroup)=>a.income-b.income,render:amount},
    {title:`${Number(filters.month.slice(-2))}月成本`,dataIndex:'cost',width:125,render:amount},
    {title:`${Number(filters.month.slice(-2))}月利润`,dataIndex:'profit',width:125,render:(v:number|null)=><span className={v!==null&&v<0?'red-value':''}>{amount(v)}</span>},
    {title:'成本利润率',dataIndex:'rate',width:105,render:percent},
    {title:isTos?'下钻方向':'解读',dataIndex:'id',width:250,render:(_:string,group:OperatingGroup)=><div>
      <span>{group.cost===null?'当前范围成本不可比，仅查看收入。':(group.profit||0)<0?'当前范围亏损；需核验计费项成本与公式。':'实际经营盈利，目标差距待有效版本补齐。'}</span>
      <br/><QuickLink onClick={()=>onDrill('income','product-income-expense',focusFor(group.rows))}>查看商品收支</QuickLink>
    </div>},
  ];
  const formulaColumns:any[]=[
    {title:'计费单元',dataIndex:'unit',width:126,render:(v:string)=><strong>{v}</strong>},
    {title:'售卖量环比',dataIndex:'quantityChange',width:100,render:changeText},
    {title:'单价环比',dataIndex:'priceChange',width:95,render:changeText},
    {title:'容量环比',dataIndex:'capacityChange',width:95,render:changeText},
    {title:'售卖率',dataIndex:'salesRate',width:85,render:percent},
    {title:'归因判断',dataIndex:'id',width:280,render:(_:string,insight:UnitInsight)=><div>
      <span>{insight.salesRate===null?'同粒度物理容量缺失，原因待确认。':'售卖量和物理容量可比；目标版本未生效，归因原因待确认。'}</span>
      <div className="evidence-tags"><Button size="mini" type="text" onClick={()=>showTargetEvidence()}>数据完整性</Button>{filters.product===BYTEGRAPH&&insight.unit==='bytegraph.cpu'&&<Button size="mini" type="text" onClick={()=>showEfficiencyEvidence(insight)}>效率 · 证据</Button>}</div>
      <QuickLink disabled={!supported} onClick={()=>onDrill('pricing','pricing-item-formula',focusFor(insight.rows))}>{supported?'查看计费项公式':'暂无定价公式'}</QuickLink>
    </div>},
  ];
  // References: none — V205 combined overview detail; financial and attribution values share each unit's actual scope, never an index-based join.
  const operatingSummary=insights.map(insight=>{
    const total=totals(insight.rows),costAvailable=insight.rows.some(row=>row.cost!==null);
    return {...insight,income:total.income,cost:costAvailable?total.cost:null,profit:costAvailable?total.profit:null,rate:costAvailable?total.rate:null};
  });
  const operatingSummaryColumns:any[]=[
    {title:'对象',dataIndex:'unit',width:140,render:(value:string)=><strong>{value}</strong>},
    ...incomeColumns.filter(column=>['income','cost','profit','rate'].includes(column.dataIndex)),
    ...formulaColumns.filter(column=>['quantityChange','priceChange','salesRate','id'].includes(column.dataIndex)),
  ];
  const operatingConclusion=rows.length?hasComparable?`当前可比范围利润 ${amount(current.profit)}，成本利润率 ${percent(current.rate)}。${negativeAreas.length?'亏损范围应优先核验成本与公式，原因待确认。':'目标差距需有效目标版本补齐后判断。'}`:'当前筛选范围仅有收入数据，成本与利润不可比。':'当前筛选暂无经营数据，请调整商品、大区或售卖区域。';
  const yearlyColumns:any[]=[
    {title:'对象',dataIndex:'unit',width:135,render:(v:string)=><strong>{v}</strong>},
    {title:'年度累计单价偏差',dataIndex:'id',width:145,render:(_:string,insight:UnitInsight)=><Button size="mini" type="text" onClick={()=>showPriceEvidence(insight)} className="muted-value">— · 不可判断</Button>},
    {title:'月趋势判断',dataIndex:'id',width:190,render:()=>isTos?'年度累计加权数据未接入':'目标版本未生效，趋势待补'},
    {title:'建议动作',dataIndex:'id',width:280,render:(_:string,insight:UnitInsight)=><div>
      <span>{isTos?'先接入同口径售卖量加权累计数据，补齐有效目标。':'核验目标状态及模型版本，暂不输出稳定价或调价建议。'}</span><br/>
      <QuickLink disabled={!supported} onClick={()=>onDrill('pricing','pricing-item-income',focusFor(insight.rows))}>查看计费项收入</QuickLink>
    </div>},
  ];
  // References: none — actions are evidence-backed review entry points, not execution workflows.
  const actions:ActionRow[]=rows.length?[
    ...negativeAreas.map(area=>{
      const areaRows=comparableRows.filter(row=>row.area===area),result=totals(areaRows);
      return {id:`loss-${area}`,priority:'P1' as const,scope:`${isTos?'TOS':'ByteGraph'} / ${area.toUpperCase()}`,object:Array.from(new Set(areaRows.map(row=>row.unit))).join('、'),basis:`当前月利润 ${amount(result.profit)}，成本利润率 ${percent(result.rate)}；负利润仅说明经营结果，原因待确认。`,action:'拆分成本商品，核验同粒度公式指标与资源成本，暂不直接调价。',link:'查看计费项成本',tab:'pricing' as const,anchor:'pricing-item-cost',focus:focusFor(areaRows)};
    }),
    {id:'target-version',priority:'P1',scope:filters.product,object:'有效目标版本与年度累计价格',basis:'当前目标表没有“有效”记录；月度偏差、年度目标占比及年度累计价格偏差不可判断。',action:'核验目标状态、适用账期与模型版本；补齐前停止调价与 True Up 结论。',link:'查看计费项收入',tab:'pricing',anchor:'pricing-item-income',focus:focusFor(rows)},
    ...(isTos&&rows.some(row=>row.area!=='cn')?[{id:'tos-overseas',priority:'P2' as const,scope:'TOS / 海外',object:'当前所选海外计费单元',basis:'当前成本源仅支持“计费单元 × 大区”的 CN 范围；海外成本缺失，不能推断利润。',action:'作为收入变化单独跟踪，不用 CN 成本推断海外利润。',link:'查看计费项收支',tab:'income' as const,anchor:'charge-income-expense',focus:focusFor(rows.filter(row=>row.area!=='cn'))}]:[]),
    {id:'formula-review',priority:'P2',scope:filters.product,object:insights.map(insight=>insight.unit).join('、'),basis:'已展示售卖量、测算单价及物理容量变化；现阶段尚无经验证的归因贡献值。',action:'沿计费项、单位成本与售卖率核验公式关系，保留证据后再评审。',link:supported?'查看计费项公式':'暂无定价公式',tab:'pricing',anchor:'pricing-item-formula',focus:focusFor(rows)},
  ]:[];
  const actionColumns:any[]=[
    {title:'优先级',dataIndex:'priority',width:85,render:(v:string)=><span className={`badge-priority ${v.toLowerCase()}`}>{v}</span>},
    {title:'商品 / 范围',dataIndex:'scope',width:185},
    {title:'下钻对象',dataIndex:'object',width:235},
    {title:'定位依据',dataIndex:'basis',width:370},
    {title:'管理动作',dataIndex:'action',width:385,render:(v:string,row:ActionRow)=><div>{v}<br/><QuickLink disabled={row.tab==='pricing'&&!supported} onClick={()=>onDrill(row.tab,row.anchor,row.focus)}>{row.link}</QuickLink></div>},
  ];
  return <>
    <Section title="商品经营结论" id="overview-conclusion" extra={<Tag color="orange">暂不能判断</Tag>}>
      <div className="conclusion-grid">
        <div className="conclusion-card green"><h3>经营状态</h3><strong>{hasComparable?(current.profit>=0?'整体盈利':'整体亏损'):'暂无可比成本'}</strong><p>{hasComparable?`利润 ${amount(current.profit)}，成本利润率 ${percent(current.rate)}`:'当前范围暂无完整收入与成本数据'}</p></div>
        <div className="conclusion-card amber"><h3>主要风险</h3><strong>{negativeAreas.length?`${negativeAreas.length} 个亏损大区`:'目标与版本待核验'}</strong><p>{negativeAreas.length?negativeAreas.slice(0,3).map(area=>areaNames[area]||area).join('、'):'未提供有效目标值，无法判断目标差距'}</p></div>
        <div className="conclusion-card blue"><h3>目标差距趋势</h3><strong>趋势待补</strong><p>有效月度目标缺失，不计算利润目标偏差及差距趋势</p></div>
        <div className="conclusion-card purple"><h3>动作边界</h3><strong>暂不直接调价</strong><p>年度累计偏差持续扩大并越界后再评审</p></div>
      </div>
      <Note tone="warning">当前目标表没有有效目标版本，经营目标结论暂不能判断。实际数据继续展示，不输出稳定价、调价或 True Up 结论。<Button size="mini" type="text" onClick={showTargetEvidence}>查看依据</Button></Note>
    </Section>
    <Section title="经营现状" id="overview-operating">
      <p className="overview-subtitle">{isTos?'TOS 的可比经营结论只覆盖 CN Request、Storage、StorageEC；售卖区域层面目前只能看收入，不能用 CN 成本推断海外利润。':'按大区和售卖区域查看商品收支，并沿计费项、成本商品和定价公式定位经营问题。'}</p>
      <p className="plain-text overview-operating-conclusion">{operatingConclusion} 环比基于当前组合和上月同粒度数据。{isTos?'TOS 量价与售卖率仅在 CN 可比范围计算。':''}价格变化本身不等于原因；无有效目标或完整公式证据时，归因判断为“原因待确认”。</p>
      {/* References: none — V205 places both charts above a common nine-column summary with a 16px chart-to-table gap. */}
      <div className="overview-operating-charts" data-testid="overview-operating-charts">
        {operatingGroups.length?<AnalysisChart title="收支分析" type="bar" values={operatingValues} height={300} unit="元"/>:<EmptyState text={rows.length?'当前范围暂无可比成本，仅支持查看收入':'当前筛选无数据'}/>}
        {insights.length?<AnalysisChart title="量价分析" type="bar" values={insights.flatMap(insight=>[{x:insight.unit,series:'售卖量环比',value:insight.quantityChange},{x:insight.unit,series:'单价环比',value:insight.priceChange}])} height={285} percent/>:<EmptyState/>}
      </div>
      <div className="overview-operating-summary" data-testid="overview-operating-summary">{operatingSummary.length?<DataTable columns={operatingSummaryColumns} data={operatingSummary} width={1285} maxHeight={340}/>:<EmptyState/>}</div>
      {/* References: none — retain the complete region and attribution details, including their existing drill and evidence entry points. */}
      <h3 className="subsection-title">1.1 收支分析</h3>
      {operatingGroups.length?<DataTable columns={incomeColumns} data={operatingGroups} width={isTos?845:950} maxHeight={340}/>:<EmptyState text={rows.length?'当前范围暂无可比成本，仅支持查看收入':'当前筛选无数据'}/>}
      <h3 className="subsection-title">1.2 公式归因</h3>
      {insights.length?<DataTable columns={formulaColumns} data={insights} width={875}/>:<EmptyState/>}
    </Section>
    <Section title="年度累计价差" id="overview-yearly" subtitle="年度累计价格结论与成本定价使用相同的数据门禁，不用月度测算价替代年度累计价。">
      <Note tone="warning">{isTos?'TOS 年度累计加权数据未接入，年度累计测算单价与偏差均不可判断。':'有效年度目标版本缺失，年度累计偏差与稳定价结论均不可判断。'} <Button size="mini" type="text" onClick={showTargetEvidence}>数据完整性 · 查看证据</Button></Note>
      {insights.length?<div className="analysis-two-col equal"><AnalysisChart title="年度累计单价偏差" type="bar" values={insights.map(insight=>({x:insight.unit,series:'年度累计单价偏差',value:null}))} height={265} percent/><DataTable columns={yearlyColumns} data={insights} width={750}/></div>:<EmptyState/>}
    </Section>
    <Section title="处理动作" id="overview-actions">
      {actions.length?<DataTable columns={actionColumns} data={actions} width={1260}/>:<EmptyState text="当前筛选无数据，暂无可用的处理动作"/>}
    </Section>
    <Drawer title={evidence?.title||'归因证据'} width={700} visible={evidence!==null} onCancel={()=>setEvidence(null)} footer={<Button type="primary" onClick={()=>setEvidence(null)}>关闭</Button>}>
      {evidence&&<div className="analysis-evidence" data-testid="overview-evidence"><Descriptions column={1} labelStyle={{width:112,color:'var(--color-text-3)'}} data={[{label:'受影响对象',value:evidence.object},{label:'适用账期',value:evidence.month},{label:'关联指标',value:evidence.indicator},{label:'当前值 / 状态',value:evidence.value}]}/><Note>{evidence.rule}</Note><Note tone="warning">{evidence.boundary}</Note><div className="version-strip"><span>模型版本 <b>V2 · 2026-09</b></span><span>目标版本 <b>未生效</b></span><span>数据版本 <b>快照 2026-09</b></span></div></div>}
    </Drawer>
  </>;
}
