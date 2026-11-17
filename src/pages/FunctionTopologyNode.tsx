import React from 'react';
import functionNodeIcon from '../app/static/icon/function-node.svg';
import BracketExpressionNode, {
  type BracketExpressionNodeProps,
} from './BracketExpressionNode';
import CalculationOperatorNode, {
  type CalculationOperator,
} from './CalculationOperatorNode';
import ConstantTopologyNode from './ConstantTopologyNode';
import MetricTopologyNode, {
  type MetricTopologyNodeProps,
} from './MetricTopologyNode';
import './function-topology-node.css';
import GroupTargetHandle, { FormulaSideHandles } from './GroupTargetHandle';
import { formulaGroupTopPadding } from './formula-group-layout';

export type FunctionFormulaItem =
  | {
      id: string;
      type: 'expression';
      expression: BracketExpressionNodeProps;
    }
  | {
      id: string;
      type: 'metric';
      metric: MetricTopologyNodeProps;
    }
  | {
      id: string;
      type: 'operator';
      operator: CalculationOperator;
    }
  | {
      id: string;
      type: 'constant';
      value: string | number;
    }
  | {
      id: string;
      type: 'function';
      name: string;
      items: FunctionFormulaItem[];
    };

type FunctionTopologyBaseProps = {
  nodeId?: string;
  name: string;
  className?: string;
};

export type FunctionTopologyNodeProps =
  | (FunctionTopologyBaseProps & {
      variant: 'metric';
      metric: MetricTopologyNodeProps;
    })
  | (FunctionTopologyBaseProps & {
      variant: 'formula';
      items: FunctionFormulaItem[];
    });

function renderFormulaItem(item: FunctionFormulaItem) {
  switch (item.type) {
    case 'expression':
      return <BracketExpressionNode {...item.expression} nodeId={item.expression.nodeId || item.id} />;
    case 'metric':
      return <MetricTopologyNode {...item.metric} />;
    case 'operator':
      return <CalculationOperatorNode operator={item.operator} />;
    case 'constant':
      return <ConstantTopologyNode value={item.value} />;
    case 'function':
      return <FunctionTopologyNode nodeId={item.id} name={item.name} variant="formula" items={item.items} />;
  }
}

export function formatFunctionNodeLabel(name: string) {
  const functionName = name.trim().replace(/(?:\s*函数)+$/, '').trim();
  return functionName ? `${functionName} 函数` : '函数';
}

export default function FunctionTopologyNode(props: FunctionTopologyNodeProps) {
  const displayName = formatFunctionNodeLabel(props.name);

  return (
    <section
      className={[
        'function-topology-node',
        'function-topology-node-content',
        `is-${props.variant}`,
        props.className,
      ].filter(Boolean).join(' ')}
      aria-label={displayName}
      data-node-id={props.nodeId}
      style={{ paddingTop: formulaGroupTopPadding(props.variant === 'formula' ? props.items : []) }}
    >
      <GroupTargetHandle nodeId={props.nodeId} />
      <FormulaSideHandles nodeId={props.nodeId} borderWidth={1} />
      <header className="function-topology-node-title">
        <img src={functionNodeIcon} alt="" draggable={false} />
        <span>{displayName}</span>
      </header>

      {props.variant === 'metric' ? (
        <div className="function-topology-node-metric">
          <MetricTopologyNode {...props.metric} />
        </div>
      ) : (
        <div
          className="function-topology-node-items"
          role="group"
          aria-label={`${displayName}内容`}
        >
          {props.items.map((item) => (
            <div
              className={`function-topology-node-item is-${item.type}`}
              data-function-item={item.type}
              key={item.id}
            >
              {renderFormulaItem(item)}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
