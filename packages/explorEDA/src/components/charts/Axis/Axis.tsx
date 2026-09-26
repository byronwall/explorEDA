export function formatTick(value: string | number) {
  if (typeof value === "string") return value;
  return new Intl.NumberFormat("en-US", {
    notation: Math.abs(value) >= 10000 ? "compact" : "standard",
    maximumFractionDigits: Math.abs(value) < 1 ? 3 : 2,
  }).format(value);
}
