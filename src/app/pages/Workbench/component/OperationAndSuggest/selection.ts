interface IEntityHealthSelectionOption {
  entity_id?: string | number | null;
  problem_count?: number | null;
}

export const getEntityHealthOptionId = (item?: IEntityHealthSelectionOption) =>
  item?.entity_id == null ? '' : String(item.entity_id);

export const normalizeProblemCount = (problemCount?: number | null) => {
  const normalizedProblemCount = Number(problemCount);
  return Number.isFinite(normalizedProblemCount) ? normalizedProblemCount : 0;
};

export const sortEntityHealthOptionsByProblemCount = <T extends IEntityHealthSelectionOption>(options: T[]) =>
  options
    .map((item, originIndex) => ({ item, originIndex }))
    .sort((left, right) => {
      const problemCountDiff =
        normalizeProblemCount(right.item.problem_count) - normalizeProblemCount(left.item.problem_count);
      if (problemCountDiff !== 0) {
        return problemCountDiff;
      }
      return left.originIndex - right.originIndex;
    })
    .map(({ item }) => item);

export const resolveNextProductResourceId = <T extends IEntityHealthSelectionOption>(
  currentResourceId: string | undefined,
  orderedOptions: T[],
) => {
  const validOptionIdSet = new Set(orderedOptions.map(item => getEntityHealthOptionId(item)).filter(Boolean));
  if (currentResourceId && validOptionIdSet.has(currentResourceId)) {
    return currentResourceId;
  }

  return getEntityHealthOptionId(orderedOptions[0]) || undefined;
};
