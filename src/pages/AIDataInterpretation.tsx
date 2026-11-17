// Reference: Figma lX5i7W9KsKxtSVrXIuLZC0 / 4248:58316.
import React, {useEffect, useId, useState} from 'react';
import {Button, Message} from '@byted-babi/babi-design';
import Popover from './AnalysisPopover';
import {IconCopy, IconThumbDown, IconThumbUp} from '@arco-design/iconbox-react-ve-o-design';
import './ai-data-interpretation.css';

const contentText = (node:React.ReactNode):string => {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(contentText).join('');
  if (React.isValidElement<{children?:React.ReactNode}>(node)) return contentText(node.props.children);
  return '';
};

function SummaryAIIcon() {
  const gradientId = useId();
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M15.833 1.66699C16.5234 1.66699 17.083 2.22784 17.083 2.91992V9.11426C17.083 9.54573 16.7332 9.89551 16.3018 9.89551C15.8704 9.89532 15.5205 9.54561 15.5205 9.11426V3.2334H3.64551V16.7666H10.1748C10.6073 16.7666 10.9578 17.1174 10.958 17.5498C10.958 17.9824 10.6074 18.333 10.1748 18.333H3.33301C2.64281 18.3328 2.08301 17.772 2.08301 17.0801V2.91992C2.08301 2.22795 2.64281 1.66718 3.33301 1.66699H15.833ZM14.4346 12.3135C14.5915 11.7288 15.4211 11.7289 15.5781 12.3135C15.8535 13.3422 16.6578 14.1465 17.6865 14.4219C18.2712 14.5788 18.2712 15.4085 17.6865 15.5654C16.6616 15.8398 15.8599 16.6396 15.584 17.6641L15.5781 17.6865C15.4208 18.2706 14.5919 18.2706 14.4346 17.6865C14.1558 16.6521 13.3479 15.8442 12.3135 15.5654C11.7294 15.4081 11.7294 14.5792 12.3135 14.4219L12.3359 14.416C13.3604 14.1401 14.1602 13.3384 14.4346 12.3135ZM10.042 10C10.502 10.0001 10.8748 10.373 10.875 10.833C10.875 11.2932 10.5021 11.6668 10.042 11.667H6.33301C5.87295 11.6668 5.5 11.2931 5.5 10.833C5.50018 10.373 5.87306 10.0002 6.33301 10H10.042ZM12.667 5.75C13.127 5.75015 13.4998 6.12302 13.5 6.58301C13.5 7.04315 13.1271 7.41684 12.667 7.41699H6.33301C5.87294 7.41679 5.5 7.04312 5.5 6.58301C5.50019 6.12305 5.87306 5.7502 6.33301 5.75H12.667Z" fill={`url(#${gradientId})`}/>
    <defs><linearGradient id={gradientId} x1="2.08301" y1="34.1657" x2="27.4751" y2="28.9081" gradientUnits="userSpaceOnUse">
      <stop offset=".1" stopColor="#3B91FF"/><stop offset=".5" stopColor="#0D5EFF"/><stop offset=".85" stopColor="#C069FF"/>
    </linearGradient></defs>
  </svg>;
}

export default function AIDataInterpretation({items, id, context='数据解读'}:{
  items:React.ReactNode[];
  id?:string;
  context?:string;
}) {
  const [feedback, setFeedback] = useState<'up'|'down'|null>(null);
  const copyText = items.map(contentText).filter(Boolean).join('\n');
  useEffect(() => setFeedback(null), [copyText]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      Message.success('解读内容已复制');
    } catch {
      Message.error('复制失败，请选择解读内容后复制');
    }
  };
  return <section id={id} className="ai-data-interpretation" aria-label={context}>
    <header className="ai-interpretation-heading">
      <SummaryAIIcon/>
      <h3>数据解读</h3>
      <span className="ai-interpretation-caption">基于当前筛选数据</span>
    </header>
    <ul className="ai-interpretation-content">
      {items.map((item,index)=><li key={index}>{item}</li>)}
    </ul>
    <div className="ai-interpretation-actions" role="group" aria-label={`${context}操作`}>
      <Popover content="满意"><Button type="text" size="mini" shape="square" aria-label="满意" aria-pressed={feedback==='up'} className={feedback==='up'?'is-selected':undefined} icon={<IconThumbUp width={16} height={16}/>} onClick={()=>setFeedback(current=>current==='up'?null:'up')}/></Popover>
      <Popover content="不满意"><Button type="text" size="mini" shape="square" aria-label="不满意" aria-pressed={feedback==='down'} className={feedback==='down'?'is-selected':undefined} icon={<IconThumbDown width={16} height={16}/>} onClick={()=>setFeedback(current=>current==='down'?null:'down')}/></Popover>
      <span className="ai-interpretation-divider" aria-hidden="true"/>
      <Popover content="复制"><Button type="text" size="mini" shape="square" aria-label="复制解读" icon={<IconCopy width={16} height={16}/>} onClick={copy}/></Popover>
    </div>
  </section>;
}
