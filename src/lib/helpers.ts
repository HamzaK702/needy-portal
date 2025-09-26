// utils/progress.ts
export const calculateProgress = (
  raised: number | undefined,
  required: number | undefined
): number => {
  if (!raised || !required || required <= 0) return 0;
  const progress = (raised / required) * 100;
  return parseFloat(Math.min(progress, 100).toFixed(2)); // number with 2 decimals
};

export function extractPublicIdFromUrl(url: string): string | null {
  const cleanUrl = url.split("?")[0];
  const parts = cleanUrl.split("/upload/");
  if (parts.length < 2) return null;

  let path = parts[1].replace(/\.[^/.]+$/, ""); // remove extension
  path = decodeURIComponent(path);

  // remove version prefix (e.g., v1695821323/)
  path = path.replace(/^v\d+\//, "");

  return path;
}
