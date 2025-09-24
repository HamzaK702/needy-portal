// utils/progress.ts
export const calculateProgress = (
  raised: number | undefined,
  required: number | undefined
): number => {
  if (!raised || !required || required <= 0) return 0;
  const progress = (raised / required) * 100;
  return parseFloat(Math.min(progress, 100).toFixed(2)); // number with 2 decimals
};
