// utils/progress.ts
export const calculateProgress = (
  raised: number | undefined,
  required: number | undefined
): string => {
  if (!raised || !required || required <= 0) return "0.00";
  const progress = (raised / required) * 100;
  return Math.min(progress, 100).toFixed(2); // capped at 100, 2 decimals
};
