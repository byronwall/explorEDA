/**
 * Spreads positions along one axis so none sit closer than `spacing`,
 * moving each as little as possible and keeping their order. Positions
 * stay inside `bounds` when the run fits; otherwise it starts at the low
 * bound and overflows the high one.
 */
export function dodgePositions(
  positions: number[],
  spacing: number,
  bounds: [number, number]
): number[] {
  const order = positions
    .map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value);
  const placed = order.map((item) => item.value);
  // Push down from the top so each sits at least `spacing` under the last.
  for (let i = 1; i < placed.length; i += 1)
    placed[i] = Math.max(placed[i]!, placed[i - 1]! + spacing);
  // Pull the run back up when it overflows the bottom, then re-separate
  // upward so earlier labels give way instead of piling.
  const last = placed.length - 1;
  if (last >= 0 && placed[last]! > bounds[1]) {
    placed[last] = Math.max(bounds[0], bounds[1]);
    for (let i = last - 1; i >= 0; i -= 1)
      placed[i] = Math.min(placed[i]!, placed[i + 1]! - spacing);
    if (placed[0]! < bounds[0]) {
      placed[0] = bounds[0];
      for (let i = 1; i < placed.length; i += 1)
        placed[i] = Math.max(placed[i]!, placed[i - 1]! + spacing);
    }
  }
  const result = new Array<number>(positions.length);
  order.forEach((item, rank) => {
    result[item.index] = placed[rank]!;
  });
  return result;
}
