import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Alert, Button, Message, Tag } from '@byted-babi/babi-design';
import { IconDown, IconRight } from '@arco-design/iconbox-react-ve-o-design';
import '@arco-design/theme-ve-o-design/css/arco.css';
import '../app/styles/global.less';
import '../style.css';
import './analysis.css';
import { AnalysisChart, AnalysisSelect, Field, FilterSummary, MultiFilter, Section, type ChartValue } from './analysisUI';
import Popover from './AnalysisPopover';
import AnalysisMonthPicker from './AnalysisMonthPicker';
import AnalysisFilterGrid from './AnalysisFilterGrid';
import { getMultiFilterSummary, type FilterSummaryItem } from './analysisFilterSummary';
import { type AnalysisFilters, BYTEGRAPH, TOS, areaNames, areaRegions, defaultFilters, months, normalizeAnalysisFilters, products, targetOptions, unitCategories, unitOptions } from './analysisData';
import './filter-guide-preview.css';

const initial: AnalysisFilters = { ...defaultFilters, product: BYTEGRAPH };
// Illustrative income data; target-series visibility follows IncomeTab's two trend scopes.
const exampleIncome = [82000, 97000, 90000, 118000, 112000, 134000];
const exampleMonthTargets = [92000, 94000, 103000, 106000, 121000, 126000];
const exampleQuarterTarget = 360000;
const exampleAnnualTarget = 1440000;
const scenarios = [
  ['normal', '修改后查询'],
  ['areas', '大区未选择'],
  ['regions', '收入售卖区域未选择'],
  ['categories', '计费类别未选择'],
  ['units', '计费单元未选择'],
  ['tos', 'TOS 不适用'],
  ['loading', '查询加载样式'],
] as const;

function FilterGuidePreview() {
  const [draft, setDraft] = useState<AnalysisFilters>(initial);
  const [applied, setApplied] = useState<AnalysisFilters>(initial);
  const [scenario, setScenario] = useState('normal');
  const [expanded, setExpanded] = useState(true);
  const [attempted, setAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const dirty = JSON.stringify(draft) !== JSON.stringify(applied);
  const areas = Object.keys(areaNames);
  const categories = Object.keys(unitCategories(draft.product));
  const units = unitOptions(draft.product, draft.categories);
  const regions = (draft.areas ?? areas).flatMap(area => areaRegions[area] ?? []);
  const update = (key: keyof AnalysisFilters, value: string | string[]) => {
    setAttempted(false);
    setDraft(current => {
      let next = { ...current, [key]: value };
      if (key === 'product') next = { ...next, areas: null, regions: null, categories: null, units: null };
      if (key === 'categories') next = { ...next, units: null, areas: null, regions: null };
      if (key === 'units') next = { ...next, areas: null, regions: null };
      if (key === 'areas') next.regions = Array.isArray(value) && value.length === 0 ? [] : null;
      return normalizeAnalysisFilters(next);
    });
  };
  const selectScenario = (next: string) => {
    window.clearTimeout(timer.current);
    setScenario(next);
    setApplied(initial);
    setAttempted(false);
    setExpanded(true);
    const pending = { ...initial, month: months[1] };
    if (next === 'areas' || next === 'regions' || next === 'categories' || next === 'units') {
      pending[next] = [];
      if (next === 'areas') pending.regions = [];
    }
    if (next === 'tos') pending.product = TOS;
    setDraft(normalizeAnalysisFilters(pending));
    setLoading(next === 'loading');
  };
  const query = () => {
    if (!dirty || loading) return;
    setAttempted(true);
    const required: [keyof AnalysisFilters, string, string[]?][] = [
      ['month', '账期'], ['product', '商品名称'], ['areas', '大区', areas],
      ['categories', '收入计费单元类别', categories], ['units', '收入计费单元', units],
    ];
    if (draft.product !== TOS) required.push(['regions', '收入售卖区域', regions]);
    const missing = required.filter(([key, , options]) => {
      const value = draft[key];
      return Array.isArray(value) ? value.length === 0 : value === null ? options?.length === 0 : value === '';
    });
    if (missing.length) {
      Message.error({ content: `请选择必填项：${missing.map(([, label]) => label).join('、')}` });
      return;
    }
    const snapshot = normalizeAnalysisFilters({ ...draft });
    setLoading(true);
    timer.current = window.setTimeout(() => {
      setApplied(snapshot);
      setLoading(false);
      setAttempted(false);
      Message.success({ content: '数据已更新' });
    }, 2000);
  };
  const summaryRegionOptions = (applied.areas ?? areas).flatMap(area => areaRegions[area] ?? []);
  const summary: FilterSummaryItem[] = [
    ['商品名称', applied.product], ['账期', applied.month],
    getMultiFilterSummary('收入计费单元类别', applied.categories, Object.keys(unitCategories(applied.product))),
    getMultiFilterSummary('收入计费单元', applied.units, unitOptions(applied.product, applied.categories)),
    getMultiFilterSummary('大区', applied.areas, areas),
    applied.product === TOS ? ['收入售卖区域', '不适用'] : getMultiFilterSummary('收入售卖区域', applied.regions, summaryRegionOptions),
    getMultiFilterSummary('目标值对比', applied.targets, targetOptions, '不对比'),
  ];
  const multi = (label: string, key: 'areas' | 'regions' | 'categories' | 'units' | 'targets', options: string[]) =>
    <Field label={label} required={key !== 'targets'}><MultiFilter value={draft[key]} options={options} onChange={value => update(key, value)}
      requiredLabel={key === 'areas' || key === 'regions' ? label : undefined}
      showValidation={attempted} allowClear={key !== 'areas' && key !== 'regions'} /></Field>;
  const regionDisabled = draft.product === TOS || draft.areas?.length === 0;
  const monthlyTarget = applied.targets.includes('月度目标值');
  const quarterlyTarget = applied.targets.includes('季度目标值');
  const annualTarget = applied.targets.includes('年度目标值');
  const targetLines = [
    ...(monthlyTarget ? ['月度目标'] : []),
    ...(quarterlyTarget ? ['季度目标'] : []),
    ...(annualTarget ? ['年度目标'] : []),
  ];
  const exampleTrend = (includeAnnual: boolean): ChartValue[] => exampleIncome.flatMap((actual, index) => [
    { x: `${index + 1}月`, series: '实际值', value: actual },
    ...(monthlyTarget ? [{ x: `${index + 1}月`, series: '月度目标', value: exampleMonthTargets[index] }] : []),
    ...(quarterlyTarget ? [{ x: `${index + 1}月`, series: '季度目标', value: exampleQuarterTarget / 3 }] : []),
    ...(includeAnnual && annualTarget ? [{ x: `${index + 1}月`, series: '年度目标', value: exampleAnnualTarget }] : []),
  ]);
  const exampleAmount = (value: number) => value.toLocaleString('zh-CN', { maximumFractionDigits:2 });
  const actual = exampleIncome[5];
  const accumulated = exampleIncome.reduce((total, value) => total + value, 0);
  const exampleDeviation = (target: number) => `${((actual - target) / Math.abs(target) * 100).toFixed(2)}%`;
  return <main className={`analysis-page filter-guide-live-preview${loading ? ' content-loading' : ''}`} aria-busy={loading}>
    <div className="filter-guide-controls" aria-label="演示场景">
      {scenarios.map(([key, label]) => <Button key={key} type={scenario === key ? 'primary' : 'secondary'} size="small"
        onClick={() => selectScenario(key)}>{label}</Button>)}
    </div>
    <p className="filter-guide-caption">以成本定价为例。修改筛选条件后点击「查询」，观察下方已查询条件；查询演示加载 2 秒。「查询加载样式」保持加载态，可切换其他场景退出。</p>
    <div className="filter-panel">
      <div className="filter-heading">
        <Button type="text" size="mini" shape="square" className="filter-toggle" icon={expanded ? <IconDown width="16" height="16" /> : <IconRight width="16" height="16" />}
          aria-label={expanded ? '收起筛选' : '展开筛选'} aria-expanded={expanded} onClick={() => setExpanded(!expanded)} />
        <h2 style={{ fontSize: 14 }}>全局筛选</h2>
        <div className="filter-caliber">{['日正式+月正式', '人民币', '纯资源'].map(text => <Tag key={text} size="small" bordered className="filter-caliber-tag">{text}</Tag>)}</div>
      </div>
      {expanded ? <AnalysisFilterGrid className="pricing-filters">
        <Field label="商品名称" required><AnalysisSelect aria-label="商品名称" showSearch value={draft.product} options={products} onChange={value => update('product', value)} /></Field>
        <Field label="账期" required><AnalysisMonthPicker value={draft.month} onChange={value => update('month', value)} /></Field>
        {multi('收入计费单元类别', 'categories', categories)}
        {multi('收入计费单元', 'units', units)}
        {multi('大区', 'areas', areas)}
        {regionDisabled ? <Field label="收入售卖区域" required><Popover content={draft.product === TOS ? '不适用' : '请先选择售卖大区'}>
          <span className="filter-disabled-popover-trigger"><AnalysisSelect disabled placeholder="请选择" /></span>
        </Popover></Field> : multi('收入售卖区域', 'regions', regions)}
        {multi('目标值对比', 'targets', targetOptions)}
        <div className="filter-query-slot"><Button type="primary" disabled={!dirty || loading} loading={loading} className={dirty && !loading ? 'pending-query' : ''} onClick={query}>查询</Button></div>
      </AnalysisFilterGrid> : <FilterSummary items={summary} />}
    </div>
    {dirty && <Alert className="pending-warning" type="warning" content="筛选条件已变更，当前仍展示上次查询结果，请点击“查询”刷新数据" />}
    <div className="filter-guide-results" aria-live="polite">
      <Section title="已查询条件">
        <FilterSummary items={summary} />
        <p className="filter-guide-caption">这里和收起态摘要均展示上次查询条件；查询完成后一起更新。</p>
      </Section>
      <Section title="下方数据明细">
        <div className="filter-guide-table-wrap"><table className="filter-guide-table">
          <thead><tr><th>账期</th><th>商品名称</th><th>大区</th><th>收入售卖区域</th><th>查询状态</th></tr></thead>
          <tbody><tr><td>{applied.month}</td><td>{applied.product}</td><td>{getMultiFilterSummary('大区', applied.areas, areas)[1]}</td><td>{applied.product === TOS ? '不适用' : getMultiFilterSummary('收入售卖区域', applied.regions, summaryRegionOptions)[1]}</td><td>已查询</td></tr></tbody>
        </table></div>
      </Section>
      <Section title="目标选择对照示例">
        <p className="filter-guide-caption">收入示例固定展示 1–6 月数据，表格使用 6 月实际值，仅演示目标选择的影响。修改上方「目标值对比」后点击「查询」；下面的目标列和目标线均在查询完成后更新。</p>
        <div className="filter-guide-table-wrap"><table className="filter-guide-table" data-testid="target-example-table">
          <thead><tr><th>指标</th><th>实际值</th>
            {monthlyTarget && <><th>月度目标</th><th>月度偏差</th></>}
            {quarterlyTarget && <><th>季度目标</th><th>季度偏差</th></>}
            {annualTarget && <><th>年度目标</th><th>1月至今累计实际值</th><th>年度目标累积占比</th></>}
          </tr></thead>
          <tbody><tr><td>收入（元）</td><td>{exampleAmount(actual)}</td>
            {monthlyTarget && <><td>{exampleAmount(exampleMonthTargets[5])}</td><td>{exampleDeviation(exampleMonthTargets[5])}</td></>}
            {quarterlyTarget && <><td>{exampleAmount(exampleQuarterTarget)}</td><td>{exampleDeviation(exampleQuarterTarget)}</td></>}
            {annualTarget && <><td>{exampleAmount(exampleAnnualTarget)}</td><td>{exampleAmount(accumulated)}</td><td>{(accumulated / exampleAnnualTarget * 100).toFixed(2)}%</td></>}
          </tr></tbody>
        </table></div>
        <div data-testid="target-product-trend">
          <AnalysisChart title="商品收支月趋势（收入示例）" values={exampleTrend(false)} dashedSeries={targetLines} unit="人民币" height={240}
            seriesColorIndexes={{ 实际值:0, 月度目标:1, 季度目标:2 }} />
          <p className="filter-guide-caption">支持月度、季度目标线；选择年度目标也不会增加年度线。</p>
        </div>
        <div data-testid="target-category-trend">
          <AnalysisChart title="类别整体月趋势（单类别收入示例）" values={exampleTrend(true)} dashedSeries={targetLines} unit="人民币" height={240}
            seriesColorIndexes={{ 实际值:0, 月度目标:1, 季度目标:2, 年度目标:3 }} />
          <p className="filter-guide-caption">支持月度、季度、年度目标线；年度线使用整年金额目标，不按月摊分。</p>
        </div>
      </Section>
    </div>
  </main>;
}

createRoot(document.getElementById('root')!).render(<FilterGuidePreview />);
