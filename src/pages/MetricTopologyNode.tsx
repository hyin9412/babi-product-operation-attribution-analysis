import React from 'react';
import Tag from '@tod-m/materials/ve-o/es/Tag';
import '@tod-m/materials/ve-o/es/Tag/style/index.less';
import { IconLineChart } from '@arco-design/iconbox-react-ve-o-design';
import Popover from './AnalysisPopover';
import { FormulaValue } from './IncomeMetricCard';
import './income.css';
import expandIcon from '../app/static/icon/下级节点_展开.svg';
import collapseIcon from '../app/static/icon/下级节点_收起.svg';
import './metric-topology-node.css';
import { Position } from '@xyflow/react';
import { FormulaSideHandles, TopologyHandle } from './GroupTargetHandle';
import { FormulaGroupContext } from './formula-group-layout';

// The 40px icon's visible circle ends at y=32; its button starts 20px above the card bottom.
export const METRIC_SOURCE_OFFSET = 12;

export type MetricTopologyTarget = {
  id: 'month' | 'quarter' | 'annual';
  label: string;
  value: string;
  deviation: string;
  deviationValue?: number | null;
  deviationFormula?: React.ReactNode;
};

export type MetricTopologyNodeProps = {
  nodeId?: string;
  name: string;
  status?: { type: 'success' | 'warning' | 'error'; label: string; description?: string };
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
  overflowOnly = false,
}: {
  children: React.ReactNode;
  className: string;
  content: React.ReactNode;
  overflowOnly?: boolean;
}) {
  const textRef = React.useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = React.useState(false);
  React.useEffect(() => {
    if (!overflowOnly) return;
    const element = textRef.current;
    if (!element) return;
    const check = () => setOverflowing(
      element.clientWidth > 0 && (
        element.scrollWidth > element.clientWidth + 1 ||
        element.scrollHeight > element.clientHeight + 1
      )
    );
    check();
    const observer = new ResizeObserver(check);
    observer.observe(element);
    return () => observer.disconnect();
  }, [children, overflowOnly]);
  return <Popover content={content} disabled={overflowOnly && !overflowing}>
    <span className="metric-topology-node-popover-trigger">
      <div ref={textRef} className={className} data-overflow={overflowOnly ? overflowing : undefined}>{children}</div>
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
  status,
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
  const inset = React.useContext(FormulaGroupContext).metric === 'inset';
  const displayFormula = formula.trim() || '-';
  const displayValue = actualValue.trim() || '-';
  const displayUnit = /[%％]$/.test(displayValue) ? '' : unit.trim() || '-';

  return <article className={`metric-topology-node${hasChildren ? ' has-children' : ''}${inset ? ' is-inset' : ''}`} data-node-id={nodeId} aria-label={displayName}>
    <FormulaSideHandles nodeId={nodeId} />
    <div className="metric-topology-node-card">
      <header className="metric-topology-node-header">
        <OverflowPopover className="metric-topology-node-name" content={<div>
          <div>{displayName}</div>
          <div>调用统一的指标解释卡片</div>
        </div>}>
          {displayName}
        </OverflowPopover>
        {status ? <span className="metric-topology-node-status">
          <Popover content={status.description || status.label} position="top">
            <Tag.TagPro type={status.type} size="small" icon={null}>{status.label}</Tag.TagPro>
          </Popover>
        </span> : null}
        {showTrend ? <Popover content="查看月趋势" position="top">
          <button type="button" className="metric-topology-node-trend" aria-label={`查看${displayName}月趋势`} onClick={onTrend}>
            <IconLineChart width="14" height="14" />
          </button>
        </Popover> : null}
      </header>

      <div className="metric-topology-node-body">
      <div className="metric-topology-node-formula">
        <OverflowPopover className="metric-topology-node-formula-text" content={displayFormula} overflowOnly>
          {displayFormula}
        </OverflowPopover>
      </div>

      <div
        className={`metric-topology-node-values${hasMultipleRows ? ' is-multiple-rows' : ''}`}
        style={hasMultipleRows ? { '--metric-topology-values-height': `${46 + targets.length * 24}px` } as React.CSSProperties : undefined}
      >
        {hasMultipleRows ? <button type="button" className="metric-topology-node-details" aria-label="请点击查看详细数据" onClick={onViewDetails}>
          请<span>点击</span>查看详细数据
        </button> : <>
          <div className="metric-topology-node-actual numeric">
            <strong>{displayValue}</strong>
            {displayUnit ? <span>{displayUnit}</span> : null}
          </div>
          {targets.map(target => <div className="metric-topology-node-target numeric" key={target.id}>
            <span>{target.label}：<b>{target.value || '-'}</b></span>
            <i aria-hidden />
            <span>偏差：<b className={deviationTone(target.deviationValue)}>
              <FormulaValue content={target.deviationFormula || `${target.label}偏差：${target.deviation || '-'}`}>
                {target.deviation || '-'}
              </FormulaValue>
            </b></span>
          </div>)}
        </>}
      </div>
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
