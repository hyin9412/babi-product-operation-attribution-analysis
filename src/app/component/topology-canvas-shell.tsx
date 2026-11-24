import React, {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import Button from '@tod-m/materials/ve-o/es/Button';
import { IconRichText, IconExitRichText } from '@arco-design/iconbox-react-ve-o-design';
import Popover from '../../pages/AnalysisPopover';
import zoomInIcon from '../static/icon/放大.svg';
import zoomOutIcon from '../static/icon/缩小.svg';
import fitViewIcon from '../static/icon/适配.svg';
import './topology-canvas-shell.css';

export type TopologyCanvasLegendItem = {
  id: string;
  label: string;
  variant?: 'initiator' | 'regular';
};

export type TopologyCanvasViewport = {
  x: number;
  y: number;
  scale: number;
};

export type TopologyCanvasShellProps = {
  title?: ReactNode;
  className?: string;
  style?: CSSProperties;
  height?: number | string;
  minHeight?: number | string;
  canvasWidth?: number;
  canvasHeight?: number;
  minZoom?: number;
  maxZoom?: number;
  fitPadding?: number;
  showLegend?: boolean;
  legendItems?: TopologyCanvasLegendItem[];
  iconBasePath?: string;
  children?: ReactNode;
  viewport?: TopologyCanvasViewport;
  onViewportChange?: (viewport: TopologyCanvasViewport) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
};

const DEFAULT_LEGEND_ITEMS: TopologyCanvasLegendItem[] = [
  { id: 'initiator', label: '发起方节点', variant: 'initiator' },
  { id: 'regular', label: '上下游节点', variant: 'regular' },
];

const DEFAULT_VIEWPORT: TopologyCanvasViewport = {
  x: 0,
  y: 0,
  scale: 1,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function toCssSize(value: number | string | undefined) {
  return typeof value === 'number' ? `${value}px` : value;
}

export function TopologyCanvasShell({
  title = '调整链路',
  className,
  style,
  height = 600,
  minHeight,
  canvasWidth = 1520,
  canvasHeight = 980,
  minZoom = 0.35,
  maxZoom = 2.4,
  fitPadding = 24,
  showLegend = true,
  legendItems = DEFAULT_LEGEND_ITEMS,
  iconBasePath,
  children,
  viewport: controlledViewport,
  onViewportChange,
  isFullscreen = false,
  onToggleFullscreen,
}: TopologyCanvasShellProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [localViewport, setViewport] = useState<TopologyCanvasViewport>(DEFAULT_VIEWPORT);
  const viewport = controlledViewport ?? localViewport;
  const [isDragging, setIsDragging] = useState(false);

  const updateViewport = useCallback(
    (nextViewport: TopologyCanvasViewport) => {
      setViewport(nextViewport);
      onViewportChange?.(nextViewport);
    },
    [onViewportChange]
  );

  const fitView = useCallback(() => {
    const svg = svgRef.current;
    // Modal entry transforms affect boundingClientRect, but not SVG layout size.
    const width = svg?.clientWidth;
    const height = svg?.clientHeight;

    if (!width || !height) {
      return;
    }

    const nextScale = clamp(
      Math.min(
        (width - fitPadding * 2) / canvasWidth,
        (height - fitPadding * 2) / canvasHeight
      ),
      minZoom,
      maxZoom
    );

    updateViewport({
      scale: nextScale,
      x: (width - canvasWidth * nextScale) / 2,
      y: (height - canvasHeight * nextScale) / 2,
    });
  }, [canvasHeight, canvasWidth, fitPadding, maxZoom, minZoom, updateViewport]);

  const zoomAt = useCallback(
    (factor: number, clientX?: number, clientY?: number) => {
      const rect = svgRef.current?.getBoundingClientRect();

      if (!rect?.width || !rect?.height) {
        return;
      }

      const anchorX = clientX == null ? rect.width / 2 : clientX - rect.left;
      const anchorY = clientY == null ? rect.height / 2 : clientY - rect.top;
      const nextScale = clamp(viewport.scale * factor, minZoom, maxZoom);
      const graphX = (anchorX - viewport.x) / viewport.scale;
      const graphY = (anchorY - viewport.y) / viewport.scale;

      updateViewport({
        scale: nextScale,
        x: anchorX - graphX * nextScale,
        y: anchorY - graphY * nextScale,
      });
    },
    [maxZoom, minZoom, updateViewport, viewport]
  );

  useEffect(() => {
    fitView();

    if (!svgRef.current || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(() => {
      fitView();
    });

    resizeObserver.observe(svgRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [fitView, isFullscreen]);

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    lastPointRef.current = { x: event.clientX, y: event.clientY };
    setIsDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!isDragging || !lastPointRef.current) {
      return;
    }

    const deltaX = event.clientX - lastPointRef.current.x;
    const deltaY = event.clientY - lastPointRef.current.y;
    lastPointRef.current = { x: event.clientX, y: event.clientY };

    updateViewport({
      ...viewport,
      x: viewport.x + deltaX,
      y: viewport.y + deltaY,
    });
  };

  const handlePointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    lastPointRef.current = null;
    setIsDragging(false);
  };

  const handleWheel = (event: ReactWheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    zoomAt(event.deltaY < 0 ? 1.1 : 0.9, event.clientX, event.clientY);
  };

  const rootStyle: CSSProperties = {
    ...style,
    height: toCssSize(height),
    minHeight: toCssSize(minHeight),
  };
  const iconSrc = (name: string, importedIcon: string) =>
    iconBasePath ? `${iconBasePath}/${name}.svg` : importedIcon;

  return (
    <section className={['topology-canvas-shell', className].filter(Boolean).join(' ')} style={rootStyle}>
      <header className="topology-canvas-shell-header">
        <div className="topology-canvas-shell-title">{title}</div>
        <div className="topology-canvas-shell-header-actions">
        {showLegend ? (
          <div className="topology-canvas-shell-legend" aria-label="拓扑图图例">
            {legendItems.map((item) => (
              <span className="topology-canvas-shell-legend-item" key={item.id}>
                <span className={`topology-canvas-shell-legend-dot is-${item.variant || 'regular'}`} />
                <span>{item.label}</span>
              </span>
            ))}
          </div>
        ) : null}
        {onToggleFullscreen ? <Popover content={isFullscreen ? '退出全屏' : '全屏'} position="bottom">
          <Button
            className="topology-canvas-shell-fullscreen"
            type="outline"
            size="small"
            shape="square"
            aria-label={isFullscreen ? '退出全屏' : '全屏'}
            icon={isFullscreen ? <IconExitRichText width="16" height="16" /> : <IconRichText width="16" height="16" />}
            onClick={onToggleFullscreen}
          />
        </Popover> : null}
        </div>
      </header>

      <div className="topology-canvas-shell-stage">
        <svg
          ref={svgRef}
          className={['topology-canvas-shell-svg', isDragging ? 'is-dragging' : ''].filter(Boolean).join(' ')}
          role="img"
          aria-label="空白拓扑图画布"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
        >
          <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.scale})`}>
            <rect
              className="topology-canvas-shell-hit-area"
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
            />
            {children}
          </g>
        </svg>

        <div className="topology-canvas-shell-controls" aria-label="画布缩放控制">
          <button type="button" className="topology-canvas-shell-control" aria-label="放大" title="放大" onClick={() => zoomAt(1.15)}>
            <img src={iconSrc('放大', zoomInIcon)} className="topology-canvas-shell-control-icon" alt="" />
          </button>
          <button type="button" className="topology-canvas-shell-control" aria-label="缩小" title="缩小" onClick={() => zoomAt(0.87)}>
            <img src={iconSrc('缩小', zoomOutIcon)} className="topology-canvas-shell-control-icon" alt="" />
          </button>
          <button type="button" className="topology-canvas-shell-control" aria-label="适配画布" title="适配画布" onClick={fitView}>
            <img src={iconSrc('适配', fitViewIcon)} className="topology-canvas-shell-control-icon" alt="" />
          </button>
        </div>
      </div>
    </section>
  );
}
