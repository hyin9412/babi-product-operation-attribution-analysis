import React from 'react';
import * as Arco from '@arco-design/web-react';

export * from '@arco-design/web-react';

export const SelectBlock = (_props: any) => null;
export const RichTextEditor = ({ value }: { value?: string }) => <div>{value}</div>;
export const TodUserBlock = ({ children, userName }: { children?: React.ReactNode; userName?: string }) => (
  <span>{children || userName || '-'}</span>
);

export const Trigger = (Arco as any).Trigger || (({ children }: { children?: React.ReactNode }) => <>{children}</>);

