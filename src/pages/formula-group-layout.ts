export const FORMULA_GROUP_BASE_PADDING = 16;
export const FORMULA_GROUP_TAG_HEIGHT = 24;

export function formulaGroupTopPadding(items: readonly { type: string }[]) {
  const hasTaggedChild = items.some(item =>
    item.type === 'expression' || item.type === 'function'
  );
  return FORMULA_GROUP_BASE_PADDING + (hasTaggedChild ? FORMULA_GROUP_TAG_HEIGHT : 0);
}
