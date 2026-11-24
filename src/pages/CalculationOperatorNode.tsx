import React from 'react';
import addIcon from '../app/static/icon/计算式子_加.svg?raw';
import subtractIcon from '../app/static/icon/计算式子_减.svg?raw';
import multiplyIcon from '../app/static/icon/计算式子_乘.svg?raw';
import divideIcon from '../app/static/icon/计算式子_除.svg?raw';
import './calculation-operator-node.css';
import { FormulaSideHandles } from './GroupTargetHandle';

export type CalculationOperator = 'add' | 'subtract' | 'multiply' | 'divide';

export type CalculationOperatorNodeProps = {
  nodeId?: string;
  operator: CalculationOperator;
  className?: string;
};

const OPERATORS: Record<CalculationOperator, { label: string; icon: string }> = {
  add: { label: '加法', icon: addIcon },
  subtract: { label: '减法', icon: subtractIcon },
  multiply: { label: '乘法', icon: multiplyIcon },
  divide: { label: '除法', icon: divideIcon },
};

export default function CalculationOperatorNode({
  nodeId,
  operator,
  className,
}: CalculationOperatorNodeProps) {
  const item = OPERATORS[operator];

  return (
    <span
      className={['calculation-operator-node', `is-${operator}`, className].filter(Boolean).join(' ')}
      role="img"
      aria-label={item.label}
      data-node-id={nodeId}
    >
      <FormulaSideHandles nodeId={nodeId} />
      <span className="calculation-operator-node-icon" aria-hidden dangerouslySetInnerHTML={{
        // These are trusted local SVG assets. Change only the circle's fill.
        __html: item.icon.replace('fill="#FCFDFE"', 'fill="var(--calculation-operator-background, #FCFDFE)"'),
      }} />
    </span>
  );
}
