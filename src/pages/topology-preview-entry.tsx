import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Checkbox from '@tod-m/materials/ve-o/es/Checkbox';
import Tag from '@tod-m/materials/ve-o/es/Tag';
import '@arco-design/theme-ve-o-design/css/arco.css';
import '../app/styles/global.less';
import '../style.css';
import './analysis.css';
import PricingTab from './PricingTab';
import RocketMQTopologyPreview from './RocketMQTopologyPreview';
import { AnalysisSelect as Select, OverflowText } from './analysisUI';
import { defaultFilters, targetOptions } from './analysisData';
import './topology-preview.css';
import TopologySpacingPreview from './TopologySpacingPreview';
import { usePreviewFrameHeight } from './usePreviewFrameHeight';

function ModelLabel({ name, hasFunction = false }: { name: string; hasFunction?: boolean }) {
  return <span className="topology-guide-model-option">
    <OverflowText className="topology-guide-model-name">{name}</OverflowText>
    {hasFunction && <Tag size="small" color="blue">含函数节点</Tag>}
  </span>;
}

function TopologyPreview() {
  const previewRef = useRef<HTMLElement>(null);
  usePreviewFrameHeight(previewRef, 'topology-model-height');
  const canvasHeight = window.parent !== window ? '460px' : undefined;
  const [targets, setTargets] = useState<string[]>([...defaultFilters.targets]);
  const [model, setModel] = useState('rocketmq');
  return <main className="analysis-page topology-guide-preview" ref={previewRef}>
    <div className="topology-guide-model-row">
      <div className="topology-guide-model-select">
        <Select
          addBefore="模型示例"
          value={model}
          options={[
            { value: 'rocketmq', label: <ModelLabel name="RocketMQ 商品定价模型 · v1" hasFunction /> },
            { value: 'bytegraph', label: <ModelLabel name="Bytegraph 计算层资源定价公式" /> },
          ]}
          renderFormat={(option, value) => option?.label ?? option?.children ?? value}
          onChange={setModel}
        />
      </div>
      <div className="topology-guide-targets" role="group" aria-label="目标选择">
        {targetOptions.map(target => <Checkbox
          key={target}
          checked={targets.includes(target)}
          onChange={checked => setTargets(current => targetOptions.filter(option =>
            option === target ? checked : current.includes(option)
          ))}
        >{target.replace('值', '')}</Checkbox>)}
      </div>
    </div>
    {model === 'rocketmq'
      ? <RocketMQTopologyPreview targets={targets} height={canvasHeight} />
      : <PricingTab filters={{ ...defaultFilters, targets }} onDrill={() => {}} topologyOnly topologyCanvasHeight={canvasHeight} />}
  </main>;
}

const spacing = new URLSearchParams(window.location.search).get('example') === 'spacing';
createRoot(document.getElementById('root')!).render(spacing ? <TopologySpacingPreview /> : <TopologyPreview />);
