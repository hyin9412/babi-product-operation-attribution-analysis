/// <reference types="vite/client" />
import themeCss from '@arco-design/theme-ve-o-design/theme.css?raw';

export type ColorToken = { name: string; value: string; category: string };
export type ResolvedColorToken = ColorToken & { hex: string; alpha: number; displayColor: string };
const paletteNames = new Set(['red', 'orangered', 'orange', 'gold', 'yellow', 'lime', 'green', 'cyan', 'blue', 'arcoblue', 'purple', 'pinkpurple', 'magenta', 'gray', 'primary', 'link', 'success', 'danger', 'warning', 'base-grey', 'oranged', 'teal', 'violet']);
const categoryNames: Record<string, string> = {
  primary: '主题色', link: '链接色', success: '成功色', danger: '危险色', warning: '警告色',
  'base-grey': '源力基础灰', oranged: '源力橙色', teal: '源力青色', violet: '源力紫色',
  gray: '基础灰阶', red: '红色', orangered: '橘红色', orange: '橙色', gold: '金色',
  yellow: '黄色', lime: '青柠色', green: '绿色', cyan: '青色', blue: '蓝色',
  arcoblue: '基础蓝色', purple: '紫色', pinkpurple: '粉紫色', magenta: '品红色',
};
function category(name: string, family?: string) {
  if (family) return categoryNames[family] || '基础色阶';
  if (name.startsWith('--color-bg-')) return '背景';
  if (name.startsWith('--color-text-')) return '文字';
  if (name.startsWith('--color-border')) return '描边';
  if (name.startsWith('--color-fill-')) return '填充';
  if (name.startsWith('--color-grey-') || name.startsWith('--color-neutral-')) return '灰阶';
  if (name.startsWith('--color-functional-icon-')) return '功能图标';
  if (name.startsWith('--color-alpha-')) return '透明色';
  if (name.startsWith('--color-primary-')) return '主题色';
  if (name.startsWith('--color-link-')) return '链接色';
  if (name.startsWith('--color-success-')) return '成功色';
  if (name.startsWith('--color-danger-')) return '危险色';
  if (name.startsWith('--color-warning-')) return '警告色';
  return '其他语义色';
}
// Use names from the actual installed theme, not a copied or guessed palette.
const tokenMap = new Map<string, ColorToken>();
for (const match of themeCss.matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)) {
  const name = match[1];
  const family = name.match(/^--(.+)-(?:10|[1-9])$/)?.[1];
  const palette = !!family && paletteNames.has(family);
  if ((!name.startsWith('--color-') && !palette) || tokenMap.has(name)) continue;
  tokenMap.set(name, { name, value: palette ? `rgb(var(${name}))` : `var(${name})`, category: category(name, palette ? family : undefined) });
}
const categoryOrder = ['背景', '文字', '描边', '填充', '主题色', '链接色', '成功色', '危险色', '警告色', '源力基础灰', '源力紫色', '源力青色', '源力橙色', '灰阶', '功能图标', '透明色'];
export const colorTokens = [...tokenMap.values()].sort((a, b) => {
  const rank = (item: ColorToken) => { const index = categoryOrder.indexOf(item.category); return index === -1 ? 100 : index; };
  return rank(a) - rank(b) || a.name.localeCompare(b.name, 'en', { numeric: true });
});
const byValue = new Map(colorTokens.map(token => [token.value, token]));
export const findColorToken = (value: string) => byValue.get(value);
export const isColorValue = (value: string) => /^#[0-9a-f]{6}$/i.test(value) || byValue.has(value);

function readColor(probe: HTMLElement, value: string) {
  probe.style.color = value;
  const computed = getComputedStyle(probe).color;
  const rgb = computed.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/);
  if (!rgb) return { hex: '#000000', alpha: 1, displayColor: computed };
  return {
    hex: `#${rgb.slice(1, 4).map(channel => Math.round(Number(channel)).toString(16).padStart(2, '0')).join('')}`,
    alpha: rgb[4] === undefined ? 1 : Number(rgb[4]),
    displayColor: computed,
  };
}
let resolvedTokens: ResolvedColorToken[] | undefined;
export function getResolvedColorTokens(): ResolvedColorToken[] {
  if (resolvedTokens) return resolvedTokens;
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;';
  document.body.appendChild(probe);
  try { resolvedTokens = colorTokens.map(token => ({ ...token, ...readColor(probe, token.value) })); }
  finally { probe.remove(); }
  return resolvedTokens;
}
export function colorHex(value: string) {
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  return getResolvedColorTokens().find(token => token.value === value)?.hex || '#000000';
}
