import React, { useContext, type ReactNode } from 'react';
import bracketExpressionIcon from '../app/static/icon/bracket-expression.svg';
import CalculationOperatorNode, {
  type CalculationOperator,
} from './CalculationOperatorNode';
import ConstantTopologyNode from './ConstantTopologyNode';
import GroupTargetHandle, { FormulaSideHandles } from './GroupTargetHandle';
import './bracket-expression-node.css';
import { FormulaGroupContext, formulaGroupTopPadding, formulaGroupBottomPadding, insetSequence, insetRenderItem } from './formula-group-layout';
import FormulaGroupFrame from './FormulaGroupFrame';
import type { MetricTopologyNodeProps } from './MetricTopologyNode';

export type BracketExpressionItem =
  | {
      id: string;
      type: 'metric';
      content: ReactNode;
    }
  | {
      id: string;
      type: 'constant';
      value: string | number;
    }
  | {
      id: string;
      type: 'operator';
      operator: CalculationOperator;
    }
  | {
      id: string;
      type: 'function';
      content: ReactNode;
    }
  | {
      id: string;
      type: 'expression';
      items: BracketExpressionItem[];
      label?: string;
    };

export type BracketExpressionNodeProps = {
  nodeId?: string;
  items: BracketExpressionItem[];
  label?: string;
  className?: string;
};

function renderItem(item: BracketExpressionItem) {
  switch (item.type) {
    case 'constant':
      return <ConstantTopologyNode value={item.value} />;
    case 'operator':
      return <CalculationOperatorNode operator={item.operator} />;
    case 'expression':
      return <BracketExpressionNode nodeId={item.id} items={item.items} label={item.label} />;
    case 'metric':
    case 'function':
      return item.content;
  }
}

export default function BracketExpressionNode({
  nodeId,
  items,
  label = '括号表达式',
  className,
}: BracketExpressionNodeProps) {
  const displayLabel = label.trim() || '括号表达式';
  const groups = useContext(FormulaGroupContext);
  const appearance = groups.expression;
  const layout = appearance === 'inset' ? insetSequence(items.map(insetRenderItem), groups) : undefined;
  const bottomItems = items.map(item => ({
    type: item.type,
    hasChildren: item.type === 'metric' && React.isValidElement<MetricTopologyNodeProps>(item.content) ? item.content.props.hasChildren : false,
  }));

  return (
    <section
      className={['bracket-expression-node', 'bracket-expression-node-content', `is-${appearance}`, className].filter(Boolean).join(' ')}
      data-node-id={nodeId}
      aria-label={displayLabel}
      style={{
        paddingTop: formulaGroupTopPadding(items, appearance, groups),
        paddingBottom: formulaGroupBottomPadding(bottomItems, appearance),
        minWidth: appearance === 'folder' ? 126 : undefined,
      }}
    >
      {appearance === 'folder' && <FormulaGroupFrame kind="expression" />}
      <GroupTargetHandle nodeId={nodeId} offsetY={appearance === 'folder' ? 26 : 0} borderWidth={appearance === 'inset' ? 0 : 1} />
      <FormulaSideHandles nodeId={nodeId} borderWidth={appearance === 'classic' ? 1 : 0} offsetY={layout ? layout.reference + 40 - (layout.height + 48) / 2 : 0} />
      <header className="bracket-expression-node-title">
        <img src={bracketExpressionIcon} alt="" draggable={false} />
        <span>{displayLabel}</span>
      </header>

      <div className="bracket-expression-node-items" role="group" aria-label={`${displayLabel}内容`} style={layout ? { width: layout.width + 16, height: layout.height + 12 } : undefined}>
        {items.map((item) => (
          <div
            className={`bracket-expression-node-item is-${item.type}`}
            data-expression-item={item.type}
            key={item.id}
            style={layout ? { position: 'absolute', left: 8 + layout.entries[items.indexOf(item)].x, top: 6 + layout.entries[items.indexOf(item)].y } : undefined}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </section>
  );
}
