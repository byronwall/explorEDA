export interface DataPoint {
  x: number;
  y: number;
}

export interface ReducedDataPoint extends DataPoint {
  type: "min" | "max" | "start";
}

/**
 * Reduces a dataset to a fixed number of buckets using min-max-start algorithm.
 * For each bucket, it keeps the start point, minimum point, and maximum point.
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

  // If all x values are the same, return just one point
  if (xExtent.min === xExtent.max) {
    const firstPoint = data[0];
    return firstPoint ? [{ ...firstPoint, type: "start" as const }] : [];
  }

  const buckets: ReducedDataPoint[][] = Array(validBuckets)
    .fill(null)
    .map(() => []);

  // Distribute points into buckets
  orderedData.forEach((point) => {
    const bucketIndex = Math.min(
      Math.floor(
        ((point.x - xExtent.min) / (xExtent.max - xExtent.min)) * validBuckets
      ),
      validBuckets - 1
    );
    buckets[bucketIndex]?.push({ ...point, type: "start" });
  });

  // Process each bucket to find min, max, and start points
  const result: ReducedDataPoint[] = [];
  buckets.forEach((bucket) => {
    if (bucket.length === 0) {
      return;
    }

    // Always include the first point as start
    const firstPoint = bucket[0];
    if (!firstPoint) {
      return;
    }
    result.push({ ...firstPoint, type: "start" });

    if (bucket.length > 1) {
      const minPoint = bucket.reduce((min, p) => (p.y < min.y ? p : min));
      const maxPoint = bucket.reduce((max, p) => (p.y > max.y ? p : max));

      // Only add min/max if they're different from the start point
      if (minPoint !== firstPoint) {
        result.push({ ...minPoint, type: "min" });
      }
      if (maxPoint !== firstPoint && maxPoint !== minPoint) {
        result.push({ ...maxPoint, type: "max" });
      }
    }
  });

  return result.sort((a, b) => a.x - b.x);
}
