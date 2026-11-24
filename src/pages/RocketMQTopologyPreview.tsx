import React, { useMemo, useState } from 'react';
import { Button } from '@byted-babi/babi-design';
import { FormulaCanvas, type FormulaNode } from './PricingTab';
import { defaultFilters, getRows } from './analysisData';
import { AnalysisChart, type ChartValue } from './analysisUI';
import { buildRocketMQTree, flattenRocketMQTree, rocketmqModelSource } from './rocketmq-model-259';
import { schemeThreeStyle } from './topology-scheme-three';

const previewStyle = schemeThreeStyle();

export default function RocketMQTopologyPreview({ targets, height }: { targets: string[]; height?: string }) {
  const tree = useMemo(buildRocketMQTree, []);
  const [expanded, setExpanded] = useState(() => new Set([tree.id]));
  const [selectedNode, setSelectedNode] = useState<FormulaNode | null>(null);
  const nodes = useMemo(() => flattenRocketMQTree(tree), [tree]);
  // Targets are supplied on every model node. The shared renderer does not use
  // the snapshot fallback to invent any RocketMQ model relationships.
  const row = useMemo(() => getRows(defaultFilters)[0], []);
  const toggle = (id: string) => setExpanded(current => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
  const showTrend = (id: string) => {
    setSelectedNode(nodes.find(node => node.id === id) || null);
    requestAnimationFrame(() => document.getElementById('rocketmq-metric-trend')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const values: ChartValue[] = selectedNode ? Array.from({ length: 9 }, (_, index) => {
    const factor = .82 + index * .0225;
    const scale = selectedNode.type === 'ratio' ? 100 : 1;
    return [
      { x: `2026-${String(index + 1).padStart(2, '0')}`, series: '实际值', value: selectedNode.value! * factor * scale },
      ...(targets.includes('月度目标值') ? [{ x: `2026-${String(index + 1).padStart(2, '0')}`, series: '月度目标', value: selectedNode.targets!.month! * factor * scale }] : []),
      ...(targets.includes('季度目标值') ? [{ x: `2026-${String(index + 1).padStart(2, '0')}`, series: '季度目标', value: selectedNode.targets!.quarter! * factor * scale }] : []),
      ...(targets.includes('年度目标值') ? [{ x: `2026-${String(index + 1).padStart(2, '0')}`, series: '年度目标', value: selectedNode.targets!.annual! * factor * scale }] : []),
    ];
  }).flat() : [];

  return <>
    <div className="topology-guide-model-source">
      <span>RocketMQ 商品定价模型 · v1</span>
      <a href={rocketmqModelSource.url} target="_blank" rel="noreferrer">查看原模型</a>
      <span>实际值、目标值和单位为示例；偏差按示例值计算。</span>
    </div>
    <FormulaCanvas tree={tree} row={row} expanded={expanded} toggle={toggle} onTrend={showTrend} targets={targets} visualStyle={previewStyle} height={height} />
    {selectedNode && <section id="rocketmq-metric-trend" className="pricing-metric-panel">
      <div className="analysis-toolbar">
        <h3>指标月趋势（示例）</h3>
        <Button size="small" onClick={() => setSelectedNode(null)}>收起趋势</Button>
      </div>
      <AnalysisChart
        title={selectedNode.title}
        values={values}
        dashedSeries={['月度目标', '季度目标', '年度目标']}
        dottedSeries={['年度目标']}
        percent={selectedNode.type === 'ratio'}
        unit={selectedNode.unit}
        height={270}
      />
    </section>}
  </>;
}
