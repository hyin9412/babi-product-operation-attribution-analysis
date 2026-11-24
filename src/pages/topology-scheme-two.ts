import { cloneStyle, type PlaygroundStyle } from './topology-playground-style';
import { schemeOneStyle } from './topology-scheme-one';

export function schemeTwoStyle(base: PlaygroundStyle = schemeOneStyle()) {
  const style = cloneStyle(base);
  style.metric.formulaGap = 8;
  style.metric.value = { ...style.metric.value, size: 18, font: 'roboto', weight: 500 };
  style.operator.customBackground = true;
  style.operator.background = 'var(--color-bg-4)';
  Object.assign(style.function, {
    appearance: 'folder', background: '#FFF8EB', metricBackground: '#FFF8EB',
    titleBackground: '#FFF8EB', border: '#FFCE7A', radius: 8, line: 'dashed',
    text: { ...style.function.text, size: 12, weight: 500, color: '#FF8A00' },
  });
  Object.assign(style.expression, {
    appearance: 'folder', icon: 'dots', background: '#F3FEFF',
    titleBackground: '#F3FEFF', border: '#94EFFF', radius: 8, line: 'dashed',
    text: { ...style.expression.text, size: 12, weight: 500, color: '#1AC6FF' },
  });
  return style;
}
