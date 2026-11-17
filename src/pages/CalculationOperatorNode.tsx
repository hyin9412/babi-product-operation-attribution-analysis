import React from 'react';
import addIcon from '../app/static/icon/计算式子_加.svg';
import subtractIcon from '../app/static/icon/计算式子_减.svg';
import multiplyIcon from '../app/static/icon/计算式子_乘.svg';
import divideIcon from '../app/static/icon/计算式子_除.svg';
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
      className={['calculation-operator-node', className].filter(Boolean).join(' ')}
      role="img"
      aria-label={item.label}
      data-node-id={nodeId}
    >
      <FormulaSideHandles nodeId={nodeId} />
      <img src={item.icon} alt="" draggable={false} />
    </span>
  );
}
