import React from 'react';
import { Popover } from '@byted-babi/babi-design';
import { IconGreeDown, IconRedUp } from '@arco-design/iconbox-react-babi';
import { SemanticCardFields, SemanticCardNoteField } from './analysisUI';

export type IncomeMetricValueParts = {
  number: string;
  scale?: string;
  unit?: string;
};

export interface IncomeMetricCardProps {
  title: string;
  value: IncomeMetricValueParts;
  previousValue: string;
  monthOverMonth: number | null;
  lastYearValue: string;
  yearOverYear: number | null;
  changeUnit?: '%' | 'pp';
  selectedTargets: string[];
  monthlyTarget?: string;
  monthlyDeviation?: number | null;
  quarterlyTarget?: string;
  quarterlyDeviation?: number | null;
  annualTarget?: string;
  yearToDateActual?: string;
  annualTargetShare?: number | null;
  annualDeviation?: number | null;
}

const formatChange = (value:number, unit:'%'|'pp') =>
  `${value > 0 ? '+' : ''}${value.toFixed(2)}${unit}`;
const displayValue = (value:string) => !value.trim() || value.trim()==='—' ? '-' : value;

function ChangeIndicator({value,unit}:{value:number|null;unit:'%'|'pp'}) {
  if(value===null || !Number.isFinite(value)) {
    return <span className="income-metric-change is-missing">-</span>;
  }
  if(Math.abs(value)<1e-9) {
    return <span className="income-metric-change is-zero"><i aria-hidden />0.0</span>;
  }
  const positive=value>0;
  return <span className={`income-metric-change ${positive?'is-positive':'is-negative'}`}>
    {positive?<IconRedUp aria-hidden/>:<IconGreeDown aria-hidden/>}
    {formatChange(value,unit)}
  </span>;
}

function DeviationValue({value,unit}:{value:number|null|undefined;unit:'%'|'pp'}) {
  if(value===null || value===undefined || !Number.isFinite(value)) {
    return <span className="income-metric-target-value">-</span>;
  }
  if(Math.abs(value)<1e-9) {
    return <span className="income-metric-target-value is-zero">0.0</span>;
  }
  return <span className={`income-metric-target-value ${value>0?'is-positive':'is-negative'}`}>
    {formatChange(value,unit)}
  </span>;
}

function FormulaValue({content,children}:{content:string;children:React.ReactNode}) {
  return <Popover className="income-metric-formula-popover" content={content} trigger="hover" unmountOnExit><span className="income-metric-formula-value">{children}</span></Popover>;
}

function MetricFields({fields}:{fields:SemanticCardNoteField[]}) {
  return <SemanticCardFields fields={fields} className="income-metric-fields"/>;
}

function TargetComparisonRow({
  label,
  value,
  deviation,
  unit,
  formula,
}:{
  label:string;
  value:string;
  deviation:number|null|undefined;
  unit:'%'|'pp';
  formula?:string;
}) {
  const deviationValue=<DeviationValue value={deviation} unit={unit}/>;
  return <MetricFields fields={[
    {label:`${label}：`,value:displayValue(value)},
    {label:'偏差：',value:formula?<FormulaValue content={formula}>{deviationValue}</FormulaValue>:deviationValue},
  ]}/>;
}

function TargetValueRow({label,value,formula}:{label:string;value:string;formula?:string}) {
  const displayed=displayValue(value);
  return <MetricFields fields={[{
    label:`${label}：`,
    value:formula?<FormulaValue content={formula}>{displayed}</FormulaValue>:displayed,
  }]}/>;
}

export default function IncomeMetricCard({
  title,
  value,
  previousValue,
  monthOverMonth,
  lastYearValue,
  yearOverYear,
  changeUnit='%',
  selectedTargets,
  monthlyTarget='-',
  monthlyDeviation=null,
  quarterlyTarget='-',
  quarterlyDeviation=null,
  annualTarget='-',
  yearToDateActual='-',
  annualTargetShare=null,
  annualDeviation=null,
}:IncomeMetricCardProps) {
  const showMonthly=selectedTargets.includes('月度目标值');
  const showQuarterly=selectedTargets.includes('季度目标值');
  const showAnnual=selectedTargets.includes('年度目标值');
  const showTargets=showMonthly||showQuarterly||showAnnual;

  return <article className="income-metric-card">
    <div className="income-metric-content">
      <h3 className="income-metric-title">{title}</h3>
      <div className="income-metric-primary">
        <span className="income-metric-number">{displayValue(value.number)}</span>
        {value.scale&&<span className="income-metric-scale">{value.scale}</span>}
        {value.unit&&<span className="income-metric-unit">{value.unit}</span>}
      </div>
      <div className="income-metric-comparisons">
        <MetricFields fields={[
          {label:'上月：',value:displayValue(previousValue)},
          {label:'环比：',value:<ChangeIndicator value={monthOverMonth} unit={changeUnit}/>},
        ]}/>
        <MetricFields fields={[
          {label:'去年同期：',value:displayValue(lastYearValue)},
          {label:'同比：',value:<ChangeIndicator value={yearOverYear} unit={changeUnit}/>},
        ]}/>
      </div>
    </div>
    {showTargets&&<div className="income-metric-targets">
      {showMonthly&&<TargetComparisonRow label="月度目标" value={monthlyTarget} deviation={monthlyDeviation} unit={changeUnit} formula="月度偏差 =（当月实际值 - 月度目标值）/ 月度目标值"/>}
      {showQuarterly&&<TargetComparisonRow label="季度目标" value={quarterlyTarget} deviation={quarterlyDeviation} unit={changeUnit}/>}
      {showAnnual&&(changeUnit==='pp'
        ?<TargetComparisonRow label="年度目标" value={annualTarget} deviation={annualDeviation} unit="pp"/>
        :<>
          <TargetValueRow label="年度目标" value={annualTarget}/>
          <TargetValueRow label="1月至今累计实际值" value={yearToDateActual}/>
          <TargetValueRow label="年度目标累计占比" value={annualTargetShare===null||!Number.isFinite(annualTargetShare)?'-':`${annualTargetShare.toFixed(2)}%`} formula="年度目标累计占比 = 1月至当前账期累计实际值 / 全年目标"/>
        </>)}
    </div>}
  </article>;
}
