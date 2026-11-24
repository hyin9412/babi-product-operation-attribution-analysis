import React, { useLayoutEffect, useRef, useState } from 'react';

/** One continuous outline for the tab and body, including the Figma sloped corner. */
export default function FormulaGroupFrame({ kind }: { kind: 'function' | 'expression' }) {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0, tab: kind === 'function' ? 120 : 126 });
  useLayoutEffect(() => {
    const parent = ref.current?.parentElement;
    const title = parent?.querySelector(':scope > header');
    if (!parent || !title) return;
    const update = () => setSize({
      width: parent.offsetWidth, height: parent.offsetHeight,
      tab: Math.max(kind === 'function' ? 120 : 126, (title as HTMLElement).offsetWidth + 8),
    });
    const observer = new ResizeObserver(update);
    observer.observe(parent); observer.observe(title); update();
    return () => observer.disconnect();
  }, [kind]);
  const { width: w, height: h, tab } = size;
  const top = tab - 27.0418;
  const slope = tab - 19.825;
  const join = tab - 9.565;
  const path = `M .5 8.5 C .5 4.08172 4.08172 .5 8.5 .5 H ${top}
    C ${top + 3.0808} .5 ${top + 5.8879} 2.26907 ${slope} 5.04836
    L ${join} 26.5 H ${w - 8.5} Q ${w - .5} 26.5 ${w - .5} 34.5
    V ${h - 8.5} Q ${w - .5} ${h - .5} ${w - 8.5} ${h - .5}
    H 8.5 Q .5 ${h - .5} .5 ${h - 8.5} Z`;
  return <svg ref={ref} className="formula-group-frame" width="100%" height="100%" aria-hidden>
    {w > 0 && <path d={path} />}
  </svg>;
}
