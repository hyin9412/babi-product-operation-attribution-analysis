import React, { useEffect, useMemo, useState } from 'react';
import Select from '@tod-m/materials/ve-o/es/Select';
import Input from '@tod-m/materials/ve-o/es/Input';
import { colorHex, findColorToken, getResolvedColorTokens } from './topology-color-tokens';

export default function TopologyColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [draft, setDraft] = useState(() => colorHex(value));
  useEffect(() => setDraft(colorHex(value)), [value]);
  const tokens = useMemo(getResolvedColorTokens, []);
  const selected = findColorToken(value);
  const selectedColor = selected ? tokens.find(token => token.value === value) : undefined;
  const valid = /^#[0-9a-f]{6}$/i.test(draft);
  const options = useMemo(() => [
    { value: 'custom', label: '自定义色值', extra: '自定义 custom hex' },
    ...tokens.map(token => ({
      value: token.value,
      extra: `${token.name} ${token.category} ${token.hex}`,
      label: <span className="playground-token-option">
        <span className="playground-token-swatch" style={{ background: token.displayColor }} />
        <span className="playground-token-description"><span className="playground-token-name">{token.name}</span><span className="playground-token-category">{token.category}</span></span>
        <span className="playground-token-hex">{token.hex}{token.alpha < 1 ? ` / ${Math.round(token.alpha * 100)}%` : ''}</span>
      </span>,
    })),
  ], [tokens]);
  return <div className="playground-color-field">
    <div className="playground-color-control">
      <input type="color" value={colorHex(value)} aria-label={`${label}取色`} onChange={e => onChange(e.target.value)} />
      <Input aria-label={label} value={draft} error={!valid} onChange={next => {
        setDraft(next);
        if (/^#[0-9a-f]{6}$/i.test(next)) onChange(next);
      }} onBlur={() => { if (!valid) setDraft(colorHex(value)); }} />
    </div>
    <Select aria-label={`${label}源力Token`} value={selected ? value : 'custom'} options={options} showSearch
      placeholder="搜索源力颜色 Token"
      filterOption={(input, option) => String(option.props.extra || option.props.value).toLowerCase().includes(input.trim().toLowerCase())}
      renderFormat={(_option, selectedValue) => selectedValue === 'custom' ? '自定义色值 · 可选择源力 Token' : <span className="playground-token-selected">
        <span className="playground-token-swatch" style={{ background: value }} />{selected?.name}
      </span>}
      dropdownMenuClassName="playground-token-menu" dropdownMenuStyle={{ maxWidth: 'calc(100vw - 32px)' }}
      onChange={next => onChange(next === 'custom' ? colorHex(value) : next)} />
    {selectedColor && <span className="playground-token-current">{selectedColor.category} Token{selectedColor.alpha < 1 ? ` · 不透明度 ${Math.round(selectedColor.alpha * 100)}%` : ''} · 已保留名称，手动改色后转为自定义</span>}
  </div>;
}
