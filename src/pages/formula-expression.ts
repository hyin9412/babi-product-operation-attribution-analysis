import type { CalculationOperator } from './CalculationOperatorNode';

export type FormulaReference = {
  id: string;
  title: string;
  formula: string;
  operator?: CalculationOperator;
  children?: FormulaReference[];
};

export type FormulaExpressionItem<T extends FormulaReference> =
  | { id: string; type: 'metric'; node: T }
  | { id: string; type: 'constant'; value: string }
  | { id: string; type: 'operator'; operator: CalculationOperator }
  | { id: string; type: 'expression'; items: FormulaExpressionItem<T>[] }
  | { id: string; type: 'function'; name: string; items: FormulaExpressionItem<T>[] };

const OPERATOR_BY_CHARACTER: Record<string, CalculationOperator> = {
  '+': 'add',
  '-': 'subtract',
  '*': 'multiply',
  '/': 'divide',
};

function descendants<T extends FormulaReference>(node: T): T[] {
  return (node.children || []).flatMap(child => [
    child as T,
    ...descendants(child as T),
  ]);
}

function normalized(value: string) {
  return value
    .replace(/^bytegraph_/i, '')
    .replace(/[\s_]/g, '')
    .toLowerCase();
}

function resolveReference<T extends FormulaReference>(token: string, references: T[]) {
  const candidate = normalized(token);
  if (!candidate) return undefined;

  const matches = references
    .map(node => {
      const title = normalized(node.title);
      const exact = title === candidate;
      const contained = title.endsWith(candidate) || candidate.endsWith(title);
      return { node, score: exact ? 0 : contained ? Math.abs(title.length - candidate.length) + 1 : Number.POSITIVE_INFINITY };
    })
    .sort((a, b) => a.score - b.score);
  return matches[0]?.score < Number.POSITIVE_INFINITY ? matches[0].node : undefined;
}

function fallbackExpression<T extends FormulaReference>(node: T): FormulaExpressionItem<T>[] {
  const children = (node.children || []) as T[];
  return children.flatMap((child, index) => [
    ...(index ? [{
      id: `${node.id}-fallback-operator-${index}`,
      type: 'operator' as const,
      operator: node.operator || 'add',
    }] : []),
    {
      id: `${node.id}-fallback-metric-${child.id}`,
      type: 'metric' as const,
      node: child,
    },
  ]);
}

export function parseFormulaExpression<T extends FormulaReference>(node: T): FormulaExpressionItem<T>[] {
  const source = node.formula
    .replace(/[（]/g, '(')
    .replace(/[）]/g, ')')
    .replace(/[×]/g, '*')
    .replace(/[÷]/g, '/')
    .replace(/^[\s=]+/, '')
    .split(/[；;]/, 1)[0]
    .trim();
  const references = descendants(node).sort((a, b) => b.title.length - a.title.length);
  let index = 0;
  let sequence = 0;

  const nextId = (type: string) => `${node.id}-expression-${type}-${sequence++}`;

  const parseItems = (stopAtClosingBracket = false): FormulaExpressionItem<T>[] => {
    const items: FormulaExpressionItem<T>[] = [];

    while (index < source.length) {
      while (/\s/.test(source[index] || '')) index += 1;
      if (index >= source.length) break;

      if (source[index] === ')') {
        if (stopAtClosingBracket) index += 1;
        break;
      }

      const directReference = references.find(reference => source.startsWith(reference.title, index));
      if (directReference) {
        items.push({ id: nextId('metric'), type: 'metric', node: directReference });
        index += directReference.title.length;
        continue;
      }

      const functionMatch = source.slice(index).match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
      if (functionMatch) {
        const name = functionMatch[1];
        index += functionMatch[0].length;
        items.push({ id: nextId('function'), type: 'function', name, items: parseItems(true) });
        continue;
      }

      if (source[index] === '(') {
        index += 1;
        items.push({ id: nextId('expression'), type: 'expression', items: parseItems(true) });
        continue;
      }

      const operator = OPERATOR_BY_CHARACTER[source[index]];
      if (operator) {
        items.push({ id: nextId('operator'), type: 'operator', operator });
        index += 1;
        continue;
      }

      const numberMatch = source.slice(index).match(/^(?:\d+(?:\.\d+)?|\.\d+)/);
      if (numberMatch) {
        items.push({ id: nextId('constant'), type: 'constant', value: numberMatch[0] });
        index += numberMatch[0].length;
        continue;
      }

      const start = index;
      while (index < source.length && !/[()+\-*/]/.test(source[index])) index += 1;
      const token = source.slice(start, index).trim();
      if (!token) {
        index += 1;
        continue;
      }

      const reference = resolveReference(token, references);
      items.push(reference
        ? { id: nextId('metric'), type: 'metric', node: reference }
        : { id: nextId('constant'), type: 'constant', value: token });
    }

    return items;
  };

  const parsed = parseItems();
  const matchedMetrics = parsed.some(item => item.type === 'metric' || item.type === 'expression' || item.type === 'function');
  return parsed.length && (matchedMetrics || !(node.children?.length))
    ? parsed
    : fallbackExpression(node);
}
