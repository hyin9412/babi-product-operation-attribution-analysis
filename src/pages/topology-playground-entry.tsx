import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Layout from '@tod-m/materials/ve-o/es/Layout';
import PageHeader from '@tod-m/materials/ve-o/es/PageHeader';
import Form from '@tod-m/materials/ve-o/es/Form';
import Button from '@tod-m/materials/ve-o/es/Button';
import Select from '@tod-m/materials/ve-o/es/Select';
import Input from '@tod-m/materials/ve-o/es/Input';
import InputNumber from '@tod-m/materials/ve-o/es/InputNumber';
import Slider from '@tod-m/materials/ve-o/es/Slider';
import Switch from '@tod-m/materials/ve-o/es/Switch';
import Checkbox from '@tod-m/materials/ve-o/es/Checkbox';
import Message from '@tod-m/materials/ve-o/es/Message';
import '@arco-design/theme-ve-o-design/css/arco.css';
import '@tod-m/materials/ve-o/es/PageHeader/style/index.less';
import '../app/styles/global.less';
import '../style.css';
import './analysis.css';
import { FormulaCanvas, type FormulaNode } from './PricingTab';
import { buildRocketMQTree, flattenRocketMQTree } from './rocketmq-model-259';
import { defaultFilters, getRows, targetOptions } from './analysisData';
import { cloneStyle, defaultStyle, fonts, parseStyle, presetStyle, styleCss, type CardStyle, type PlaygroundStyle, type TextStyle } from './topology-playground-style';
import './topology-playground.css';

const storageKey = 'babi-topology-playground-v1';
const groups = [
  ['canvas', '画布与连线', '◌'], ['metric', '指标卡片', '▤'], ['function', '函数容器', 'ƒ'],
  ['expression', '括号表达式', '( )'], ['constant', '常量节点', '1'], ['operator', '运算符', '+'],
] as const;
type Group = typeof groups[number][0];
const presets = [
  ['original', '原始样式', '#dde2e9'], ['blue', '清透蓝紫', '#9ebbf4'], ['warm', '温暖纸感', '#d5bd98'], ['dark', '深色画布', '#34475f'],
];

function sampleTree(): FormulaNode {
  const metric = (id: string, title: string, value: number, type: FormulaNode['type'] = 'price', formula = '-'): FormulaNode => ({
    id, title, value, type, formula, unit: type === 'ratio' ? '' : type === 'quantity' ? '核·日' : '元 / 核·日',
    targets: { month: value * 1.04, quarter: value * .96, annual: value * 1.02 },
  });
  const cost = metric('unit-cost', '单位成本', .0348);
  const rate = metric('sale-rate', '综合售卖率', .925, 'ratio');
  const strategy = metric('strategy', '策略加成', .03, 'ratio');
  const root = metric('sample-root', '计算资源 · 测算单价', .0387, 'price', '= SUM(单位成本) / 综合售卖率 × (1 + 策略加成)');
  root.children = [cost, rate, strategy];
  return root;
}

function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const valid = /^#[0-9a-f]{6}$/i.test(draft);
  return <div className="playground-color-control">
    <input type="color" value={value} aria-label={`${label}取色`} onChange={e => onChange(e.target.value)} />
    <Input aria-label={label} value={draft} error={!valid} onChange={next => {
      setDraft(next);
      if (/^#[0-9a-f]{6}$/i.test(next)) onChange(next);
    }} onBlur={() => { if (!valid) setDraft(value); }} />
  </div>;
}
function NumberControl({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void }) {
  return <div className="playground-number-control">
    <Slider aria-label={`${label}滑块`} value={value} min={min} max={max} step={step} onChange={next => onChange(next as number)} />
    <InputNumber aria-label={label} value={value} min={min} max={max} step={step} onChange={next => { if (Number.isFinite(next)) onChange(Math.max(min, Math.min(max, next))); }} />
  </div>;
}
function TextControls({ value, onChange, label }: { value: TextStyle; onChange: (value: TextStyle) => void; label: string }) {
  return <>
    <Form.Item label="字号"><NumberControl label={`${label}字号`} value={value.size} min={10} max={18} onChange={size => onChange({ ...value, size })} /></Form.Item>
    <Form.Item label="字体"><Select aria-label={`${label}字体`} options={fonts} value={value.font} onChange={font => onChange({ ...value, font })} /></Form.Item>
    <Form.Item label="字重"><Select aria-label={`${label}字重`} value={value.weight} options={[{ value: 400, label: '常规 · 400' }, { value: 500, label: '中等 · 500' }, { value: 600, label: '半粗 · 600' }, { value: 700, label: '粗体 · 700' }]} onChange={weight => onChange({ ...value, weight })} /></Form.Item>
    <Form.Item label="文字颜色"><ColorControl label={`${label}文字颜色`} value={value.color} onChange={color => onChange({ ...value, color })} /></Form.Item>
  </>;
}
function CardControls({ value, onChange, title }: { value: CardStyle; onChange: (value: CardStyle) => void; title: string }) {
  return <>
    <Form.Item label="描边颜色"><ColorControl label={`${title}描边颜色`} value={value.border} onChange={border => onChange({ ...value, border })} /></Form.Item>
    <Form.Item label="背景颜色"><ColorControl label={`${title}背景颜色`} value={value.background} onChange={background => onChange({ ...value, background })} /></Form.Item>
    <Form.Item label="圆角"><NumberControl label={`${title}圆角`} value={value.radius} min={0} max={24} onChange={radius => onChange({ ...value, radius })} /></Form.Item>
    <Form.Item label="描边线型"><Select aria-label={`${title}描边线型`} value={value.line} options={[{ value: 'solid', label: '实线' }, { value: 'dashed', label: '虚线' }, { value: 'dotted', label: '点线' }]} onChange={line => onChange({ ...value, line })} /></Form.Item>
    <Form.Item label="阴影大小"><NumberControl label={`${title}阴影大小`} value={value.shadow} min={0} max={24} onChange={shadow => onChange({ ...value, shadow })} /></Form.Item>
  </>;
}

function download(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Playground() {
  const [style, setStyle] = useState(() => {
    try { const saved = localStorage.getItem(storageKey); return saved ? parseStyle(JSON.parse(saved)) : presetStyle('blue'); }
    catch { return presetStyle('blue'); }
  });
  const [group, setGroup] = useState<Group>('canvas');
  const [field, setField] = useState<'text' | 'formula' | 'value' | 'unit' | 'target'>('text');
  const [model, setModel] = useState('sample');
  const [targets, setTargets] = useState([...defaultFilters.targets]);
  const [original, setOriginal] = useState(false);
  const [saveStatus, setSaveStatus] = useState('本地自动保存');
  const fileRef = useRef<HTMLInputElement>(null);
  const tree = useMemo(() => model === 'sample' ? sampleTree() : buildRocketMQTree(), [model]);
  const row = useMemo(() => getRows(defaultFilters)[0], []);
  const [expanded, setExpanded] = useState(new Set(['sample-root']));
  useEffect(() => { setExpanded(new Set([tree.id])); }, [tree]);
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(style)); setSaveStatus('已自动保存到本机'); }
    catch { setSaveStatus('本机存储不可用，请导出配置'); }
  }, [style]);
  const css = useMemo(() => original ? '' : styleCss(style), [original, style]);
  const update = <K extends Group>(key: K, value: PlaygroundStyle[K]) => { setOriginal(false); setStyle(s => ({ ...s, [key]: value })); };
  const color = (key: keyof PlaygroundStyle['canvas'], label: string) => <Form.Item label={label}><ColorControl label={label} value={style.canvas[key] as string} onChange={value => update('canvas', { ...style.canvas, [key]: value })} /></Form.Item>;
  const number = (key: 'gridGap' | 'gridSize' | 'edgeWidth', label: string, min: number, max: number, step = 1) => <Form.Item label={label}><NumberControl label={label} value={style.canvas[key]} min={min} max={max} step={step} onChange={value => update('canvas', { ...style.canvas, [key]: value })} /></Form.Item>;
  const groupTitle = groups.find(item => item[0] === group)![1];
  const reset = () => { setStyle(cloneStyle(defaultStyle)); setOriginal(false); Message.success('已恢复原始样式'); };
  const importFile = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > 100000) throw new Error('配置文件过大，请选择导出的 JSON 配置');
      const imported = parseStyle(JSON.parse(await file.text()));
      setStyle(imported); setOriginal(false); Message.success('配置已导入');
    } catch (e) { Message.error(e instanceof Error ? e.message : '导入失败'); }
    if (fileRef.current) fileRef.current.value = '';
  };
  return <Layout className="topology-playground">
    <Layout.Content>
      <div className="playground-header">
        <PageHeader.PageHeaderPro title="拓扑图样式 Playground" backIcon={<span>←</span>} onBack={() => { window.location.href = './topology-flow-preview.html'; }}
          subTitle={[{ label: '预览', value: '边调整，边看效果' }, { label: '配置', value: saveStatus }]}
          extra={<div className="playground-actions"><Button onClick={reset}>恢复原始</Button><Button type="primary" onClick={() => { download(JSON.stringify(style, null, 2), 'topology-style.json', 'application/json'); Message.success('配置已导出'); }}>导出配置</Button></div>} />
      </div>
      <div className="playground-workspace">
        <aside className="playground-sidebar">
          <div className="playground-presets">
            <h3 className="playground-section-title">从一套配色开始</h3>
            <div className="playground-preset-grid">{presets.map(([key, name, swatch]) => <Button key={key} onClick={() => { setStyle(presetStyle(key)); setOriginal(false); }}><span className="playground-swatch" style={{ background: swatch }} />{name}</Button>)}</div>
          </div>
          <nav className="playground-group-nav" aria-label="样式参数分类">
            {groups.map(([key, title, symbol]) => <button key={key} type="button" aria-pressed={key === group} onClick={() => setGroup(key)}><span>{symbol}</span>{title}</button>)}
          </nav>
          <div className="playground-form-heading"><h3 className="playground-section-title">{groupTitle}</h3><Button type="text" size="small" onClick={() => { update(group, cloneStyle(defaultStyle)[group]); }}>重置本组</Button></div>
          <Form layout="vertical" className="playground-parameter-form">
            {group === 'canvas' ? <>
              {color('background', '画布背景色')}
              <Form.Item label="画布网格"><Select aria-label="画布网格" value={style.canvas.grid} options={[{ value: 'none', label: '关闭网格' }, { value: 'dots', label: '点阵网格' }, { value: 'lines', label: '线条网格' }]} onChange={grid => update('canvas', { ...style.canvas, grid })} /></Form.Item>
              {style.canvas.grid !== 'none' && <>{color('gridColor', '网格颜色')}{number('gridGap', '网格间距', 8, 64)}{number('gridSize', style.canvas.grid === 'dots' ? '圆点半径' : '网格线宽', .5, 3, .5)}</>}
              <h3 className="playground-section-title">连线</h3>
              {color('edge', '连线颜色')}{number('edgeWidth', '连线粗细', .5, 4, .5)}
              <Form.Item label="使用虚线"><Switch aria-label="使用虚线" checked={style.canvas.edgeDashed} onChange={edgeDashed => update('canvas', { ...style.canvas, edgeDashed })} /></Form.Item>
            </> : <>
              <CardControls title={groupTitle} value={style[group]} onChange={value => update(group, { ...style[group], ...value } as PlaygroundStyle[typeof group])} />
              {(group === 'function' || group === 'expression') && <Form.Item label="标题背景色"><ColorControl label={`${groupTitle}标题背景色`} value={style[group].titleBackground} onChange={titleBackground => update(group, { ...style[group], titleBackground })} /></Form.Item>}
              <h3 className="playground-section-title">文字样式</h3>
              {group === 'metric' ? <>
                <Form.Item label="调整字段"><Select aria-label="调整字段" value={field} onChange={setField} options={[{ value: 'text', label: '指标名称' }, { value: 'formula', label: '计算公式' }, { value: 'value', label: '实际值' }, { value: 'unit', label: '单位' }, { value: 'target', label: '目标与偏差' }]} /></Form.Item>
                <TextControls label={{ text: '指标名称', formula: '计算公式', value: '实际值', unit: '单位', target: '目标与偏差' }[field]} value={style.metric[field]} onChange={value => update('metric', { ...style.metric, [field]: value })} />
                <h3 className="playground-section-title">辅助颜色</h3>
                {([['positive', '绿色偏差'], ['negative', '红色偏差'], ['divider', '字段分隔线']] as const).map(([key, label]) => <Form.Item key={key} label={label}><ColorControl label={label} value={style.metric[key]} onChange={value => update('metric', { ...style.metric, [key]: value })} /></Form.Item>)}
              </> : <TextControls label={groupTitle} value={style[group].text} onChange={text => update(group, { ...style[group], text })} />}
            </>}
          </Form>
          <div className="playground-transfer">
            <Button onClick={() => fileRef.current?.click()}>导入配置</Button>
            <Button onClick={() => { download(styleCss(style), 'topology-style.css', 'text/css'); Message.success('样式 CSS 已导出'); }}>导出 CSS</Button>
            <input ref={fileRef} type="file" accept=".json,application/json" hidden aria-label="导入配置文件" onChange={e => importFile(e.target.files?.[0])} />
          </div>
        </aside>
        <section className="playground-preview-column">
          <div className="playground-preview-toolbar">
            <Select aria-label="预览模型" value={model} onChange={setModel} options={[{ value: 'sample', label: '样式示例 · 全部节点类型' }, { value: 'rocketmq', label: 'RocketMQ · 原模型' }]} />
            <div className="playground-compare"><span>对照原始</span><Switch aria-label="对照原始" checked={original} onChange={setOriginal} /></div>
          </div>
          <div className="playground-target-toolbar">
            <span>目标字段</span>{targetOptions.map(target => <Checkbox key={target} checked={targets.includes(target)} onChange={checked => setTargets(items => targetOptions.filter(option => option === target ? checked : items.includes(option)))}>{target.replace('值', '')}</Checkbox>)}
            <Button size="small" onClick={() => setExpanded(new Set(flattenRocketMQTree(tree).filter(n => n.children?.length).map(n => n.id)))}>全部展开</Button>
            <Button size="small" onClick={() => setExpanded(new Set([tree.id]))}>收起下层</Button>
          </div>
          <div className="analysis-page topology-playground-preview">
            <style>{css}</style>
            <FormulaCanvas tree={tree} row={row} expanded={expanded} toggle={id => setExpanded(items => { const next = new Set(items); if (next.has(id)) next.delete(id); else next.add(id); return next; })}
              onTrend={() => Message.info('这里用于观察节点样式；趋势数据请在原预览中查看。')} targets={targets} height="calc(100vh - 270px)" allowFullscreen={false} />
          </div>
          <div className="playground-preview-note">
            <span className="playground-live-dot" /><span>{original ? '正在对照原始样式，关闭后恢复当前配置' : '实时预览'}</span>
            <span>拖动画布平移 · 滚轮缩放 · 点击节点下方展开</span>
          </div>
          <p className="playground-example-note">模型数值为示例。字段文字按原卡片布局截断，可悬停查看完整内容。导出的 CSS 使用 .topology-playground-preview 作为作用域。</p>
        </section>
      </div>
    </Layout.Content>
  </Layout>;
}

createRoot(document.getElementById('root')!).render(<Playground />);
