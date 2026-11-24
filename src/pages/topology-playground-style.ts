import { isColorValue } from './topology-color-tokens';
import functionIcon from '../app/static/icon/function-node.svg';
import expressionIcon from '../app/static/icon/bracket-expression.svg';
import expressionDotsIcon from '../app/static/icon/bracket-expression-dots.svg';
import expandArrowIcon from '../app/static/icon/下级节点_展开箭头.svg';
import collapseArrowIcon from '../app/static/icon/下级节点_收起箭头.svg';
import type { GroupAppearance } from './formula-group-layout';

export const fonts = [
  { value: 'system', label: '系统字体 · 苹方 / 微软雅黑' },
  { value: 'arial', label: 'Arial' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'serif', label: '宋体 / 衬线' },
  { value: 'mono', label: '等宽字体' },
];
const fontFamilies: Record<string, string> = {
  system: '"PingFang SC","Microsoft YaHei",Arial,sans-serif',
  arial: 'Arial,"PingFang SC",sans-serif',
  roboto: 'Roboto,Arial,"PingFang SC",sans-serif',
  serif: '"Songti SC",SimSun,serif',
  mono: 'Menlo,Consolas,"PingFang SC",monospace',
};
export type TextStyle = { size: number; color: string; font: string; weight: number };
export type CardStyle = { border: string; background: string; radius: number; line: string; shadow: number; text: TextStyle; titleBackground: string };
export type PlaygroundStyle = {
  canvas: { background: string; grid: string; gridColor: string; gridGap: number; gridSize: number; edge: string; edgeWidth: number; edgeDashed: boolean };
  metric: CardStyle & { appearance: GroupAppearance; width: number; showStatusTag: boolean; dividerInset: number; formulaGap: number; formula: TextStyle; value: TextStyle; unit: TextStyle; target: TextStyle; targetValue: TextStyle; positive: string; negative: string; divider: string };
  function: CardStyle & { metricBackground: string; appearance: GroupAppearance };
  expression: CardStyle & { appearance: GroupAppearance; icon: 'original' | 'dots' };
  constant: CardStyle;
  operator: CardStyle & { customBackground: boolean };
};
const text = (size: number, color: string, weight = 400, font = 'system'): TextStyle => ({ size, color, weight, font });
const card = (border: string, color: string, titleBackground = '#ffffff', radius = 12): CardStyle => ({
  border, background: '#ffffff', radius, line: 'solid', shadow: 0, text: text(12, color, 500), titleBackground,
});
export const defaultStyle: PlaygroundStyle = {
  canvas: { background: '#fcfdfe', grid: 'none', gridColor: '#d0d9e5', gridGap: 24, gridSize: 1, edge: '#d0d9e5', edgeWidth: 2, edgeDashed: false },
  metric: { ...card('#dde2e9', '#0c0d0e'), appearance: 'classic', width: 300, showStatusTag: false, dividerInset: 0, formulaGap: 10, text: text(13, '#0c0d0e', 500), formula: text(12, '#42464e'), value: text(13, '#0c0d0e', 500, 'roboto'), unit: text(13, '#0c0d0e'), target: text(12, '#737a87'), targetValue: text(12, '#737a87'), positive: '#00a32b', negative: '#ee3f38', divider: '#eaedf1' },
  function: { ...card('#eaedf1', '#6e4c9f', '#f2eafb'), metricBackground: '#ffffff', line: 'dashed', appearance: 'classic' },
  expression: { ...card('#eaedf1', '#42464e', '#eceded'), line: 'dashed', appearance: 'classic', icon: 'original' },
  constant: { ...card('#dde2e9', '#0c0d0e', '#ffffff', 8), text: text(13, '#0c0d0e', 500) },
  operator: { ...card('#dde2e9', '#737a87', '#ffffff', 16), customBackground: false, text: text(18, '#737a87', 500) },
};
export function cloneStyle(style: PlaygroundStyle): PlaygroundStyle { return JSON.parse(JSON.stringify(style)); }
export function presetStyle(name: string) {
  const style = cloneStyle(defaultStyle);
  if (name === 'original') return style;
  style.canvas.grid = 'dots';
  if (name === 'blue') {
    style.canvas.background = '#f5f8ff';
    style.canvas.gridColor = '#c9d6ed';
    style.canvas.edge = '#9aafd5';
    style.metric.border = '#b9cef1';
    style.metric.text.color = '#244876';
    style.function.border = '#c5b2e0';
    style.function.background = '#faf7ff';
    style.expression.border = '#b6cde5';
    style.expression.background = '#f4f9ff';
    style.expression.titleBackground = '#e0edff';
    style.expression.text.color = '#345e91';
  } else if (name === 'warm') {
    style.canvas.background = '#faf8f4';
    style.canvas.gridColor = '#ddd5c7';
    style.canvas.edge = '#b9ad9c';
    style.metric.border = '#ded4c6';
    style.metric.background = '#fffdfa';
    style.metric.text.color = '#534739';
    style.function.border = '#ccb9a3';
    style.function.background = '#fffaf1';
    style.function.titleBackground = '#f2e5cf';
    style.function.text.color = '#80603a';
    style.expression.background = '#f5f6ef';
    style.expression.border = '#c5ccb0';
    style.expression.titleBackground = '#e6ebd6';
    style.expression.text.color = '#5a6946';
  } else if (name === 'dark') {
    style.canvas.background = '#171c28';
    style.canvas.gridColor = '#323d51';
    style.canvas.edge = '#60718e';
    for (const key of ['metric', 'function', 'expression', 'constant', 'operator'] as const) {
      style[key].background = '#242c3c';
      style[key].border = '#475570';
      style[key].text.color = '#e1e8f4';
    }
    style.metric.formula.color = '#aebbd0';
    style.metric.value.color = '#f3f6ff';
    style.metric.unit.color = '#d4deee';
    style.metric.target.color = '#99aac2';
    style.metric.divider = '#3c4860';
    style.metric.positive = '#56cf94';
    style.metric.negative = '#ff8383';
    style.function.background = '#2c2840';
    style.function.titleBackground = '#494066';
    style.function.text.color = '#d7bfff';
    style.expression.titleBackground = '#34475f';
    style.expression.text.color = '#bad7ff';
  }
  style.metric.shadow = name === 'dark' ? 0 : 8;
  style.function.metricBackground = style.function.background;
  return style;
}

// Validate against the schema; never interpolate unchecked import values into CSS.
export function parseStyle(input: unknown): PlaygroundStyle {
  const visit = (value: unknown, template: unknown, path: string): unknown => {
    if (path.endsWith('.appearance') && value === undefined) return 'classic';
    if (path === 'expression.icon' && value === undefined) return 'original';
    if (path === 'metric.showStatusTag' && value === undefined) return false;
    if (path === 'metric.dividerInset' && value === undefined) return 0;
    if (path === 'metric.formulaGap' && value === undefined) return 10;
    if (path === 'metric.width' && value === undefined) return 300;
    if (path === 'operator.customBackground' && value === undefined) return false;
    if (path === 'metric.targetValue' && value === undefined) return visit((input as PlaygroundStyle).metric.target, template, path);
    if (path === 'function.metricBackground' && value === undefined) return visit((input as PlaygroundStyle).function.background, template, path);
    if (template && typeof template === 'object') {
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`缺少配置：${path || '根节点'}`);
      return Object.fromEntries(Object.entries(template).map(([key, child]) => [key, visit((value as Record<string, unknown>)[key], child, path ? `${path}.${key}` : key)]));
    }
    const key = path.split('.').pop()!;
    if (typeof template === 'boolean' && typeof value === 'boolean') return value;
    if (typeof template === 'number' && typeof value === 'number' && Number.isFinite(value)) {
      const ranges: Record<string, [number, number]> = { size: [10, 18], radius: [0, 24], shadow: [0, 24], weight: [400, 700], gridGap: [8, 64], gridSize: [.5, 3], edgeWidth: [.5, 4], dividerInset: [0, 48], formulaGap: [8, 32], width: [260, 360] };
      const range = ranges[key];
      if (range && value >= range[0] && value <= range[1] && (key !== 'weight' || [400, 500, 600, 700].includes(value))) return value;
    }
    if (typeof template === 'string' && typeof value === 'string') {
      const enums: Record<string, string[]> = { appearance: ['classic', 'folder', 'inset'], icon: ['original', 'dots'], grid: ['none', 'dots', 'lines'], line: ['solid', 'dashed', 'dotted'], font: Object.keys(fontFamilies) };
      if (enums[key] ? enums[key].includes(value) : isColorValue(value)) return value;
    }
    throw new Error(`配置值无效：${path}`);
  };
  return visit(input, defaultStyle, '') as PlaygroundStyle;
}

export function styleCss(style: PlaygroundStyle, scope = '.topology-playground-preview') {
  const rules: string[] = [];
  const rule = (selector: string, css: string) => rules.push(`${selector.split(',').map(s => `${scope} ${s.trim()}`).join(',\n')} { ${css} }`);
  const typography = (t: TextStyle) => `font-size:${t.size}px;font-family:${fontFamilies[t.font]};font-weight:${t.weight};color:${t.color};`;
  const surface = (c: CardStyle) => `border:1px ${c.line} ${c.border};border-radius:${c.radius}px;background:${c.background};box-shadow:${c.shadow ? `0 2px ${c.shadow}px #172b4d18` : 'none'};`;
  const c = style.canvas;
  const grid = c.grid === 'dots'
    ? `radial-gradient(circle,${c.gridColor} ${c.gridSize}px,transparent ${c.gridSize}px)`
    : c.grid === 'lines' ? `linear-gradient(to right,${c.gridColor} ${c.gridSize}px,transparent ${c.gridSize}px),linear-gradient(to bottom,${c.gridColor} ${c.gridSize}px,transparent ${c.gridSize}px)` : 'none';
  rule('.topology-canvas-shell-svg', `background-color:${c.background};background-image:${grid};background-size:${c.gridGap}px ${c.gridGap}px;`);
  rule('.topology-canvas-shell-stage', `background:${c.background};`);
  rule('.formula-canvas-edge', `stroke:${c.edge};stroke-width:${c.edgeWidth}px;stroke-dasharray:${c.edgeDashed ? '6 4' : 'none'};`);
  rule('.formula-horizontal-edge', `stroke:${c.edge};stroke-width:${Math.max(.5, c.edgeWidth - .5)}px;`);
  rule('.formula-canvas-connector-end', `stroke:${c.edge};fill:${c.edge};`);
  rule('.metric-topology-node-card', surface(style.metric));
  rule('.metric-topology-node,.function-topology-node-metric', `width:${style.metric.width}px;`);
  rule('.metric-topology-node-status', `display:${style.metric.showStatusTag ? 'inline-flex' : 'none'};`);
  rule('.metric-topology-node-name', typography(style.metric.text));
  rule('.metric-topology-node-formula-text', typography(style.metric.formula));
  rule('.metric-topology-node-actual strong', typography(style.metric.value));
  rule('.metric-topology-node-actual', 'height:22px;flex-shrink:0;');
  rule('.metric-topology-node-actual span', typography(style.metric.unit));
  rule('.metric-topology-node-target,.metric-topology-node-details', typography(style.metric.target));
  rule('.metric-topology-node-target b', typography(style.metric.targetValue));
  rule('.metric-topology-node-target .is-positive', `color:${style.metric.positive};`);
  rule('.metric-topology-node-target .is-negative', `color:${style.metric.negative};`);
  rule('.metric-topology-node-target .is-neutral', `color:${style.metric.target.color};`);
  // Keep the border's original height so text wrapping, node geometry and anchors stay fixed.
  rule('.metric-topology-node-formula', `position:relative;border-bottom:1px solid transparent;margin-top:${style.metric.formulaGap - 8}px;`);
  rule('.metric-topology-node-formula::after', `content:"";position:absolute;left:${style.metric.dividerInset}px;right:${style.metric.dividerInset}px;bottom:-1px;border-top:1px dashed ${style.metric.divider};pointer-events:none;`);
  rule('.metric-topology-node-target i', `background:${style.metric.divider};`);
  if (style.metric.appearance === 'inset') {
    rule('.metric-topology-node.is-inset .metric-topology-node-card', `border:0;padding:0 2px 2px;background:${style.metric.background};`);
    rule('.metric-topology-node.is-inset .metric-topology-node-header', 'height:34px;padding:6px 10px;');
    rule('.metric-topology-node.is-inset .metric-topology-node-body', 'display:block;background:#fff;border-radius:8px;overflow:hidden;');
    rule('.metric-topology-node.is-inset .metric-topology-node-toggle', 'bottom:-22px;');
    rule('.metric-topology-node.is-inset .metric-topology-node-toggle:hover::after',
      `content:"";position:absolute;inset:0;pointer-events:none;background:rgb(var(--primary-5));mask:url("${expandArrowIcon}") center/contain no-repeat;`);
    rule('.metric-topology-node.is-inset .metric-topology-node-toggle[aria-expanded="true"]:hover::after',
      `mask-image:url("${collapseArrowIcon}");`);
  }
  for (const [key, prefix] of [['function', 'function-topology-node'], ['expression', 'bracket-expression-node']] as const) {
    const item = style[key];
    rule(`.${prefix}-content`, surface(item));
    // Absolute positioning starts inside the 1px frame; keep the Tag above its outer edge.
    rule(`.${prefix}-title`, `${typography(item.text)}background:${item.titleBackground};border-radius:${item.radius}px ${item.radius}px 0 0;top:-25px;`);
    rule(`.${prefix}-content::before`, `background:radial-gradient(circle at bottom right,transparent ${item.radius}px,${item.titleBackground} ${item.radius}px);width:${item.radius}px;height:${item.radius}px;`);
    rule(`.${prefix}-title img`, 'display:none;');
    rule(`.${prefix}-title::before`, `content:"";display:block;flex:0 0 16px;width:16px;height:16px;background:currentColor;mask:url("${key === 'function' ? functionIcon : style.expression.icon === 'dots' ? expressionDotsIcon : expressionIcon}") center/contain no-repeat;`);
    if (item.appearance === 'folder') {
      rule(`.${prefix}-content.is-folder`, `border:0;border-radius:0;background:transparent;padding:39px 13px 9px;--group-fill:${key === 'function' ? style.function.metricBackground : item.background};--group-border:${item.border};`);
      // Formula functions use the general surface; single-metric functions keep their independent setting.
      if (key === 'function') rule(`.${prefix}-content.is-folder.is-formula`, `--group-fill:${item.background};`);
      rule(`.${prefix}-content.is-folder::before`, 'display:none;');
      rule(`.${prefix}.is-folder > header`, 'top:0;left:1px;margin-left:0;padding:8px 12px;background:transparent;border-radius:0;');
      rule(`.${prefix}.is-folder > .formula-group-frame`, 'position:absolute;inset:0;overflow:visible;pointer-events:none;z-index:0;');
      rule(`.${prefix}.is-folder > .formula-group-frame path`, `fill:var(--group-fill);stroke:var(--group-border);stroke-width:1;stroke-dasharray:${item.line === 'dashed' ? '3 3' : item.line === 'dotted' ? '1 3' : 'none'};`);
      rule(`.${prefix}.is-folder > div`, 'position:relative;z-index:1;');
    }
    if (item.appearance === 'inset') {
      rule(`.${prefix}-content.is-inset`, `border:0;border-radius:${item.radius}px;background:${item.background};padding:34px 2px 2px;`);
      rule(`.${prefix}-content.is-inset::before`, 'display:none;');
      rule(`.${prefix}.is-inset > header`, 'top:0;left:0;margin-left:0;width:100%;height:34px;padding:6px 12px;line-height:22px;');
      rule(`.${prefix}.is-inset > .${prefix}-items,.${prefix}.is-inset > .${prefix}-metric`, 'position:relative;display:block;background:#fff;border-radius:8px;');
    }
  }
  rule('.function-topology-node-content.is-metric.is-classic', `background:${style.function.metricBackground};`);
  rule('.constant-topology-node', surface(style.constant) + typography(style.constant.text));
  // All schemes use CalculationOperatorNode's original SVG assets and geometry.
  if (style.operator.customBackground) rule('.calculation-operator-node', `--calculation-operator-background:${style.operator.background};`);
  if (style.metric.appearance === 'inset') {
    rule('.calculation-operator-node', 'width:32px;height:32px;');
    rule('.calculation-operator-node .calculation-operator-node-icon', 'position:absolute;top:calc(50% + 2px);left:50%;width:44px;height:44px;max-width:none;transform:translate(-50%,-50%);');
    // Multiplication uses a 46px SVG; preserve its actual 32px circle.
    rule('.calculation-operator-node.is-multiply .calculation-operator-node-icon', 'width:46px;height:46px;top:calc(50% + 2.0293px);left:calc(50% + .02945px);');
  }
  return rules.join('\n');
}
