import { cloneStyle, defaultStyle } from './topology-playground-style';

export function schemeOneStyle() {
  const style = cloneStyle(defaultStyle);
  style.metric.width = 278; // 276px content = 252px divider + 12px on each side.
  style.metric.dividerInset = 12;
  style.metric.text = { ...style.metric.text, size: 14, weight: 500, color: 'rgb(var(--primary-6))' };
  style.metric.formula.color = 'var(--color-text-3)';
  style.metric.value = { ...style.metric.value, size: 14, weight: 500, font: 'roboto' };
  style.metric.targetValue = { ...style.metric.targetValue, size: 12, weight: 500, font: 'roboto' };
  style.metric.radius = 8;
  style.metric.shadow = 0;
  Object.assign(style.expression, {
    titleBackground: '#E6FDFF', border: '#94EFFF', background: '#F3FEFF', radius: 8, line: 'dashed', shadow: 0,
    text: { ...style.expression.text, color: '#1AC6FF' },
  });
  Object.assign(style.function, {
    titleBackground: '#FFF2D6', border: '#FFCE7A', background: '#FFF8EB', metricBackground: '#ffffff', radius: 8, line: 'dashed', shadow: 0,
    text: { ...style.function.text, color: '#FF8A00' },
  });
  style.constant.shadow = 0;
  style.operator.shadow = 0;
  style.operator.customBackground = true;
  style.operator.background = 'var(--color-bg-1)';
  return style;
}
