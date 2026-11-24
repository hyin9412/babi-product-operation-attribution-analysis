import { cloneStyle, parseStyle, type PlaygroundStyle } from './topology-playground-style';
import { schemeOneStyle } from './topology-scheme-one';
import { schemeTwoStyle } from './topology-scheme-two';
import { schemeThreeStyle } from './topology-scheme-three';

export const schemeStorageKey = 'babi-topology-playground-schemes-v1';
export const schemeOneSeedKey = 'babi-topology-scheme-one-20261123';
export const schemeTwoSeedKey = 'babi-topology-scheme-two-20261123';
export const schemeThreeSeedKey = 'babi-topology-scheme-three-20261123';
export type TopologyScheme = { id: string; name: string; style: PlaygroundStyle; updatedAt: number };
export type SchemeLibrary = { version: 1; schemes: TopologyScheme[]; comparisonIds: string[] };
export const emptyLibrary = (): SchemeLibrary => ({ version: 1, schemes: [], comparisonIds: ['original'] });

export function schemeNameError(name: string, schemes: TopologyScheme[], exceptId?: string) {
  const trimmed = name.trim();
  if (!trimmed) return '请输入方案名称';
  if (trimmed.length > 40) return '方案名称最多40字';
  if (['原始样式', '当前调整'].includes(trimmed)) return '请使用其他名称，避免与对比项重名';
  if (schemes.some(scheme => scheme.id !== exceptId && scheme.name === trimmed)) return '这个方案名称已存在，请换一个名称';
  return '';
}
export function nextSchemeName(schemes: TopologyScheme[]) {
  const numbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  let index = 1;
  while (schemes.some(scheme => scheme.name === `方案${numbers[index - 1] || index}`)) index++;
  return `方案${numbers[index - 1] || index}`;
}
export function parseSchemeLibrary(value: unknown): SchemeLibrary {
  if (!value || typeof value !== 'object') throw new Error('方案库格式无效');
  const library = value as Record<string, unknown>;
  if (library.version !== 1 || !Array.isArray(library.schemes) || !Array.isArray(library.comparisonIds)) throw new Error('方案库版本或结构无效');
  const ids = new Set<string>();
  const schemes: TopologyScheme[] = [];
  for (const entry of library.schemes) {
    if (!entry || typeof entry !== 'object') throw new Error('方案格式无效');
    const item = entry as Record<string, unknown>;
    if (typeof item.id !== 'string' || !/^scheme-[a-zA-Z0-9-]+$/.test(item.id) || ids.has(item.id)) throw new Error('方案标识无效');
    if (typeof item.name !== 'string' || schemeNameError(item.name, schemes)) throw new Error('方案名称无效');
    if (typeof item.updatedAt !== 'number' || !Number.isFinite(item.updatedAt) || item.updatedAt < 0) throw new Error('方案时间无效');
    schemes.push({ id: item.id, name: item.name.trim(), style: parseStyle(item.style), updatedAt: item.updatedAt });
    ids.add(item.id);
  }
  const comparisonIds = [...new Set(library.comparisonIds.filter((id): id is string =>
    typeof id === 'string' && (id === 'original' || id === 'draft' || ids.has(id))
  ))];
  return { version: 1, schemes, comparisonIds };
}
export function readSchemeLibrary(): SchemeLibrary {
  let library = emptyLibrary();
  try {
    const saved = localStorage.getItem(schemeStorageKey);
    if (saved) library = parseSchemeLibrary(JSON.parse(saved));
  } catch { /* Keep a usable library when local storage cannot be read. */ }
  try {
    if (!localStorage.getItem(schemeOneSeedKey)) {
      const previous = library.schemes.find(scheme => scheme.name === '方案一');
      const requested: TopologyScheme = {
        id: previous?.id || 'scheme-requested-one', name: '方案一', style: schemeOneStyle(), updatedAt: Date.now(),
      };
      library = {
        ...library,
        schemes: [...library.schemes.filter(scheme => scheme.id !== requested.id), requested],
        comparisonIds: [...new Set([...library.comparisonIds, 'original', requested.id])],
      };
      localStorage.setItem(schemeStorageKey, JSON.stringify(library));
      localStorage.setItem(schemeOneSeedKey, '1');
    }
    const backgroundKey = 'babi-topology-scheme-one-operator-background-20261123';
    if (!localStorage.getItem(backgroundKey)) {
      library = { ...library, schemes: library.schemes.map(scheme => scheme.name === '方案一' ? {
        ...scheme, updatedAt: Date.now(),
        style: { ...scheme.style, operator: { ...scheme.style.operator, customBackground: true, background: 'var(--color-bg-1)' } },
      } : scheme) };
      localStorage.setItem(schemeStorageKey, JSON.stringify(library));
      localStorage.setItem(backgroundKey, '1');
    }
    if (!localStorage.getItem(schemeTwoSeedKey)) {
      const previous = library.schemes.find(scheme => scheme.name === '方案二');
      const requested: TopologyScheme = {
        id: previous?.id || 'scheme-requested-two', name: '方案二',
        style: schemeTwoStyle(library.schemes.find(scheme => scheme.name === '方案一')?.style), updatedAt: Date.now(),
      };
      library = {
        ...library, schemes: [...library.schemes.filter(scheme => scheme.id !== requested.id), requested],
        comparisonIds: [...new Set([...library.comparisonIds, 'original', requested.id])],
      };
      localStorage.setItem(schemeStorageKey, JSON.stringify(library));
      localStorage.setItem(schemeTwoSeedKey, '1');
    }
    const formulaGapKey = 'babi-topology-scheme-two-formula-gap-20261123';
    if (!localStorage.getItem(formulaGapKey)) {
      library = { ...library, schemes: library.schemes.map(scheme => scheme.name === '方案二' ? {
        ...scheme, updatedAt: Date.now(),
        style: { ...scheme.style, metric: { ...scheme.style.metric, formulaGap: 8 } },
      } : scheme) };
      localStorage.setItem(schemeStorageKey, JSON.stringify(library));
      localStorage.setItem(formulaGapKey, '1');
    }
    if (!localStorage.getItem(schemeThreeSeedKey)) {
      const previous = library.schemes.find(scheme => scheme.name === '方案三');
      const requested: TopologyScheme = {
        id: previous?.id || 'scheme-requested-three', name: '方案三',
        style: schemeThreeStyle(library.schemes.find(scheme => scheme.name === '方案二')?.style), updatedAt: Date.now(),
      };
      library = {
        ...library, schemes: [...library.schemes.filter(scheme => scheme.id !== requested.id), requested],
        comparisonIds: [...new Set([...library.comparisonIds, 'original', requested.id])],
      };
      localStorage.setItem(schemeStorageKey, JSON.stringify(library));
      localStorage.setItem(schemeThreeSeedKey, '1');
    }
  } catch { /* The built-in scheme remains available for loading and export. */ }
  return library;
}
export function createScheme(name: string, style: PlaygroundStyle): TopologyScheme {
  return { id: `scheme-${crypto.randomUUID()}`, name: name.trim(), style: cloneStyle(style), updatedAt: Date.now() };
}
