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
import Modal from '@tod-m/materials/ve-o/es/Modal';
import '@arco-design/theme-ve-o-design/css/arco.css';
import '@tod-m/materials/ve-o/es/PageHeader/style/index.less';
import '../app/styles/global.less';
import '../style.css';
import './analysis.css';
import { FormulaCanvas, type FormulaNode } from './PricingTab';
import { buildRocketMQTree, flattenRocketMQTree } from './rocketmq-model-259';
import { defaultFilters, getRows, targetOptions } from './analysisData';
import { cloneStyle, defaultStyle, fonts, parseStyle, presetStyle, styleCss, type CardStyle, type PlaygroundStyle, type TextStyle } from './topology-playground-style';
import { createScheme, nextSchemeName, readSchemeLibrary, schemeNameError, schemeStorageKey, type SchemeLibrary, type TopologyScheme } from './topology-playground-schemes';
import TopologySchemePanel from './TopologySchemePanel';
import ColorControl from './TopologyColorControl';
import { buildTopologyStyleShowcase, buildTopologyAlignmentShowcase, withPlaygroundStatuses } from './topology-playground-data';
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
  const [field, setField] = useState<'text' | 'formula' | 'value' | 'unit' | 'target' | 'targetValue'>('text');
  const [model, setModel] = useState('showcase');
  const [targets, setTargets] = useState([...defaultFilters.targets]);
  const [original, setOriginal] = useState(false);
  const [saveStatus, setSaveStatus] = useState('本地自动保存');
  const [library, setLibrary] = useState(readSchemeLibrary);
  const [editingSchemeId, setEditingSchemeId] = useState<string | null>(null);
  const [nameDialog, setNameDialog] = useState<{ mode: 'save' | 'rename'; schemeId?: string } | null>(null);
  const [schemeName, setSchemeName] = useState('');
  const [nameError, setNameError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const tree = useMemo(() => withPlaygroundStatuses(model === 'alignment' ? buildTopologyAlignmentShowcase() : model === 'showcase' ? buildTopologyStyleShowcase() : model === 'sample' ? sampleTree() : buildRocketMQTree()), [model]);
  const row = useMemo(() => getRows(defaultFilters)[0], []);
  const [expanded, setExpanded] = useState(() => new Set([tree.id]));
  useEffect(() => { setExpanded(new Set([tree.id])); }, [tree]);
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(style)); setSaveStatus('已自动保存到本机'); }
    catch { setSaveStatus('本机存储不可用，请导出配置'); }
  }, [style]);
  const css = useMemo(() => original ? '' : styleCss(style, '#topology-editor-preview'), [original, style]);
  const editingScheme = library.schemes.find(scheme => scheme.id === editingSchemeId);
  const schemeDirty = !!editingScheme && JSON.stringify(style) !== JSON.stringify(editingScheme.style);
  const persistLibrary = (next: SchemeLibrary) => {
    try {
      localStorage.setItem(schemeStorageKey, JSON.stringify(next));
      setLibrary(next);
      return true;
    } catch {
      Message.error('无法保存方案到本机，请检查浏览器存储空间或导出当前配置');
      return false;
    }
  };
  const loadScheme = (scheme: TopologyScheme) => {
    setStyle(cloneStyle(scheme.style)); setEditingSchemeId(scheme.id); setOriginal(false);
    Message.success(`已加载“${scheme.name}”，可以继续调整`);
  };
  const openSave = () => { setSchemeName(nextSchemeName(library.schemes)); setNameError(''); setNameDialog({ mode: 'save' }); };
  const saveNamedScheme = () => {
    const error = schemeNameError(schemeName, library.schemes, nameDialog?.schemeId);
    if (error) { setNameError(error); return; }
    if (nameDialog?.mode === 'rename') {
      const next = { ...library, schemes: library.schemes.map(scheme => scheme.id === nameDialog.schemeId ? { ...scheme, name: schemeName.trim() } : scheme) };
      if (!persistLibrary(next)) return;
      Message.success('方案已重命名');
    } else {
      const scheme = createScheme(schemeName, style);
      if (!persistLibrary({ ...library, schemes: [...library.schemes, scheme], comparisonIds: [...library.comparisonIds, scheme.id] })) return;
      setEditingSchemeId(scheme.id);
      Message.success(`“${scheme.name}”已保存并加入对比`);
    }
    setNameDialog(null);
  };
  const updateScheme = () => {
    if (!editingScheme) return;
    if (persistLibrary({ ...library, schemes: library.schemes.map(scheme => scheme.id === editingScheme.id ? { ...scheme, style: cloneStyle(style), updatedAt: Date.now() } : scheme) })) Message.success(`“${editingScheme.name}”已更新`);
  };
  const deleteScheme = (scheme: TopologyScheme) => Modal.confirm({
    title: `删除“${scheme.name}”？`, content: '删除后将从方案列表和对比区移除。当前调整会保留。',
    okText: '删除', cancelText: '取消',
    onOk: () => {
      if (!persistLibrary({ ...library, schemes: library.schemes.filter(item => item.id !== scheme.id), comparisonIds: library.comparisonIds.filter(id => id !== scheme.id) })) return Promise.reject(new Error('本地保存失败'));
      if (editingSchemeId === scheme.id) setEditingSchemeId(null);
      Message.success('方案已删除');
    },
  });
  const toggle = (id: string) => setExpanded(items => { const next = new Set(items); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const expandAll = () => setExpanded(new Set(flattenRocketMQTree(tree).filter(n => n.children?.length).map(n => n.id)));
  const collapseAll = () => setExpanded(new Set([tree.id]));
  const update = <K extends Group>(key: K, value: PlaygroundStyle[K]) => { setOriginal(false); setStyle(s => ({ ...s, [key]: value })); };
  const color = (key: keyof PlaygroundStyle['canvas'], label: string) => <Form.Item label={label}><ColorControl label={label} value={style.canvas[key] as string} onChange={value => update('canvas', { ...style.canvas, [key]: value })} /></Form.Item>;
  const number = (key: 'gridGap' | 'gridSize' | 'edgeWidth', label: string, min: number, max: number, step = 1) => <Form.Item label={label}><NumberControl label={label} value={style.canvas[key]} min={min} max={max} step={step} onChange={value => update('canvas', { ...style.canvas, [key]: value })} /></Form.Item>;
  const groupTitle = groups.find(item => item[0] === group)![1];
  const reset = () => { setStyle(cloneStyle(defaultStyle)); setEditingSchemeId(null); setOriginal(false); Message.success('已恢复原始样式'); };
  const importFile = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > 100000) throw new Error('配置文件过大，请选择导出的 JSON 配置');
      const imported = parseStyle(JSON.parse(await file.text()));
      setStyle(imported); setEditingSchemeId(null); setOriginal(false); Message.success('配置已导入');
    } catch (e) { Message.error(e instanceof Error ? e.message : '导入失败'); }
    if (fileRef.current) fileRef.current.value = '';
  };
  return <Layout className="topology-playground">
    <Layout.Content>
      <div className="playground-header">
        <PageHeader.PageHeaderPro title="拓扑图样式 Playground" backIcon={<span>←</span>} onBack={() => { window.location.href = './topology-flow-preview.html'; }}
          subTitle={[{ label: '预览', value: '边调整，边看效果' }, { label: '配置', value: saveStatus }]}
          extra={<div className="playground-actions"><Button onClick={reset}>恢复原始</Button><Button type="primary" onClick={openSave}>保存方案</Button></div>} />
      </div>
      <div className="playground-workspace">
        <aside className="playground-sidebar">
          <div className="playground-presets">
            <h3 className="playground-section-title">从一套配色开始</h3>
            <div className="playground-preset-grid">{presets.map(([key, name, swatch]) => <Button key={key} onClick={() => { setStyle(presetStyle(key)); setEditingSchemeId(null); setOriginal(false); }}><span className="playground-swatch" style={{ background: swatch }} />{name}</Button>)}</div>
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
            </> : group === 'operator' ? <>
              <p className="playground-example-note">加、减、乘、除使用原始 SVG 图标，可单独调整圆形背景色。</p>
              <Form.Item label="自定义背景色"><Switch aria-label="运算符自定义背景色" checked={style.operator.customBackground} onChange={customBackground => update('operator', { ...style.operator, customBackground })} /></Form.Item>
              {style.operator.customBackground && <Form.Item label="背景颜色"><ColorControl label="运算符背景颜色" value={style.operator.background} onChange={background => update('operator', { ...style.operator, background })} /></Form.Item>}
            </> : <>
              {group === 'metric' && <Form.Item label="显示状态 Tag"><Switch aria-label="显示状态 Tag" checked={style.metric.showStatusTag} onChange={showStatusTag => update('metric', { ...style.metric, showStatusTag })} /></Form.Item>}
              {group === 'metric' && <Form.Item label="分隔线左右间距（px）"><NumberControl label="分隔线左右间距" value={style.metric.dividerInset} min={0} max={48} onChange={dividerInset => update('metric', { ...style.metric, dividerInset })} /></Form.Item>}
              {group === 'metric' && <Form.Item label="名称与公式间距（px）"><NumberControl label="名称与公式间距" value={style.metric.formulaGap} min={8} max={32} onChange={formulaGap => update('metric', { ...style.metric, formulaGap })} /></Form.Item>}
              {group === 'metric' && <Form.Item label="卡片形态"><Select aria-label="指标卡片形态" value={style.metric.appearance} options={[{ value: 'classic', label: '原始卡片' }, { value: 'inset', label: '彩色外框 · 白色内容' }]} onChange={appearance => update('metric', { ...style.metric, appearance })} /></Form.Item>}
              {group === 'metric' && <Form.Item label="卡片宽度（px）"><NumberControl label="指标卡片宽度" value={style.metric.width} min={260} max={360} onChange={width => update('metric', { ...style.metric, width })} /></Form.Item>}
              <CardControls title={groupTitle} value={style[group]} onChange={value => update(group, { ...style[group], ...value } as PlaygroundStyle[typeof group])} />
              {(group === 'function' || group === 'expression') && <Form.Item label="容器形态"><Select aria-label={`${groupTitle}容器形态`} value={style[group].appearance} options={[{ value: 'classic', label: '原始浮动 Tag' }, { value: 'folder', label: '斜边 Tag · 连续外框' }, { value: 'inset', label: '彩色外框 · 白色内容' }]} onChange={appearance => update(group, { ...style[group], appearance })} /></Form.Item>}
              {group === 'expression' && <Form.Item label="状态图标"><Select aria-label="括号表达式状态图标" value={style.expression.icon} options={[{ value: 'original', label: '原始图标' }, { value: 'dots', label: '花括号与三点' }]} onChange={icon => update('expression', { ...style.expression, icon })} /></Form.Item>}
              {(group === 'function' || group === 'expression') && <Form.Item label="标题背景色"><ColorControl label={`${groupTitle}标题背景色`} value={style[group].titleBackground} onChange={titleBackground => update(group, { ...style[group], titleBackground })} /></Form.Item>}
              {group === 'function' && <Form.Item label="单指标函数背景色"><ColorControl label="单指标函数背景色" value={style.function.metricBackground} onChange={metricBackground => update('function', { ...style.function, metricBackground })} /></Form.Item>}
              <h3 className="playground-section-title">文字样式</h3>
              {group === 'metric' ? <>
                <Form.Item label="调整字段"><Select aria-label="调整字段" value={field} onChange={setField} options={[{ value: 'text', label: '指标名称' }, { value: 'formula', label: '计算公式' }, { value: 'value', label: '实际值' }, { value: 'unit', label: '单位' }, { value: 'target', label: '目标与偏差' }, { value: 'targetValue', label: '目标与偏差数值' }]} /></Form.Item>
                <TextControls label={{ text: '指标名称', formula: '计算公式', value: '实际值', unit: '单位', target: '目标与偏差', targetValue: '目标与偏差数值' }[field]} value={style.metric[field]} onChange={value => update('metric', { ...style.metric, [field]: value })} />
                <h3 className="playground-section-title">辅助颜色</h3>
                {([['positive', '绿色偏差'], ['negative', '红色偏差'], ['divider', '字段分隔线']] as const).map(([key, label]) => <Form.Item key={key} label={label}><ColorControl label={label} value={style.metric[key]} onChange={value => update('metric', { ...style.metric, [key]: value })} /></Form.Item>)}
              </> : <TextControls label={groupTitle} value={style[group].text} onChange={text => update(group, { ...style[group], text })} />}
            </>}
          </Form>
          <div className="playground-transfer">
            <Button onClick={() => fileRef.current?.click()}>导入配置</Button>
            <Button onClick={() => { download(JSON.stringify(style, null, 2), 'topology-style.json', 'application/json'); Message.success('配置已导出'); }}>导出配置</Button>
            <Button onClick={() => { download(styleCss(style), 'topology-style.css', 'text/css'); Message.success('样式 CSS 已导出'); }}>导出 CSS</Button>
            <input ref={fileRef} type="file" accept=".json,application/json" hidden aria-label="导入配置文件" onChange={e => importFile(e.target.files?.[0])} />
          </div>
        </aside>
        <section className="playground-preview-column">
          <div className="playground-edit-scheme-toolbar">
            <Select aria-label="加载已保存方案" value={editingScheme?.id || 'draft'} placeholder="加载已保存方案"
              options={[{ value: 'draft', label: '当前调整 · 草稿' }, ...library.schemes.map(scheme => ({ value: scheme.id, label: `${scheme.name}${scheme.id === editingSchemeId && schemeDirty ? ' · 有未保存修改' : ''}` }))]}
              onChange={id => { const scheme = library.schemes.find(item => item.id === id); if (scheme) loadScheme(scheme); else setEditingSchemeId(null); }} />
            {editingScheme && <Button size="small" disabled={!schemeDirty} onClick={updateScheme}>更新此方案</Button>}
            <span>{schemeDirty ? '调整尚未更新到已保存方案' : editingScheme ? '已加载保存的样式' : '调好后保存为命名方案'}</span>
          </div>
          <div className="playground-preview-toolbar">
            <Select aria-label="预览模型" value={model} onChange={setModel} options={[{ value: 'showcase', label: '综合样式示例 · 指标与两类函数' }, { value: 'alignment', label: '嵌套对齐示例 · 括号与直接指标' }, { value: 'sample', label: '样式示例 · 全部节点类型' }, { value: 'rocketmq', label: 'RocketMQ · 原模型' }]} />
            <div className="playground-compare"><span>对照原始</span><Switch aria-label="对照原始" checked={original} onChange={setOriginal} /></div>
          </div>
          <div className="playground-target-toolbar">
            <span>目标字段</span>{targetOptions.map(target => <Checkbox key={target} checked={targets.includes(target)} onChange={checked => setTargets(items => targetOptions.filter(option => option === target ? checked : items.includes(option)))}>{target.replace('值', '')}</Checkbox>)}
            <Button size="small" onClick={expandAll}>全部展开</Button>
            <Button size="small" onClick={collapseAll}>收起下层</Button>
          </div>
          <div className="analysis-page topology-playground-preview" id="topology-editor-preview">
            <style>{css}</style>
            <FormulaCanvas tree={tree} row={row} expanded={expanded} toggle={toggle} metricNodeWidth={original ? undefined : style.metric.width}
              metricFormulaGap={original ? undefined : style.metric.formulaGap}
              groupStyle={original ? undefined : { function: style.function.appearance, expression: style.expression.appearance, metric: style.metric.appearance }}
              onTrend={() => Message.info('这里用于观察节点样式；趋势数据请在原预览中查看。')} targets={targets} height="calc(100vh - 314px)" allowFullscreen={false} />
          </div>
          <div className="playground-preview-note">
            <span className="playground-live-dot" /><span>{original ? '正在对照原始样式，关闭后恢复当前配置' : '实时预览'}</span>
            <span>拖动画布平移 · 滚轮缩放 · 点击节点下方展开</span>
          </div>
          <p className="playground-example-note">{model === 'showcase' ? '当前为样式 mock：普通指标、MAX 函数单指标、SUM 函数内公式，以及括号、常量和运算符均在同一张图中。' : '模型数值为示例。'}字段文字按原卡片布局截断，可悬停查看完整内容。导出的 CSS 使用 .topology-playground-preview 作为作用域。</p>
        </section>
      </div>
      <TopologySchemePanel library={library} draft={style} tree={tree} row={row} targets={targets} expanded={expanded} toggle={toggle}
        onExpandAll={expandAll} onCollapseAll={collapseAll}
        onSelect={comparisonIds => { persistLibrary({ ...library, comparisonIds }); }} onLoad={loadScheme}
        onRename={scheme => { setSchemeName(scheme.name); setNameError(''); setNameDialog({ mode: 'rename', schemeId: scheme.id }); }}
        onDelete={deleteScheme} />
      <Modal title={nameDialog?.mode === 'rename' ? '重命名方案' : '保存样式方案'} visible={!!nameDialog} style={{ width: 480 }}
        onCancel={() => setNameDialog(null)} unmountOnExit footer={<><Button onClick={() => setNameDialog(null)}>取消</Button><Button type="primary" onClick={saveNamedScheme}>保存</Button></>}>
        <Form layout="vertical" onSubmit={saveNamedScheme}>
          <Form.Item label="方案名称" validateStatus={nameError ? 'error' : undefined} help={nameError || '保存后可在下方勾选，与原始样式或其他方案一起对比。'}>
            <Input aria-label="方案名称" value={schemeName} maxLength={40} onChange={name => { setSchemeName(name); setNameError(''); }} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout.Content>
  </Layout>;
}

createRoot(document.getElementById('root')!).render(<Playground />);
