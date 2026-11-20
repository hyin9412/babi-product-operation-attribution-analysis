import React from 'react';
import Popover from './AnalysisPopover';
import { IconGreeDown, IconRedUp } from '@arco-design/iconbox-react-babi';
import { OverflowText, SemanticCardFields, SemanticCardNoteField } from './analysisUI';
import { FinancialTargetSummary } from './analysisData';

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
  targetSummary: FinancialTargetSummary;
  rateProfit?: number | null;
  rateCost?: number | null;
}

const formatChange = (value:number, unit:'%'|'pp') =>
  `${value > 0 ? '+' : ''}${value.toFixed(2)}${unit}`;
const displayValue = (value:string) => !value.trim() || value.trim()==='—' ? '-' : value;

function ChangeIndicator({value,unit}:{value:number|null;unit:'%'|'pp'}) {
  if(value===null || !Number.isFinite(value)) {
    return <span className="income-metric-change is-missing">-</span>;
  }
  if(Math.abs(value)<1e-9) {
    return <span className="income-metric-change is-zero"><i aria-hidden />{formatChange(0,unit)}</span>;
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
    return <span className="income-metric-target-value is-zero">{formatChange(0,unit)}</span>;
  }
  return <span className={`income-metric-target-value ${value>0?'is-positive':'is-negative'}`}>
    {formatChange(value,unit)}
  </span>;
}

const formulaNumber=(value:number,unit:'%'|'pp')=>
  `${value.toLocaleString('zh-CN',{maximumFractionDigits:6})}${unit==='pp'?'%':' 元'}`;

function deviationFormula(period:string,actualLabel:string,actual:number|null,target:number|null,deviation:number|null,unit:'%'|'pp') {
  const isRate=unit==='pp';
  const formula=isRate
    ?`${period}目标累计偏差 = ${actualLabel} - ${period}目标值`
    :`${period}偏差 =（${actualLabel} - ${period}目标值）/ |${period}目标值| × 100%`;
  const available=actual!==null&&target!==null&&Number.isFinite(actual)&&Number.isFinite(target)&&target!==0&&deviation!==null&&Number.isFinite(deviation);
  return <div className="income-metric-formula-details">
    {formula}{available
      ?isRate
        ?` = ${formulaNumber(actual,unit)} - ${formulaNumber(target,unit)} ≈ ${formatChange(deviation,unit)}`
        :` = (${formulaNumber(actual,unit)} - ${formulaNumber(target,unit)}) / |${formulaNumber(target,unit)}| × 100% ≈ ${formatChange(deviation,'%')}`
      :` = -（实际值 ${actual!==null&&Number.isFinite(actual)?formulaNumber(actual,unit):'-'}，目标值 ${target!==null&&Number.isFinite(target)?formulaNumber(target,unit):'-'}；数据缺失或目标值为 0，无法计算偏差）`}
  </div>;
}

function rateTargetDeviationFormula(period:'月度'|'季度',actual:number|null,target:number|null,deviation:number|null) {
  const available=actual!==null&&target!==null&&Number.isFinite(actual)&&Number.isFinite(target)&&target!==0&&deviation!==null&&Number.isFinite(deviation);
  const percentNumber=(value:number)=>`${value.toLocaleString('zh-CN',{maximumFractionDigits:6})}%`;
  return <div className="income-metric-formula-details">
    {period}偏差 =（当月实际值 - {period}目标值）/ |{period}目标值| × 100%
    {available
      ?` = (${percentNumber(actual)} - ${percentNumber(target)}) / |${percentNumber(target)}| × 100% ≈ ${formatChange(deviation,'%')}`
      :` = -（实际值 ${actual!==null&&Number.isFinite(actual)?percentNumber(actual):'-'}，目标值 ${target!==null&&Number.isFinite(target)?percentNumber(target):'-'}；数据缺失或目标值为 0，无法计算偏差）`}
  </div>;
}

function annualShareFormula(actual:number|null,target:number|null,share:number|null,unit:'%'|'pp') {
  const available=actual!==null&&target!==null&&share!==null&&Number.isFinite(actual)&&Number.isFinite(target)&&Number.isFinite(share)&&target!==0;
  return <div className="income-metric-formula-details">
    年度目标累计占比 = 1月至当前账期累计实际值 / 年度目标值 × 100%
    {available?` = ${formulaNumber(actual,unit)} / (${formulaNumber(target,unit)}) × 100% ≈ ${share.toFixed(2)}%`:' = -（数据缺失或年度目标值为 0，无法计算累计占比）'}
  </div>;
}

function rateAnnualDeviationFormula(actual:number|null,target:number|null,ratio:number|null,unit:'%'|'pp') {
  const available=actual!==null&&target!==null&&ratio!==null&&Number.isFinite(actual)&&Number.isFinite(target)&&Number.isFinite(ratio)&&target!==0;
  return <div className="income-metric-formula-details">
    年度目标累计偏差 = 1月至当前账期累计实际值 / 年度目标值 × 100%
    {available?` = ${formulaNumber(actual,unit)} / (${formulaNumber(target,unit)}) × 100% ≈ ${ratio.toFixed(2)}%`:' = -（数据缺失或年度目标值为 0，无法计算偏差）'}
  </div>;
}

function rateFormula(profit:number|null,cost:number|null,result:number|null) {
  const formula = '成本利润率 = 利润合计 ÷ 成本合计 × 100%';
  const available = profit !== null && cost !== null && Number.isFinite(profit) && Number.isFinite(cost) && cost !== 0 && result !== null && Number.isFinite(result);
  const fmtCurrency = (v: number) => `${v.toLocaleString('zh-CN', { maximumFractionDigits: 6 })} 元`;
  return <div className="income-metric-formula-details">
    {formula}{available
      ? ` = ${fmtCurrency(profit)} ÷ ${fmtCurrency(cost)} × 100% ≈ ${result.toFixed(2)}%`
      : ` = -（利润合计 ${profit !== null && Number.isFinite(profit) ? fmtCurrency(profit) : '-'}，成本合计 ${cost !== null && Number.isFinite(cost) ? fmtCurrency(cost) : '-'}；数据缺失或成本为 0，无法计算成本利润率）`}
  </div>;
}

export function FormulaValue({content,children,disabled=false}:{content:React.ReactNode;children:React.ReactNode;disabled?:boolean}) {
  return <Popover className="income-metric-formula-popover" content={content} disabled={disabled} trigger="hover" unmountOnExit><span className="income-metric-formula-value">{children}</span></Popover>;
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
  formula?:React.ReactNode;
}) {
  const deviationValue=<DeviationValue value={deviation} unit={unit}/>;
  return <MetricFields fields={[
    {label:`${label}：`,value:displayValue(value)},
    {label:'偏差：',value:formula?<FormulaValue content={formula}>{deviationValue}</FormulaValue>:deviationValue},
  ]}/>;
}

function TargetValueRow({label,value,formula}:{label:string;value:string;formula?:React.ReactNode}) {
  const displayed=displayValue(value);
  return <MetricFields fields={[{
    label:`${label}：`,
    value:formula?<FormulaValue content={formula}>{displayed}</FormulaValue>:displayed,
  }]}/>;
}

function TargetDeviationRow({
  label,
  deviation,
  unit,
  formula,
}:{
  label:string;
  deviation:number|null|undefined;
  unit:'%'|'pp';
  formula?:React.ReactNode;
}) {
  const deviationValue=<DeviationValue value={deviation} unit={unit}/>;
  return <MetricFields fields={[{
    label:`${label}：`,
    value:formula?<FormulaValue content={formula}>{deviationValue}</FormulaValue>:deviationValue,
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
  targetSummary,
  rateProfit=null,
  rateCost=null,
}:IncomeMetricCardProps) {
  const showMonthly=selectedTargets.includes('月度目标值');
  const showQuarterly=selectedTargets.includes('季度目标值');
  const showAnnual=selectedTargets.includes('年度目标值');
  const showTargets=showMonthly||showQuarterly||showAnnual;
  const showRateFormula = rateProfit !== null && rateCost !== null && value.number !== '-';
  const computedRate = rateProfit !== null && rateCost !== null && rateCost !== 0 ? rateProfit / rateCost * 100 : null;

  return <article className="income-metric-card">
    <div className="income-metric-content">
      <OverflowText as="h3" className="income-metric-title">{title}</OverflowText>
      <div className="income-metric-primary">
        <OverflowText className="income-metric-number">
          {showRateFormula
            ? <FormulaValue content={rateFormula(rateProfit, rateCost, computedRate)}>{displayValue(value.number)}</FormulaValue>
            : displayValue(value.number)
          }
        </OverflowText>
        {value.scale&&<span className="income-metric-scale">{value.scale}</span>}
        {value.unit&&<span className="income-metric-unit">{value.unit}</span>}
      </div>
      <div className="income-metric-comparisons">
        <MetricFields fields={[
          {label:'上月实际：',value:displayValue(previousValue)},
          {label:'环比：',value:<ChangeIndicator value={monthOverMonth} unit={changeUnit}/>},
        ]}/>
        <MetricFields fields={[
          {label:'去年同期：',value:displayValue(lastYearValue)},
          {label:'同比：',value:<ChangeIndicator value={yearOverYear} unit={changeUnit}/>},
        ]}/>
      </div>
    </div>
    {showTargets&&<div className="income-metric-targets">
      {showMonthly&&<TargetComparisonRow label="月度目标" value={monthlyTarget} deviation={monthlyDeviation} unit={changeUnit==='pp'?'%':changeUnit} formula={changeUnit==='pp'?rateTargetDeviationFormula('月度',targetSummary.monthlyActual,targetSummary.monthlyTarget,monthlyDeviation):deviationFormula('月度','当月实际值',targetSummary.monthlyActual,targetSummary.monthlyTarget,monthlyDeviation,changeUnit)}/>}
      {showQuarterly&&<TargetComparisonRow label="季度目标" value={quarterlyTarget} deviation={quarterlyDeviation} unit={changeUnit==='pp'?'%':changeUnit} formula={changeUnit==='pp'?rateTargetDeviationFormula('季度',targetSummary.monthlyActual,targetSummary.quarterlyTarget,quarterlyDeviation):deviationFormula('季度','本季度截至当前账期累计实际值',targetSummary.quarterlyActual,targetSummary.quarterlyTarget,quarterlyDeviation,changeUnit)}/>}
      {showAnnual&&(changeUnit==='pp'
        ?<>
          <TargetValueRow label="年度目标" value={annualTarget}/>
          <TargetValueRow label="当年1月至今累计值" value={yearToDateActual}/>
          <TargetDeviationRow label="年度目标累计偏差" deviation={annualDeviation} unit={changeUnit} formula={deviationFormula('年度','1月至当前账期累计实际利润率',targetSummary.yearToDateActual,targetSummary.annualTarget,annualDeviation,'pp')}/>
        </>
        :<>
          <TargetValueRow label="年度目标" value={annualTarget}/>
          <TargetValueRow label="1月至今累计实际值" value={yearToDateActual}/>
          <TargetValueRow label="年度目标累计占比" value={annualTargetShare===null||!Number.isFinite(annualTargetShare)?'-':`${annualTargetShare.toFixed(2)}%`} formula={annualShareFormula(targetSummary.yearToDateActual,targetSummary.annualTarget,annualTargetShare,changeUnit)}/>
        </>)}
    </div>}
  </article>;
}
