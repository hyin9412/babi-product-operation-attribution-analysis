import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@arco-design/theme-ve-o-design/css/arco.css';
import '../app/styles/global.less';
import '../style.css';
import './analysis.css';
import { AnalysisChart, type ChartValue } from './analysisUI';
import { chartSeriesName } from './analysisData';
import { TrendRangeControl, rankedTrendRows } from './TableTrendView';
import './chart-guide-preview.css';

const items = [
  { dimensions: ['bytegraph.cpu', 'cn', 'cn-north-1'], actual: [82000, 97000, 90000, 118000, 112000, 134000], target: [92000, 94000, 103000, 106000, 121000, 126000] },
  { dimensions: ['bytegraph.mem', 'cn', 'cn-north-1'], actual: [56000, 61000, 69000, 66000, 79000, 84000], target: [62000, 64000, 66000, 73000, 76000, 81000] },
  { dimensions: ['bytegraph.storage', 'cn', 'cn-north-1'], actual: [25000, 29000, 31000, 38000, 36000, 43000], target: [28000, 30000, 35000, 34000, 40000, 41000] },
];
const structureItems = [
  ...items,
  { dimensions: ['bytegraph.network', 'cn', 'cn-north-1'], actual: [17000, 19000, 23000, 24000, 28000, 32000], target: [18000, 20000, 22000, 26000, 29000, 31000] },
  { dimensions: ['bytegraph.backup', 'cn', 'cn-north-1'], actual: [12000, 14000, 15000, 18000, 20000, 23000], target: [13000, 14000, 16000, 17000, 21000, 22000] },
  { dimensions: ['bytegraph.io', 'cn', 'cn-north-1'], actual: [6000, 8000, 9000, 11000, 13000, 16000], target: [7000, 8000, 10000, 12000, 14000, 15000] },
];

const annotationTargets = [
  { number: 1, selector: '.analysis-chart-title-row h3', placement: 'title' },
  { number: 2, selector: '.analysis-trend-range-input', placement: 'above' },
  { number: 3, selector: '.analysis-chart-fullscreen-button', placement: 'above' },
  { number: 4, selector: '.chart-unit', placement: 'left' },
  { number: 5, selector: '.analysis-chart-slot', placement: 'inside' },
  { number: 6, selector: '.legend-item:not([hidden]) .legend-toggle', placement: 'left' },
  { number: 7, selector: '.legend-item:not([hidden]) .legend-isolate', placement: 'above' },
  { number: 8, selector: '.legend-pager', placement: 'right' },
];

function AnnotatedChart({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [markers, setMarkers] = useState<{ number: number; x: number; y: number; tx: number; ty: number }[]>([]);
  useEffect(() => {
    const root = rootRef.current;
    const anchor = root?.querySelector('.analysis-chart-anchor');
    if (!root || !anchor) return;
    const measure = () => {
      const bounds = root.getBoundingClientRect();
      const next = annotationTargets.flatMap(({ number, selector, placement }) => {
        const target = anchor.querySelector(selector);
        if (!target) return [];
        const rect = target.getBoundingClientRect();
        let tx = rect.left - bounds.left, ty = rect.top - bounds.top + rect.height / 2;
        let x = tx - 18, y = ty;
        if (placement === 'above' || placement === 'title') {
          tx += placement === 'title' ? 8 : rect.width / 2; ty = rect.top - bounds.top;
          x = tx; y = ty - 18;
        } else if (placement === 'right') {
          tx += rect.width; x = tx + 18;
        } else if (placement === 'inside') {
          tx += 26; ty = rect.top - bounds.top + rect.height / 2;
          x = tx; y = ty;
        }
        return [{ number, x, y, tx, ty }];
      });
      setMarkers(current => JSON.stringify(current) === JSON.stringify(next) ? current : next);
    };
    const resize = new ResizeObserver(measure);
    resize.observe(root);
    resize.observe(anchor);
    const mutation = new MutationObserver(measure);
    mutation.observe(anchor, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    measure();
    return () => { resize.disconnect(); mutation.disconnect(); };
  }, []);
  return <div className="chart-structure-preview" ref={rootRef}>
    {children}
    <svg className="chart-annotation-lines" aria-hidden="true">
      {markers.map(marker => <line key={marker.number} x1={marker.x} y1={marker.y} x2={marker.tx} y2={marker.ty} />)}
    </svg>
    {markers.map(marker => <span key={marker.number} className="chart-annotation-number"
      data-annotation={marker.number} style={{ left: marker.x, top: marker.y }}
      aria-label={`注释 ${marker.number}`}>{marker.number}</span>)}
  </div>;
}

function ChartGuidePreview() {
  const example = new URLSearchParams(window.location.search).get('example') ?? 'single';
  const structure = example === 'structure' || example === 'structure-cost';
  const cost = example === 'structure-cost';
  const orderExample = example.startsWith('order-');
  const price = example === 'order-price';
  const [range, setRange] = useState<number | 'all'>(example === 'order-multiple' || price ? 2 : orderExample ? 1 : 5);
  const empty = example === 'empty';
  const multiple = example === 'multiple' || structure || example === 'order-multiple' || price;
  const candidates = (structure ? structureItems : multiple ? items : items.slice(0, 1)).map(item => ({
    ...item, id: item.dimensions.join('|'),
  }));
  const selected = rankedTrendRows(candidates, range, item => item.actual[item.actual.length - 1]);
  const values: ChartValue[] = [];
  const dashedSeries: string[] = [];
  const percentSeries: string[] = [];
  const seriesColorIndexes: Record<string, number> = {};
  if (!empty) selected.forEach((item, itemIndex) => {
    const metrics = price ? ['测算单价', '目标单价', '偏差幅度']
      : orderExample ? ['实际值', '月度目标', '季度目标', ...(!multiple ? ['年度目标'] : [])]
      : ['实际值', '月度目标值'];
    metrics.forEach((metric, metricIndex) => {
      const series = chartSeriesName(item.dimensions, metric);
      seriesColorIndexes[series] = multiple ? itemIndex : metricIndex;
      if (metric !== '实际值' && metric !== '测算单价') dashedSeries.push(series);
      if (metric === '偏差幅度') percentSeries.push(series);
      const points = price
        ? item.actual.map((actual, index) => {
          const actualPrice = actual / 100000;
          const targetPrice = item.target[index] / 100000;
          return metric === '测算单价' ? actualPrice : metric === '目标单价' ? targetPrice
            : (actualPrice - targetPrice) / targetPrice * 100;
        })
        : metricIndex === 0 ? item.actual : item.target.map(value => value * (1 + (metricIndex - 1) * 0.05));
      points.forEach((value, monthIndex) => {
        values.push({ x: `${monthIndex + 1}月`, series, value });
      });
    });
  });
  const title = price ? '单价月趋势' : cost ? '成本合计月趋势' : structure ? '收入月趋势' : empty ? '季度目标偏差趋势' : multiple ? '多计费项收入月趋势' : '单计费项收入月趋势';
  const chart = <AnalysisChart title={title} unit="人民币" values={values}
      titleExtra={!empty && <TrendRangeControl range={range} rankingLabel={cost ? '成本合计' : '实际值'} onChange={setRange} />}
      dashedSeries={dashedSeries} percentSeries={percentSeries} seriesColorIndexes={seriesColorIndexes}
      legendExclude legendIsolate />;
  return <main className="analysis-page chart-guide-live-preview">
    {structure ? <AnnotatedChart>{chart}</AnnotatedChart> : chart}
  </main>;
}

createRoot(document.getElementById('root')!).render(<ChartGuidePreview />);
