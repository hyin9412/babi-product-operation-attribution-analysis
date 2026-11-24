import React, { useContext } from 'react';
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
import { FormulaGroupContext, formulaGroupTopPadding, formulaGroupBottomPadding, insetSequence, insetRenderItem } from './formula-group-layout';
import FormulaGroupFrame from './FormulaGroupFrame';

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
      if (item.items.length === 1 && item.items[0].type === 'metric') {
        return <FunctionTopologyNode nodeId={item.id} name={item.name} variant="metric" metric={item.items[0].metric} />;
      }
      return <FunctionTopologyNode nodeId={item.id} name={item.name} variant="formula" items={item.items} />;
  }
}

export function formatFunctionNodeLabel(name: string) {
  const functionName = name.trim().replace(/(?:\s*函数)+$/, '').trim();
  return functionName ? `${functionName} 函数` : '函数';
}

export default function FunctionTopologyNode(props: FunctionTopologyNodeProps) {
  const displayName = formatFunctionNodeLabel(props.name);
  const groups = useContext(FormulaGroupContext);
  const appearance = groups.function;
  const layout = appearance === 'inset' ? insetSequence(
    props.variant === 'metric' ? [{ type: 'metric' }] : props.items.map(insetRenderItem), groups, true,
  ) : undefined;
  const bottomItems = props.variant === 'metric'
    ? [{ type: 'metric', hasChildren: props.metric.hasChildren }]
    : props.items.map(item => ({ type: item.type, hasChildren: item.type === 'metric' ? item.metric.hasChildren : false }));

  return (
    <section
      className={[
        'function-topology-node',
        'function-topology-node-content',
        `is-${props.variant}`,
        `is-${appearance}`,
        props.className,
      ].filter(Boolean).join(' ')}
      aria-label={displayName}
      data-node-id={props.nodeId}
      style={{
        paddingTop: formulaGroupTopPadding(props.variant === 'formula' ? props.items : [], appearance, groups),
        paddingBottom: formulaGroupBottomPadding(bottomItems, appearance, props.variant === 'formula'),
        minWidth: appearance === 'folder' ? Math.max(120, displayName.length * 12 + 54) : undefined,
      }}
    >
      {appearance === 'folder' && <FormulaGroupFrame kind="function" />}
      <GroupTargetHandle nodeId={props.nodeId} offsetY={appearance === 'folder' ? 26 : 0} borderWidth={appearance === 'inset' ? 0 : 1} />
      <FormulaSideHandles nodeId={props.nodeId} borderWidth={appearance === 'classic' ? 1 : 0} offsetY={layout ? layout.reference + 40 - (layout.height + 48) / 2 : 0} />
      <header className="function-topology-node-title">
        <img src={functionNodeIcon} alt="" draggable={false} />
        <span>{displayName}</span>
      </header>

      {props.variant === 'metric' ? (
        <div className="function-topology-node-metric" style={layout ? { width: layout.width + 16, height: layout.height + 12, padding: '6px 8px' } : undefined}>
          <MetricTopologyNode {...props.metric} />
        </div>
      ) : (
        <div
          className="function-topology-node-items"
          role="group"
          aria-label={`${displayName}内容`}
          style={layout ? { width: layout.width + 16, height: layout.height + 12 } : undefined}
        >
          {props.items.map((item) => (
            <div
              className={`function-topology-node-item is-${item.type}`}
              data-function-item={item.type}
              key={item.id}
              style={layout ? { position: 'absolute', left: 8 + layout.entries[props.items.indexOf(item)].x, top: 6 + layout.entries[props.items.indexOf(item)].y } : undefined}
            >
              {renderFormulaItem(item)}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
