import React from 'react';
import './constant-topology-node.css';

export type ConstantTopologyNodeProps = {
  value: string | number;
  className?: string;
};

export default function ConstantTopologyNode({
  value,
  className,
}: ConstantTopologyNodeProps) {
  return (
    <span
      className={['constant-topology-node', 'numeric', className].filter(Boolean).join(' ')}
      aria-label={`常量 ${value}`}
    >
      {value}
    </span>
  );
}
