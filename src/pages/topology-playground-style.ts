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
  metric: CardStyle & { formula: TextStyle; value: TextStyle; unit: TextStyle; target: TextStyle; positive: string; negative: string; divider: string };
  function: CardStyle;
  expression: CardStyle;
  constant: CardStyle;
  operator: CardStyle;
};
const text = (size: number, color: string, weight = 400, font = 'system'): TextStyle => ({ size, color, weight, font });
const card = (border: string, color: string, titleBackground = '#ffffff', radius = 12): CardStyle => ({
  border, background: '#ffffff', radius, line: 'solid', shadow: 0, text: text(12, color, 500), titleBackground,
});
export const defaultStyle: PlaygroundStyle = {
  canvas: { background: '#fcfdfe', grid: 'none', gridColor: '#d0d9e5', gridGap: 24, gridSize: 1, edge: '#d0d9e5', edgeWidth: 2, edgeDashed: false },
  metric: { ...card('#dde2e9', '#0c0d0e'), text: text(13, '#0c0d0e', 500), formula: text(12, '#42464e'), value: text(13, '#0c0d0e', 500, 'roboto'), unit: text(13, '#0c0d0e'), target: text(12, '#737a87'), positive: '#00a32b', negative: '#ee3f38', divider: '#eaedf1' },
  function: { ...card('#eaedf1', '#6e4c9f', '#f2eafb'), line: 'dashed' },
  expression: { ...card('#eaedf1', '#42464e', '#eceded'), line: 'dashed' },
  constant: { ...card('#dde2e9', '#0c0d0e', '#ffffff', 8), text: text(13, '#0c0d0e', 500) },
  operator: { ...card('#dde2e9', '#737a87', '#ffffff', 16), text: text(18, '#737a87', 500) },
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
  return style;
}

// Validate against the schema; never interpolate unchecked import values into CSS.
export function parseStyle(input: unknown): PlaygroundStyle {
  const visit = (value: unknown, template: unknown, path: string): unknown => {
    if (template && typeof template === 'object') {
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`缺少配置：${path || '根节点'}`);
      return Object.fromEntries(Object.entries(template).map(([key, child]) => [key, visit((value as Record<string, unknown>)[key], child, path ? `${path}.${key}` : key)]));
    }
    const key = path.split('.').pop()!;
    if (typeof template === 'boolean' && typeof value === 'boolean') return value;
    if (typeof template === 'number' && typeof value === 'number' && Number.isFinite(value)) {
      const ranges: Record<string, [number, number]> = { size: [10, 18], radius: [0, 24], shadow: [0, 24], weight: [400, 700], gridGap: [8, 64], gridSize: [.5, 3], edgeWidth: [.5, 4] };
      const range = ranges[key];
      if (range && value >= range[0] && value <= range[1] && (key !== 'weight' || [400, 500, 600, 700].includes(value))) return value;
    }
    if (typeof template === 'string' && typeof value === 'string') {
      const enums: Record<string, string[]> = { grid: ['none', 'dots', 'lines'], line: ['solid', 'dashed', 'dotted'], font: Object.keys(fontFamilies) };
      if (enums[key] ? enums[key].includes(value) : /^#[0-9a-f]{6}$/i.test(value)) return value;
    }
    throw new Error(`配置值无效：${path}`);
  };
  return visit(input, defaultStyle, '') as PlaygroundStyle;
}

export function styleCss(style: PlaygroundStyle) {
  const scope = '.topology-playground-preview';
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
  rule('.metric-topology-node-name', typography(style.metric.text));
  rule('.metric-topology-node-formula-text', typography(style.metric.formula));
  rule('.metric-topology-node-actual strong', typography(style.metric.value));
  rule('.metric-topology-node-actual span', typography(style.metric.unit));
  rule('.metric-topology-node-target,.metric-topology-node-target b,.metric-topology-node-details', typography(style.metric.target));
  rule('.metric-topology-node-target .is-positive', `color:${style.metric.positive};`);
  rule('.metric-topology-node-target .is-negative', `color:${style.metric.negative};`);
  rule('.metric-topology-node-target .is-neutral', `color:${style.metric.target.color};`);
  rule('.metric-topology-node-formula', `border-color:${style.metric.divider};`);
  rule('.metric-topology-node-target i', `background:${style.metric.divider};`);
  for (const [key, prefix] of [['function', 'function-topology-node'], ['expression', 'bracket-expression-node']] as const) {
    const item = style[key];
    rule(`.${prefix}-content`, surface(item));
    rule(`.${prefix}-title`, `${typography(item.text)}background:${item.titleBackground};border-radius:${item.radius}px ${item.radius}px 0 0;`);
    rule(`.${prefix}-content::before`, `background:radial-gradient(circle at bottom right,transparent ${item.radius}px,${item.titleBackground} ${item.radius}px);width:${item.radius}px;height:${item.radius}px;`);
  }
  rule('.constant-topology-node', surface(style.constant) + typography(style.constant.text));
  // Preserve the existing operator footprint and anchors; skin its visible 32px symbol.
  rule('.calculation-operator-node img', 'visibility:hidden;');
  rule('.calculation-operator-node::after', `position:absolute;left:50%;top:calc(50% + 2px);transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;width:32px;height:32px;box-sizing:border-box;${surface(style.operator)}${typography(style.operator.text)}line-height:1;`);
  for (const [label, symbol] of [['加法', '+'], ['减法', '−'], ['乘法', '×'], ['除法', '÷']]) rule(`.calculation-operator-node[aria-label="${label}"]::after`, `content:"${symbol}";`);
  return rules.join('\n');
}
