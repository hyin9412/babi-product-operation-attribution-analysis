import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Checkbox from '@tod-m/materials/ve-o/es/Checkbox';
import '@arco-design/theme-ve-o-design/css/arco.css';
import '../app/styles/global.less';
import '../style.css';
import './analysis.css';
import PricingTab from './PricingTab';
import RocketMQTopologyPreview from './RocketMQTopologyPreview';
import { AnalysisSelect as Select } from './analysisUI';
import { defaultFilters, targetOptions } from './analysisData';
import './topology-preview.css';

function TopologyPreview() {
  const [targets, setTargets] = useState<string[]>([...defaultFilters.targets]);
  const [model, setModel] = useState('rocketmq');
  return <main className="analysis-page topology-guide-preview">
    <div className="topology-guide-model-select">
      <Select
        addBefore="模型示例"
        value={model}
        options={[
          { value: 'rocketmq', label: 'RocketMQ 商品定价模型 · v1' },
          { value: 'bytegraph', label: 'Bytegraph 计算层资源定价公式' },
        ]}
        onChange={setModel}
      />
    </div>
    <fieldset className="topology-guide-targets">
      <legend>目标选择</legend>
      {targetOptions.map(target => <Checkbox
        key={target}
        checked={targets.includes(target)}
        onChange={checked => setTargets(current => targetOptions.filter(option =>
          option === target ? checked : current.includes(option)
        ))}
      >{target.replace('值', '')}</Checkbox>)}
    </fieldset>
    {model === 'rocketmq'
      ? <RocketMQTopologyPreview targets={targets} />
      : <PricingTab filters={{ ...defaultFilters, targets }} onDrill={() => {}} topologyOnly />}
  </main>;
}

createRoot(document.getElementById('root')!).render(<TopologyPreview />);
