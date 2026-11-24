import React, { useLayoutEffect, useRef } from 'react';

const MIN_COLUMN_WIDTH = 276;

// All rows use the same tracks; the container determines how many fit.
export default function AnalysisFilterGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    const update = () => {
      const gap = parseFloat(getComputedStyle(grid).columnGap) || 12;
      const columns = Math.max(1, Math.floor((grid.getBoundingClientRect().width + gap) / (MIN_COLUMN_WIDTH + gap)));
      grid.style.setProperty('--filter-columns', String(columns));
      grid.dataset.queryNewRow = String((grid.children.length - 1) % columns === 0);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(grid);
    return () => observer.disconnect();
  }, [children]);

  return <div ref={ref} className={`filter-grid ${className}`.trim()}>{children}</div>;
}
