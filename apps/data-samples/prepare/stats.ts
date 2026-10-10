export const round = (value: number, digits = 0) => {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
};

/** Pearson correlation of two equal-length lists. */
export function pearson(xs: number[], ys: number[]) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let index = 0; index < n; index++) {
    const dx = xs[index]! - mx;
    const dy = ys[index]! - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  return sxy / Math.sqrt(sxx * syy);
}

/** Count, mean, and quartiles (linear interpolation, like R type 7). */
export function describe(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const quantile = (p: number) => {
    const position = (sorted.length - 1) * p;
    const low = Math.floor(position);
    const high = Math.ceil(position);
    return sorted[low]! + (sorted[high]! - sorted[low]!) * (position - low);
  };
  return {
    count: sorted.length,
    mean: sorted.reduce((a, b) => a + b, 0) / sorted.length,
    q1: quantile(0.25),
    median: quantile(0.5),
    q3: quantile(0.75),
  };
}
