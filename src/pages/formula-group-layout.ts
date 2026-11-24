import React, { createContext } from 'react';
export type GroupAppearance = 'classic' | 'folder' | 'inset';
export type FormulaGroupStyle = { function: GroupAppearance; expression: GroupAppearance; metric?: GroupAppearance; metricWidth?: number; metricHeight?: number };
export const classicGroups: FormulaGroupStyle = { function: 'classic', expression: 'classic' };
export const FormulaGroupContext = createContext(classicGroups);
export const FORMULA_GROUP_BASE_PADDING = 16;
export const FORMULA_GROUP_TAG_HEIGHT = 24;

export type InsetItem = { type: string; value?: string | number; items?: InsetItem[]; name?: string; hasChildren?: boolean };
type RenderInsetItem = InsetItem & {
  content?: React.ReactNode;
  metric?: { hasChildren?: boolean };
  expression?: { items: RenderInsetItem[] };
  items?: RenderInsetItem[];
};
export type InsetGeometry = { width: number; height: number; reference: number; x?: number; y?: number };
export function insetSequence(items: InsetItem[], groups: FormulaGroupStyle, alignMetrics = false) {
  // A row shares the innermost visible metric/operator center. Because every
  // metric has the same card height, their top edges share that same baseline.
  alignMetrics = alignMetrics || groups.metric === 'inset';
  const sizes = items.map(item => insetItemSize(item, groups));
  const reference = Math.max(0, ...sizes.map(size => size.reference));
  const height = alignMetrics
    ? Math.max(0, ...sizes.map(size => reference - size.reference + size.height))
    : Math.max(0, ...sizes.map(size => size.height));
  let x = 0;
  const entries = sizes.map(size => {
    const entry = { ...size, x, y: alignMetrics ? reference - size.reference : (height - size.height) / 2 };
    x += size.width + 16;
    return entry;
  });
  return { width: Math.max(0, x - 16), height, reference: alignMetrics ? reference : height / 2, entries };
}
export function insetItemSize(item: InsetItem, groups: FormulaGroupStyle): InsetGeometry {
  if (item.type === 'metric') {
    const height = groups.metricHeight ?? 209;
    return { width: groups.metricWidth ?? 300, height, reference: height / 2 };
  }
  if (item.type === 'operator') return { width: 32, height: 32, reference: 16 };
  if (item.type === 'constant') return { width: Math.max(32, String(item.value).length * 8 + 22), height: 32, reference: 16 };
  const children = item.items ?? [];
  const appearance = item.type === 'function' ? groups.function : groups.expression;
  const content = insetSequence(children, groups, item.type === 'function' && appearance === 'inset');
  if (appearance === 'inset') return { width: content.width + 20, height: content.height + 48, reference: content.reference + 40 };
  const paddingTop = formulaGroupTopPadding(children, appearance, groups);
  const paddingBottom = formulaGroupBottomPadding(children, appearance, item.type === 'function' && !(children.length === 1 && children[0].type === 'metric'));
  const folder = appearance === 'folder';
  const labelWidth = item.type === 'function'
    ? Math.max(folder ? 120 : 88, `${item.name ?? ''} 函数`.length * 12 + 54)
    : folder ? 126 : 104;
  return {
    width: Math.max(labelWidth, content.width + (folder ? 26 : 34)),
    height: content.height + paddingTop + paddingBottom + (folder ? 0 : 2),
    reference: content.reference + paddingTop + (folder ? 0 : 1),
  };
}
// Read the same recursive descriptors from rendered children and parsed formulas.
export function insetElementItem(content: React.ReactNode): InsetItem {
  if (!React.isValidElement<{ variant?: string; name?: string; metric?: { hasChildren?: boolean }; items?: RenderInsetItem[] }>(content)) return { type: 'metric' };
  const props = content.props;
  if (props.variant === 'metric') return { type: 'function', name: props.name, items: [{ type: 'metric', hasChildren: props.metric?.hasChildren }] };
  if (props.items) return { type: props.variant ? 'function' : 'expression', name: props.name, items: props.items.map(insetRenderItem) };
  return { type: 'metric' };
}
export function insetRenderItem(item: RenderInsetItem): InsetItem {
  if (item.type === 'expression') return { type: 'expression', items: (item.items ?? item.expression?.items ?? []).map(insetRenderItem) };
  if (item.type === 'function') return item.content ? insetElementItem(item.content) : { type: 'function', name: item.name, items: (item.items ?? []).map(insetRenderItem) };
  return { type: item.type, value: item.value, hasChildren: item.metric?.hasChildren };
}

export function formulaGroupTopPadding(items: readonly { type: string }[], appearance: GroupAppearance = 'classic', groups = classicGroups) {
  if (appearance === 'inset') return 34;
  const hasTaggedChild = items.some(item =>
    (item.type === 'expression' || item.type === 'function') && groups[item.type] === 'classic'
  );
  return (appearance === 'folder' ? 39 : FORMULA_GROUP_BASE_PADDING) + (hasTaggedChild ? FORMULA_GROUP_TAG_HEIGHT : 0);
}

export function formulaGroupBottomPadding(items: readonly { type: string; hasChildren?: boolean }[], appearance: GroupAppearance = 'classic', functionFormula = false) {
  if (appearance === 'inset') return 2;
  if (appearance === 'classic') return 16;
  // The 28px circle ends 12px below the metric. Leave 8px before the 1px outline.
  return Math.max(functionFormula ? 13 : 9, items.some(item => item.type === 'metric' && item.hasChildren) ? 12 + 8 + 1 : 0);
}
