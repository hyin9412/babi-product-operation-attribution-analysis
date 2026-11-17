import React, { type ReactNode } from 'react';
import bracketExpressionIcon from '../app/static/icon/bracket-expression.svg';
import CalculationOperatorNode, {
  type CalculationOperator,
} from './CalculationOperatorNode';
import ConstantTopologyNode from './ConstantTopologyNode';
import GroupTargetHandle, { FormulaSideHandles } from './GroupTargetHandle';
import './bracket-expression-node.css';
import { formulaGroupTopPadding } from './formula-group-layout';

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

  return (
    <section
      className={['bracket-expression-node', 'bracket-expression-node-content', className].filter(Boolean).join(' ')}
      data-node-id={nodeId}
      aria-label={displayLabel}
      style={{ paddingTop: formulaGroupTopPadding(items) }}
    >
      <GroupTargetHandle nodeId={nodeId} />
      <FormulaSideHandles nodeId={nodeId} borderWidth={1} />
      <header className="bracket-expression-node-title">
        <img src={bracketExpressionIcon} alt="" draggable={false} />
        <span>{displayLabel}</span>
      </header>

      <div className="bracket-expression-node-items" role="group" aria-label={`${displayLabel}内容`}>
        {items.map((item) => (
          <div
            className={`bracket-expression-node-item is-${item.type}`}
            data-expression-item={item.type}
            key={item.id}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </section>
  );
}
