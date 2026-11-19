import React, { useState } from 'react';
import { Button, InputNumber } from '@byted-babi/babi-design';
import { Alert, Button as VeButton, Tabs } from '@tod-m/materials/ve-o';
import Popover from './AnalysisPopover';
import { OverflowText } from './analysisUI';
import { IconDataTable, IconInfoCircleFill, IconLineChart } from '@arco-design/iconbox-react-ve-o-design';

export type AnalysisView = 'table' | 'trend';

// A scope change invalidates both the view and the selected row immediately.
export function useTableTrend<T extends { id: string }>(rows: T[], scope: string) {
  type State = { scope: string; view: AnalysisView; id?: string; ranges: Record<string, number | 'all'> };
  const initial: State = { scope, view: 'table', ranges: {} };
  const [state, setState] = useState<State>(initial);
  const current = state.scope === scope ? state : initial;
  const selected = rows.find(row => row.id === current.id);
  return {
    view: current.view,
    selected,
    range: (key: string) => current.ranges[key] ?? 5,
    setRange: (key: string, range: number | 'all') => {
      if (!selected) setState({ ...current, ranges: { ...current.ranges, [key]: range } });
    },
    clearSelection: () => setState({ scope, view: 'trend', ranges: {} }),
    setView: (view: AnalysisView) => setState({ scope, view, ranges: {} }),
    drill: (row: T) => setState({ ...current, view: 'trend', id: row.id }),
  };
}

export function TrendRangeControl({ range, rankingLabel, onChange }: {
  range: number | 'all'; rankingLabel: string;
  onChange: (range: number | 'all') => void;
}) {
  const [draft, setDraft] = useState<number | undefined>(range === 'all' ? undefined : range);
  const commit = () => {
    if (draft == null || !Number.isFinite(draft)) {
      setDraft(range === 'all' ? undefined : range);
      return;
    }
    const next = Math.min(2147483647, Math.max(1, Math.round(draft)));
    setDraft(next);
    if (next !== range) onChange(next);
  };
  return <div className="analysis-trend-range">
      <span>{rankingLabel}</span>
      <Popover content="选择TopN">
        <span style={{ display: 'inline-flex' }}>
          <InputNumber size="small" className="analysis-trend-range-input" aria-label={`${rankingLabel}Top N`}
            placeholder="请选择 TopN" value={draft} min={1} max={2147483647} precision={0}
            style={{ width: 70 }} onChange={setDraft} onBlur={commit}
            onKeyDown={event => { if ((event as KeyboardEvent).key === 'Enter') commit(); }} />
        </span>
      </Popover>
  </div>;
}

export function rankedTrendRows<T extends { id: string }>(rows: T[], range: number | 'all', score: (row: T) => number | null | undefined, selected?: T): T[] {
  if (selected) return [selected];
  const ranked = [...rows].sort((a, b) => {
    const av = score(a), bv = score(b);
    return (bv == null || !Number.isFinite(bv) ? -Infinity : bv) - (av == null || !Number.isFinite(av) ? -Infinity : av) || a.id.localeCompare(b.id);
  });
  return range === 'all' ? ranked : ranked.slice(0, range);
}

export function TrendDrillIcon({ label, onClick, disabled = false, disabledReason }: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  return <Popover content={disabled && disabledReason ? disabledReason : '查看月趋势'}>
    <span className="analysis-trend-drill-trigger">
      <Button type="text" size="mini" shape="square" className="analysis-trend-drill" disabled={disabled}
        aria-label={disabled && disabledReason ? `${label}：${disabledReason}` : `查看 ${label} 月趋势`}
        icon={<IconLineChart width="16" height="16" />} onClick={event => { event.stopPropagation(); onClick(); }} />
    </span>
  </Popover>;
}

export default function TableTrendView({ view, onChange, label, title, sectionTitle = false, selectedLabel, onClearSelection, trendDisabled = false, trendDisabledReason, table, trend }: {
  view: AnalysisView;
  onChange: (view: AnalysisView) => void;
  label: string;
  title?: string;
  sectionTitle?: boolean;
  selectedLabel?: string;
  onClearSelection?: () => void;
  trendDisabled?: boolean;
  trendDisabledReason?: string;
  table: React.ReactNode;
  trend: React.ReactNode;
}) {
  const trendLabel = <span className="analysis-view-tab-label"><IconLineChart width="16" height="16"/><span>月度趋势</span></span>;
  const titleNode = sectionTitle ? <h2 className="analysis-view-title">{title}</h2> : <OverflowText as="h3" className="analysis-view-title">{title}</OverflowText>;
  const filterAlert = view === 'trend' && selectedLabel ? <Alert
    className="analysis-trend-filter-alert"
    type="info"
    role="status"
    icon={<IconInfoCircleFill width="16" height="16"/>}
    content={<OverflowText className="analysis-trend-filter-label">当前查看：{selectedLabel}</OverflowText>}
    action={<VeButton type="text" size="mini" onClick={onClearSelection}>清空筛选</VeButton>}
  /> : null;
  return <div className={`analysis-table-trend${title?' analysis-table-trend-has-title':''}${sectionTitle?' analysis-table-trend-section-title':''}`} aria-label={label}>
    <Tabs className="analysis-view-tabs" type="text" size="small" headerPadding={false} activeTab={view} destroyOnHide={false} onChange={key => onChange(key as AnalysisView)}
      renderTabHeader={title?(tabProps,DefaultTabHeader)=><div className="analysis-view-heading">{titleNode}<DefaultTabHeader {...tabProps}/>{filterAlert}</div>:undefined}>
      <Tabs.TabPane key="table" title={<span className="analysis-view-tab-label"><IconDataTable width="16" height="16"/><span>数据明细</span></span>}>{table}</Tabs.TabPane>
      <Tabs.TabPane key="trend" disabled={trendDisabled} title={trendDisabled && trendDisabledReason ? <Popover content={trendDisabledReason}><span className="analysis-view-disabled-tab">{trendLabel}</span></Popover> : trendLabel}>{view === 'trend' ? trend : null}</Tabs.TabPane>
    </Tabs>
  </div>;
}
