import React from 'react';
import { Handle, Position, useNodeId } from '@xyflow/react';

// The formula SVG canvas has no React Flow node context. Keep the same
// anchor contract there, and use the native Handle inside React Flow nodes.
export function TopologyHandle({ nodeId, id, position, type, borderWidth = 0, centered = false, offsetY = 0 }: {
  nodeId?: string;
  id: string;
  position: Position;
  type: 'source' | 'target';
  borderWidth?: number;
  centered?: boolean;
  offsetY?: number;
}) {
  const flowNodeId = useNodeId();
  const style: React.CSSProperties = {
    position: 'absolute',
    top: centered ? `calc(50% + ${offsetY}px)` : position === Position.Top ? -borderWidth : position === Position.Bottom ? '100%' : '50%',
    left: centered || position === Position.Top || position === Position.Bottom ? '50%' : position === Position.Left ? -borderWidth : 'auto',
    right: !centered && position === Position.Right ? -borderWidth : 'auto',
    width: 0,
    height: 0,
    minWidth: 0,
    minHeight: 0,
    border: 0,
    padding: 0,
    opacity: 0,
    pointerEvents: 'none',
    transform: 'translate(-50%, -50%)',
  };

  return flowNodeId ? (
    <Handle id={id} position={position} type={type} isConnectable={false} style={style} />
  ) : (
    <span
      className="group-target-handle"
      data-nodeid={nodeId}
      data-handleid={id}
      data-handletype={type}
      data-handlepos={position}
      style={style}
      aria-hidden
    />
  );
}

export function FormulaSideHandles({ nodeId, borderWidth = 0 }: { nodeId?: string; borderWidth?: number }) {
  return <>
    <TopologyHandle nodeId={nodeId} id="left" position={Position.Left} type="target" borderWidth={borderWidth} />
    <TopologyHandle nodeId={nodeId} id="right" position={Position.Right} type="source" borderWidth={borderWidth} />
  </>;
}

export default function GroupTargetHandle({ nodeId }: { nodeId?: string }) {
  return <TopologyHandle nodeId={nodeId} id="group-target" position={Position.Top} type="target" borderWidth={1} />;
}
