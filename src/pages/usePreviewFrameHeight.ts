import { useEffect, type RefObject } from 'react';

export function usePreviewFrameHeight(previewRef: RefObject<HTMLElement>, type: string) {
  useEffect(() => {
    if (window.parent === window) return;
    const preview = previewRef.current;
    if (!preview) return;
    let frame = 0;
    const reportHeight = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const height = Math.ceil(preview.getBoundingClientRect().height);
        if (height > 0) window.parent.postMessage({ type, height }, window.location.origin);
      });
    };
    const observer = new ResizeObserver(reportHeight);
    observer.observe(preview);
    reportHeight();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [previewRef, type]);
}
