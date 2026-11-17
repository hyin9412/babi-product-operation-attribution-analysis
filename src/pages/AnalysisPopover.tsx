import React from 'react';
import SourcePopover from '@tod-m/materials/ve-o/es/Popover';
import type { PopoverProps } from '@tod-m/materials/ve-o/es/Popover';

// Use the Source Design component, including its white panel and arrow.
export default function AnalysisPopover({className, ...props}:PopoverProps) {
  const classes=Array.isArray(className)?className.join(' '):className||'';
  return <SourcePopover trigger="hover" unmountOnExit {...props} className={`analysis-popover ${classes}`.trim()}/>;
}
