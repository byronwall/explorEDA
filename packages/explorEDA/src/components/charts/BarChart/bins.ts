export function numericBins(all: number[], values: number[], count: number) {
  const low = Math.min(...all);
  const high = Math.max(...all);
  if (!Number.isFinite(low) || !Number.isFinite(high)) return [];
  const requested = Math.max(2, Math.min(100, Math.round(count)));
  // Integer data gets whole-number bins centered on the integers, so a bar
  // never straddles a gap between two possible values.
  const integer = all.every(Number.isInteger);
  let min: number;
  let size: number;
  let step: number;
  if (integer) {
    const span = high - low + 1;
    step = Math.ceil(span / requested);
    size = Math.ceil(span / step);
    min = low - 0.5;
  } else {
    min = low === high ? low - 0.5 : low;
    const max = low === high ? high + 0.5 : high;
    size = requested;
    step = (max - min) / size;
  }
  const max = min + size * step;
  const bins = Array.from({ length: size }, (_, i) => {
    const start = min + i * step;
    const end = i === size - 1 ? max : min + (i + 1) * step;
    const label = !integer
      ? `[${start}, ${end}${i === size - 1 ? "]" : ")"}`
      : step === 1
        ? `${start + 0.5}`
        : `${start + 0.5}–${end - 0.5}`;
    return { label, start, end, value: 0, isNumeric: true as const };
  });
  for (const value of values) {
    if (!Number.isFinite(value) || value < min || value > max) continue;
    bins[Math.min(size - 1, Math.floor((value - min) / step))]!.value++;
  }
  return bins;
}
