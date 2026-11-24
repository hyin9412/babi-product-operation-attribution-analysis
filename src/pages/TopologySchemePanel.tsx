import React, { useEffect, useState } from 'react';
import Button from '@tod-m/materials/ve-o/es/Button';
import Checkbox from '@tod-m/materials/ve-o/es/Checkbox';
import Message from '@tod-m/materials/ve-o/es/Message';
import { FormulaCanvas, type FormulaNode } from './PricingTab';
import type { AnalysisRow } from './analysisData';
import type { TopologyCanvasViewport } from '../app/component/topology-canvas-shell';
import { styleCss, type PlaygroundStyle } from './topology-playground-style';
import type { SchemeLibrary, TopologyScheme } from './topology-playground-schemes';

type Props = {
  library: SchemeLibrary;
  draft: PlaygroundStyle;
  tree: FormulaNode;
  row: AnalysisRow;
  targets: string[];
  expanded: Set<string>;
  toggle: (id: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onSelect: (ids: string[]) => void;
  onLoad: (scheme: TopologyScheme) => void;
  onRename: (scheme: TopologyScheme) => void;
  onDelete: (scheme: TopologyScheme) => void;
};
export default function TopologySchemePanel({ library, draft, tree, row, targets, expanded, toggle, onExpandAll, onCollapseAll, onSelect, onLoad, onRename, onDelete }: Props) {
  const [viewport, setViewport] = useState<TopologyCanvasViewport>();
  const options = [
    { id: 'original', name: '原始样式', style: null },
    { id: 'draft', name: '当前调整', style: draft },
    ...library.schemes,
  ];
  const selected = options.filter(option => library.comparisonIds.includes(option.id));
  // Equal-sized previews share a viewport, including when a model or layout changes.
  useEffect(() => setViewport(undefined), [tree, targets.length, selected.length]);
  return <section className="playground-scheme-section" aria-label="方案保存与平铺对比">
    <div className="playground-scheme-heading">
      <h3 className="playground-section-title">方案与平铺对比</h3>
      <span>勾选要对比的样式 · 缩放、平移和节点展开联动</span>
    </div>
    <div className="playground-comparison-options" aria-label="选择对比方案">
      {options.map(option => <Checkbox key={option.id} checked={library.comparisonIds.includes(option.id)}
        onChange={checked => onSelect(checked ? [...library.comparisonIds, option.id] : library.comparisonIds.filter(id => id !== option.id))}>
        {option.name}
      </Checkbox>)}
      <span className="playground-comparison-count">已选 {selected.length} 项</span>
      <Button size="small" aria-label="对比图全部展开" disabled={!selected.length} onClick={onExpandAll}>全部展开</Button>
      <Button size="small" aria-label="对比图收起下层" disabled={!selected.length} onClick={onCollapseAll}>收起下层</Button>
    </div>
    {library.schemes.length ? <div className="playground-scheme-list">
      {library.schemes.map(scheme => <div className="playground-scheme-row" key={scheme.id}>
        <span className="playground-scheme-color" style={{ background: scheme.style.canvas.background, borderColor: scheme.style.metric.border }} />
        <strong title={scheme.name}>{scheme.name}</strong>
        <span className="playground-scheme-date">保存于 {new Date(scheme.updatedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
        <Button size="small" type="text" aria-label={`加载${scheme.name}`} onClick={() => onLoad(scheme)}>加载调整</Button>
        <Button size="small" type="text" aria-label={`重命名${scheme.name}`} onClick={() => onRename(scheme)}>重命名</Button>
        <Button size="small" type="text" aria-label={`删除${scheme.name}`} onClick={() => onDelete(scheme)}>删除</Button>
      </div>)}
    </div> : <p className="playground-scheme-empty">还没有保存方案。调好样式后，点击页头“保存方案”，即可命名并加入对比。</p>}
    {selected.length ? <div className="playground-comparison-scroll">
      <div className="playground-comparison-track" style={{ '--comparison-count': selected.length } as React.CSSProperties}>
        {selected.map((option, index) => {
          const previewId = `topology-comparison-${index}`;
          return <section className="playground-comparison-card" key={option.id} aria-label={`对比：${option.name}`} data-scheme-id={option.id}>
            <header className="playground-comparison-title"><strong title={option.name}>{option.name}</strong><span>{option.id === 'original' ? '原生样式' : option.id === 'draft' ? '实时调整' : '已保存快照'}</span></header>
            <div className="analysis-page topology-playground-preview" id={previewId}>
              {option.style && <style>{styleCss(option.style, `#${previewId}`)}</style>}
              <FormulaCanvas tree={tree} row={row} targets={targets} expanded={expanded} toggle={toggle}
                metricNodeWidth={option.style?.metric.width}
                metricFormulaGap={option.style?.metric.formulaGap}
                groupStyle={option.style ? { function: option.style.function.appearance, expression: option.style.expression.appearance, metric: option.style.metric.appearance } : undefined}
                onTrend={() => Message.info('对比区用于观察样式，趋势数据请在原预览中查看。')}
                height="420px" minZoom={.1} allowFullscreen={false} viewport={viewport} onViewportChange={setViewport} />
            </div>
          </section>;
        })}
      </div>
    </div> : <div className="playground-comparison-empty">勾选“原始样式”或已保存方案，在这里平铺对比。</div>}
    <p className="playground-example-note">点击指标卡片下方箭头展开或收起，各方案同步；也可使用上方按钮批量操作。方案保存在当前浏览器；超出宽度时可横向滚动查看。</p>
  </section>;
}
