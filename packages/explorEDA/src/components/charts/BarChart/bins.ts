export function numericBins(all: number[], values: number[], count: number) {
  const low = Math.min(...all);
  const high = Math.max(...all);
  if (!Number.isFinite(low) || !Number.isFinite(high)) return [];
  const min = low === high ? low - 0.5 : low;
  const max = low === high ? high + 0.5 : high;
  const size = Math.max(2, Math.min(100, Math.round(count)));
  const step = (max - min) / size;
  const bins = Array.from({ length: size }, (_, i) => ({
    label: "",
    start: min + i * step,
    end: min + (i + 1) * step,
    value: 0,
    isNumeric: true as const,
  }));
  for (const value of values) {
    if (!Number.isFinite(value) || value < min || value > max) continue;
    bins[Math.min(size - 1, Math.floor((value - min) / step))]!.value++;
  }
  return bins;
}
