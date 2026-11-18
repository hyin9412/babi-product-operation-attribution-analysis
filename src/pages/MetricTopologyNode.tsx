import React from 'react';
import { IconLineChart } from '@arco-design/iconbox-react-ve-o-design';
import Popover from './AnalysisPopover';
import expandIcon from '../app/static/icon/下级节点_展开.svg';
import collapseIcon from '../app/static/icon/下级节点_收起.svg';
import './metric-topology-node.css';
import { Position } from '@xyflow/react';
import { FormulaSideHandles, TopologyHandle } from './GroupTargetHandle';

// The 40px icon's visible circle ends at y=32; its button starts 20px above the card bottom.
export const METRIC_SOURCE_OFFSET = 12;

export type MetricTopologyTarget = {
  id: 'month' | 'quarter' | 'annual';
  label: string;
  value: string;
  deviation: string;
  deviationValue?: number | null;
};

export type MetricTopologyNodeProps = {
  nodeId?: string;
  name: string;
  formula: string;
  actualValue: string;
  unit: string;
  targets?: MetricTopologyTarget[];
  hasChildren?: boolean;
  expanded?: boolean;
  showTrend?: boolean;
  hasMultipleRows?: boolean;
  onToggle?: () => void;
  onTrend?: () => void;
  onViewDetails?: () => void;
};

function OverflowPopover({
  children,
  className,
  content,
}: {
  children: React.ReactNode;
  className: string;
  content: React.ReactNode;
}) {
  return <Popover content={content}>
    <span className="metric-topology-node-popover-trigger">
      <div className={className}>{children}</div>
    </span>
  </Popover>;
}

function deviationTone(value?: number | null) {
  if (value === null || value === undefined || !Number.isFinite(value) || value === 0) return 'is-neutral';
  return value > 0 ? 'is-negative' : 'is-positive';
}

export default function MetricTopologyNode({
  nodeId,
  name,
  formula,
  actualValue,
  unit,
  targets = [],
  hasChildren = false,
  expanded = false,
  showTrend = false,
  hasMultipleRows = false,
  onToggle,
  onTrend,
  onViewDetails,
}: MetricTopologyNodeProps) {
  const displayName = name.trim() || '-';
  const displayFormula = formula.trim() || '-';
  const displayValue = actualValue.trim() || '-';
  const displayUnit = /[%％]$/.test(displayValue) ? '' : unit.trim() || '-';

  return <article className={`metric-topology-node${hasChildren ? ' has-children' : ''}`} data-node-id={nodeId} aria-label={displayName}>
    <FormulaSideHandles nodeId={nodeId} />
    <div className="metric-topology-node-card">
      <header className="metric-topology-node-header">
        <OverflowPopover className="metric-topology-node-name" content={displayName}>
          {displayName}
        </OverflowPopover>
        {showTrend ? <Popover content="查看月趋势" position="top">
          <button type="button" className="metric-topology-node-trend" aria-label={`查看${displayName}月趋势`} onClick={onTrend}>
            <IconLineChart width="14" height="14" />
          </button>
        </Popover> : null}
      </header>

      <div className="metric-topology-node-formula">
        <OverflowPopover className="metric-topology-node-formula-text" content={displayFormula}>
          {displayFormula}
        </OverflowPopover>
      </div>

      <div
        className={`metric-topology-node-values${hasMultipleRows ? ' is-multiple-rows' : ''}`}
        style={hasMultipleRows ? { '--metric-topology-values-height': `${46 + targets.length * 24}px` } as React.CSSProperties : undefined}
      >
        {hasMultipleRows ? <button type="button" className="metric-topology-node-details" onClick={onViewDetails}>
          请<span>点击</span>查看详细数据
        </button> : <>
          <div className="metric-topology-node-actual numeric">
            <strong>{displayValue}</strong>
            {displayUnit ? <span>{displayUnit}</span> : null}
          </div>
          {targets.map(target => <div className="metric-topology-node-target numeric" key={target.id}>
            <span>{target.label}：<b>{target.value || '-'}</b></span>
            <i aria-hidden />
            <span>偏差：<b className={deviationTone(target.deviationValue)}>{target.deviation || '-'}</b></span>
          </div>)}
        </>}
      </div>
    </div>

    {hasChildren ? <Popover content={expanded ? '收起下层节点' : '展开下层节点'} position="top">
      <button
        type="button"
        className="metric-topology-node-toggle"
        aria-label={`${expanded ? '收起' : '展开'}${displayName}下层节点`}
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <TopologyHandle nodeId={nodeId} id="bottom" position={Position.Bottom} type="source" centered offsetY={METRIC_SOURCE_OFFSET} />
        <img src={expanded ? collapseIcon : expandIcon} alt="" />
      </button>
    </Popover> : null}
  </article>;
}
