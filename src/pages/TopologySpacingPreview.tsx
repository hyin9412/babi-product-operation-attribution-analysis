import React, { useEffect, useMemo, useRef, useState } from 'react';
import Select from '@tod-m/materials/ve-o/es/Select';
import Checkbox from '@tod-m/materials/ve-o/es/Checkbox';
import Button from '@tod-m/materials/ve-o/es/Button';
import { FormulaCanvas } from './PricingTab';
import { defaultFilters, getRows, targetOptions } from './analysisData';
import { schemeThreeStyle } from './topology-scheme-three';
import { spacingExpanded, spacingModel, spacingScenarios } from './topology-spacing-models';
import './topology-spacing-preview.css';
import { usePreviewFrameHeight } from './usePreviewFrameHeight';

type Box = { left: number; right: number; top: number; bottom: number };
type Dimension = { id: string; title: string; note: string; value: number; displayLabel?: string; axis: 'x' | 'y'; x1: number; y1: number; x2: number; y2: number };
type Measurement = { dimensions: Dimension[]; boxes: Box[]; overall?: Box };
const isOverallDimension = (item: Dimension) => item.id.startsWith('overall-') || item.id.startsWith('viewport-');
const visualStyle = schemeThreeStyle();
const row = getRows(defaultFilters)[0];
const round = (value: number) => Math.round(value * 10) / 10;

function measure(stage: HTMLElement): Measurement {
  const canvas = stage.querySelector('.pricing-formula-flow');
  if (!canvas) return { dimensions: [], boxes: [] };
  const origin = stage.getBoundingClientRect();
  const metric = canvas.querySelector<HTMLElement>('.metric-topology-node');
  if (!metric || !metric.offsetWidth) return { dimensions: [], boxes: [] };
  const scale = metric.getBoundingClientRect().width / metric.offsetWidth;
  if (!scale) return { dimensions: [], boxes: [] };
  const box = (element: Element): Box => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left - origin.left, right: rect.right - origin.left, top: rect.top - origin.top, bottom: rect.bottom - origin.top };
  };
  const visible = (element: Element) => box(element.matches('.calculation-operator-node') ? element.querySelector('svg rect')! : element);
  const union = (items: Box[]): Box => ({
    left: Math.min(...items.map(item => item.left)), right: Math.max(...items.map(item => item.right)),
    top: Math.min(...items.map(item => item.top)), bottom: Math.max(...items.map(item => item.bottom)),
  });
  const dimensions: Dimension[] = [];
  const add = (id: string, title: string, note: string, axis: 'x' | 'y', from: number, to: number, cross: number, measurementScale = scale, displayLabel?: string) => {
    if (to < from - .05 || !Number.isFinite(to - from)) return;
    dimensions.push({ id, title, note, value: round((to - from) / measurementScale), displayLabel, axis,
      x1: axis === 'x' ? from : cross, y1: axis === 'x' ? cross : from,
      x2: axis === 'x' ? to : cross, y2: axis === 'x' ? cross : to });
  };
  const firstRow = canvas.querySelector('.formula-expression-row');
  const cells = firstRow ? [...firstRow.querySelectorAll(':scope > .formula-expression-cell')] : [];
  const operatorIndex = cells.findIndex(cell => cell.classList.contains('is-operator'));
  if (operatorIndex > 0 && cells[operatorIndex + 1]) {
    const left = visible(cells[operatorIndex - 1].firstElementChild!);
    const operator = visible(cells[operatorIndex].firstElementChild!);
    const right = visible(cells[operatorIndex + 1].firstElementChild!);
    add('left-gap', '左节点 → 运算符', '可见边界之间的横向留白；展开后会随子树预留宽度增加。', 'x', left.right, operator.left, operator.top - 16);
    add('right-gap', '运算符 → 右节点', '与左侧独立测量；嵌套容器按外框边界计。', 'x', operator.right, right.left, operator.bottom + 16);
    add('operand-gap', '相邻表达式项之间', '包含运算符占位和两侧留白。普通指标为16 + 32 + 16 = 64px。', 'x', left.right, right.left, Math.max(left.bottom, right.bottom) + 30);
  }
  if (cells.length) {
    const parent = box(metric);
    const children = union(cells.map(cell => visible(cell.firstElementChild!)));
    add('level-gap', '父卡片 → 下层外框', '从父指标卡片底边到直接下级中最高外框的顶边；嵌套内指标可能更靠下。', 'y', parent.bottom, children.top, parent.left - 20);
    const icon = metric.querySelector('.metric-topology-node-toggle img');
    if (icon) {
      const control = box(icon);
      const circleBottom = control.top + (control.bottom - control.top) * 32 / 40;
      add('toggle-extension', '展开圆形向下突出', '仅计算可见圆形，排除SVG透明边和阴影。', 'y', parent.bottom, circleBottom, parent.right + 16);
      add('toggle-gap', '展开圆形 → 下层外框', '区别于父卡片到下层的层间距。', 'y', circleBottom, children.top, parent.right + 38);
    }
  }
  const rows = [...canvas.querySelectorAll<HTMLElement>('.formula-expression-row')];
  const branches = rows.filter(item => item.dataset.formulaLevel === '2').slice(0, 2);
  const boxes = branches.map(branch => {
    const descendants = rows.filter(item => item.dataset.expressionId!.startsWith(branch.dataset.expressionId!));
    return union(descendants.flatMap(item => [...item.querySelectorAll(':scope > .formula-expression-cell')].map(cell => visible(cell.firstElementChild!))));
  });
  if (boxes.length === 2) {
    boxes.sort((a, b) => a.left - b.left);
    add('subtree-gap', '兄弟子树包围盒之间', '兄弟展开子树间距80px；按全部下级节点边界测量，不包含父指标、连线、控制器和阴影。', 'x', boxes[0].right, boxes[1].left, Math.min(Math.max(boxes[0].bottom, boxes[1].bottom) + 24, stage.clientHeight - 34));
  }
  const group = canvas.querySelector<HTMLElement>('.function-topology-node.is-inset,.bracket-expression-node.is-inset');
  if (group) {
    const panel = group.querySelector<HTMLElement>(':scope > .function-topology-node-items,:scope > .function-topology-node-metric,:scope > .bracket-expression-node-items')!;
    const outer = box(group), inner = box(panel);
    const first = visible(panel.firstElementChild!);
    const contentTop = Math.min(...[...panel.children].map(child => visible(child).top));
    add('frame-inset', '外框 → 白色层', '容器左右2px彩色细边；底部同为2px。', 'x', outer.left, inner.left, outer.top - 16);
    add('panel-left', '白色层 → 内容左边', '白色包裹层的左内边距；右侧同为8px。', 'x', inner.left, first.left, inner.top + 10);
    add('panel-top', '白色层 → 内容组顶边', '按最高内容测量白色包裹层的顶部内边距，上下各6px。', 'y', inner.top, contentTop, inner.left + 12);
    if (first.top - contentTop > .1) add('first-item-top', '白色层 → 首项顶边', '常量或运算符居中后的实际位置，区别于内容组的6px顶部内边距。', 'y', inner.top, first.top, inner.left + 38);
  }
  const name = metric.querySelector('.metric-topology-node-name');
  const formula = metric.querySelector('.metric-topology-node-formula-text');
  if (name && formula) {
    const title = box(name), text = box(formula);
    add('title-formula', '指标名称 → 公式文字', '实际文本行框之间的距离，包含标题栏及白色内容层留白。', 'y', title.bottom, text.top, box(metric).right + 58);
  }
  const overall = box(canvas);
  const header = box(canvas.querySelector('.topology-canvas-shell-header')!);
  const viewport = box(canvas.querySelector('.topology-canvas-shell-stage')!);
  add('overall-width', '拓扑图容器宽度', '等于页面内容区宽度，随页面自适应；与画布可视区域宽度一致。', 'x',
    overall.left, overall.right, header.top + 12, 1, '页面内容区宽度');
  add('overall-height', '容器标题行高度', '标题行固定48px，包含底部分隔线；不随节点展开或缩放变化。', 'y',
    header.top, header.bottom, header.right - 64, 1);
  add('viewport-width', '画布可视区域宽度', '等于页面内容区宽度，与拓扑图容器同宽；不随节点缩放变化。', 'x',
    viewport.left, viewport.right, viewport.top + 20, 1, '页面内容区宽度');
  add('viewport-height', '画布可视区域高度', '实际页面容器高度＝屏幕高度−300px；画布再扣除48px标题行，即屏幕高度−348px。示例仅固定预览高度。', 'y',
    viewport.top, viewport.bottom, viewport.left + 64, 1, '屏幕高度 − 348px');
  return {
    dimensions: [...dimensions.filter(isOverallDimension), ...dimensions.filter(item => !isOverallDimension(item))],
    boxes, overall,
  };
}

export default function TopologySpacingPreview() {
  const previewRef = useRef<HTMLElement>(null);
  usePreviewFrameHeight(previewRef, 'topology-spacing-height');
  const [scenario, setScenario] = useState('siblings');
  const [targetCount, setTargetCount] = useState(1);
  const [annotations, setAnnotations] = useState(true);
  const [showBoxes, setShowBoxes] = useState(true);
  const [selected, setSelected] = useState('');
  const tree = useMemo(() => spacingModel(scenario), [scenario]);
  const [expanded, setExpanded] = useState(() => spacingExpanded(tree, scenario));
  const [measurement, setMeasurement] = useState<Measurement>({ dimensions: [], boxes: [] });
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => setExpanded(spacingExpanded(tree, scenario)), [tree, scenario]);
  useEffect(() => {
    const stage = stageRef.current!;
    const canvas = stage.querySelector('.pricing-formula-flow')!;
    let frame = 0, disposed = false;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (disposed) return;
        const next = measure(stage);
        setMeasurement(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
      });
    };
    const observer = new MutationObserver(update);
    observer.observe(canvas, { childList: true, subtree: true, attributes: true, characterData: true });
    const resize = new ResizeObserver(update);
    resize.observe(stage);
    window.addEventListener('resize', update);
    document.fonts.ready.then(update);
    update();
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect(); window.removeEventListener('resize', update); };
  }, [tree, targetCount]);
  const toggle = (id: string) => setExpanded(current => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  return <main className="analysis-page topology-spacing-preview" ref={previewRef}>
    <div className="topology-spacing-toolbar">
      <Select aria-label="间距场景" value={scenario} options={spacingScenarios} onChange={value => { setScenario(value); setSelected(''); }} />
      <Select aria-label="目标行数" value={targetCount} options={[{ value: 0, label: '不显示目标行' }, { value: 1, label: '1行目标值' }, { value: 3, label: '3行目标值' }]} onChange={setTargetCount} />
      <Checkbox checked={annotations} onChange={setAnnotations}>显示间距标注</Checkbox>
      <Checkbox checked={showBoxes} onChange={setShowBoxes}>显示子树包围盒</Checkbox>
      <Button size="small" onClick={() => { setExpanded(new Set([tree.id])); setSelected(''); }}>收起下级</Button>
      <Button size="small" onClick={() => setExpanded(spacingExpanded(tree, 'siblings'))}>全部展开</Button>
    </div>
    <div className="topology-spacing-layout">
      <figure className="topology-spacing-figure">
        <div className="topology-spacing-stage" ref={stageRef}>
          <FormulaCanvas tree={tree} row={row} expanded={expanded} toggle={toggle} onTrend={() => {}} targets={targetOptions.slice(0, targetCount)}
            visualStyle={visualStyle} allowFullscreen={false} minZoom={.15} height="560px" />
          <svg className="topology-spacing-overlay" aria-label="拓扑图间距标注">
            {annotations && measurement.overall && <g className={`topology-spacing-overall-box${selected && !selected.startsWith('overall-') ? ' is-muted' : ''}`} data-topology-box>
              <rect x={measurement.overall.left} y={measurement.overall.top}
                width={measurement.overall.right - measurement.overall.left} height={measurement.overall.bottom - measurement.overall.top} />
            </g>}
            {showBoxes && measurement.boxes.map((item, index) => <g key={index} className="topology-spacing-box" data-subtree-box={index}>
              <rect x={item.left} y={item.top} width={item.right - item.left} height={item.bottom - item.top} rx="4" />
              <text x={item.left + 4} y={item.top - 8}>子树 {index + 1}</text>
            </g>)}
            {annotations && measurement.dimensions.map((item, index) => {
              const active = !selected || selected === item.id;
              const horizontal = item.axis === 'x';
              const midX = (item.x1 + item.x2) / 2, midY = (item.y1 + item.y2) / 2;
              const text = `${index + 1} · ${item.displayLabel ?? `${item.value}px`}`;
              const width = [...text].reduce((total, char) => total + (char.charCodeAt(0) > 255 ? 11 : 6.4), 10);
              const labelX = Math.max(width / 2 + 4, Math.min(midX, (stageRef.current?.clientWidth ?? width) - width / 2 - 4));
              return <g key={item.id} data-dimension={item.id} data-px={item.value} className={active ? 'is-active' : 'is-muted'}>
                <line x1={item.x1} y1={item.y1} x2={item.x2} y2={item.y2} />
                {[{ x: item.x1, y: item.y1 }, { x: item.x2, y: item.y2 }].map((end, i) => <line key={i}
                  x1={end.x - (horizontal ? 0 : 4)} y1={end.y - (horizontal ? 4 : 0)} x2={end.x + (horizontal ? 0 : 4)} y2={end.y + (horizontal ? 4 : 0)} />)}
                <rect x={labelX - width / 2} y={midY - 9} width={width} height="18" rx="4" />
                <text x={labelX} y={midY + 4} textAnchor="middle">{text}</text>
              </g>;
            })}
          </svg>
        </div>
      </figure>
      <aside className="topology-spacing-details" aria-label="拓扑图间距编号说明">
        {[{ title: '拓扑图整体尺寸', overall: true }, { title: '编号与实时尺寸', overall: false }].map(group => <section className="topology-spacing-detail-group" key={group.title}>
          <h3>{group.title}</h3>
          {group.overall && <p>点击一条说明，突出对应标注；再次点击恢复全部。</p>}
          <ol>
          {measurement.dimensions.map((item, index) => isOverallDimension(item) === group.overall && <li key={item.id}>
            <button type="button" className={selected === item.id ? 'is-selected' : ''} aria-pressed={selected === item.id} onClick={() => setSelected(current => current === item.id ? '' : item.id)}>
              <span className="topology-spacing-number">{index + 1}</span>
              <span><strong>{item.title}</strong><span className="topology-spacing-value" data-value-for={item.id}>{item.displayLabel ?? `${item.value}px`}</span><small>{item.note}</small></span>
            </button>
          </li>)}
          </ol>
        </section>)}
        <p className="topology-spacing-footnote">节点按卡片或可见圆形边界测量；子树按所有下级节点的联合边界测量。展开按钮和阴影单独说明，不混入子树间距。</p>
      </aside>
    </div>
  </main>;
}
