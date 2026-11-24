import { cloneStyle, type PlaygroundStyle } from './topology-playground-style';
import { schemeTwoStyle } from './topology-scheme-two';

export function schemeThreeStyle(base: PlaygroundStyle = schemeTwoStyle()) {
  const style = cloneStyle(base);
  Object.assign(style.metric, {
    appearance: 'inset', background: '#EBF1FF', titleBackground: '#EBF1FF',
    border: '#EBF1FF', radius: 8, dividerInset: 10, showStatusTag: false,
    text: { ...style.metric.text, color: 'rgb(var(--primary-6))' },
  });
  style.operator.customBackground = true;
  style.operator.background = 'var(--color-bg-4)';
  Object.assign(style.function, {
    appearance: 'inset', background: '#F2EAFB', metricBackground: '#F2EAFB',
    titleBackground: '#F2EAFB', border: '#F2EAFB', radius: 8, line: 'solid',
    text: { ...style.function.text, size: 14, weight: 500, color: '#6E4C9F' },
  });
  Object.assign(style.expression, {
    appearance: 'inset', icon: 'dots', background: '#E4F3FC',
    titleBackground: '#E4F3FC', border: '#E4F3FC', radius: 8, line: 'solid',
    text: { ...style.expression.text, size: 14, weight: 500, color: '#24758E' },
  });
  return style;
}
