export interface DataPoint {
  x: number;
  y: number;
}

export interface ReducedDataPoint extends DataPoint {
  type: "min" | "max" | "start" | "end";
}

/**
 * Reduces a dataset to a fixed number of buckets. For each bucket, it keeps
 * the start point, minimum point, maximum point, and end point.
 * Small inputs keep every point in ascending X order.
 *
 * @param data Array of data points with x and y values
 * @param numBuckets Number of buckets to divide the data into (typically chart width)
 * @returns Array of reduced data points with type information
 */
export function reduceDataPoints(
  data: DataPoint[],
  numBuckets: number
): ReducedDataPoint[] {
  // Handle edge cases
  if (!data || data.length === 0) {
    return [];
  }

  // Ensure numBuckets is valid and reasonable
  const validBuckets = Math.max(1, Math.min(1000, Math.floor(numBuckets)));

  const orderedData = [...data].sort((a, b) => {
    const aFinite = Number.isFinite(a.x);
    const bFinite = Number.isFinite(b.x);
    if (aFinite !== bFinite) return aFinite ? -1 : 1;
    return aFinite ? a.x - b.x : 0;
  });

  // If data is small enough, just convert to ReducedDataPoint format
  if (data.length <= validBuckets * 3) {
    return orderedData.map((point) => ({ ...point, type: "start" as const }));
  }

  const xExtent = {
    min: Math.min(...orderedData.map((d) => d.x)),
    max: Math.max(...orderedData.map((d) => d.x)),
  };

  // Every point lands in a bucket; when all share one x, the first.
  const xSpan = xExtent.max - xExtent.min;
  const buckets: DataPoint[][] = Array(validBuckets)
    .fill(null)
    .map(() => []);

  // Distribute points into buckets
  orderedData.forEach((point) => {
    const bucketIndex = xSpan
      ? Math.min(
          Math.floor(((point.x - xExtent.min) / xSpan) * validBuckets),
          validBuckets - 1
        )
      : 0;
    buckets[bucketIndex]?.push(point);
  });

  // Each bucket keeps its first, min, max, and last points in x order, so
  // the line reaches the series' final sample.
  const result: ReducedDataPoint[] = [];
  buckets.forEach((bucket) => {
    if (bucket.length === 0) {
      return;
    }
    let min = 0;
    let max = 0;
    bucket.forEach((point, index) => {
      if (point.y < bucket[min]!.y) min = index;
      if (point.y > bucket[max]!.y) max = index;
    });
    const kept = new Map<number, ReducedDataPoint["type"]>([[0, "start"]]);
    if (!kept.has(min)) kept.set(min, "min");
    if (!kept.has(max)) kept.set(max, "max");
    if (!kept.has(bucket.length - 1)) kept.set(bucket.length - 1, "end");
    [...kept]
      .sort(([a], [b]) => a - b)
      .forEach(([index, type]) => result.push({ ...bucket[index]!, type }));
  });

  return result;
}
