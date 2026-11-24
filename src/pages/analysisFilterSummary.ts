import { areaNames } from './analysisData';

export type FilterSummaryItem = [label: string, value: string, selectedValues?: string[]];

export function getMultiFilterSummary(
  label: string,
  selected: string[] | null,
  options: string[],
  emptyValue = '未选择',
): FilterSummaryItem {
  const allSelected = selected === null ||
    (options.length > 0 && selected.length === options.length && options.every(option => selected.includes(option)));
  if (allSelected) return [label, '全部'];
  const values = (selected ?? []).map(value => areaNames[value] ?? value);
  return [label, values.length ? values.join('、') : emptyValue, values];
}
