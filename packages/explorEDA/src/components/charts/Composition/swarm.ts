/**
 * Offsets points off a line so none overlap: each point in x order takes
 * the position nearest the line that clears every placed neighbor, as a
 * beeswarm. Offsets past `limit` clamp to it, so a crowded line overlaps
 * rather than overflowing its frame.
 */
export function swarmOffsets(
  xs: number[],
  radii: number[],
  limit: number
): number[] {
  const order = xs.map((x, index) => ({ x, index })).sort((a, b) => a.x - b.x);
  const placed: { x: number; y: number; r: number }[] = [];
  const offsets = new Array<number>(xs.length).fill(0);
  for (const { x, index } of order) {
    const r = radii[index]!;
    const near = placed.filter((item) => Math.abs(item.x - x) < item.r + r);
    const candidates = [0];
    for (const item of near) {
      const reach = item.r + r;
      const dx = item.x - x;
      const dy = Math.sqrt(Math.max(0, reach * reach - dx * dx));
      candidates.push(item.y + dy, item.y - dy);
    }
    candidates.sort((a, b) => Math.abs(a) - Math.abs(b) || a - b);
    const clear = (y: number) =>
      near.every((item) => {
        const reach = item.r + r;
        const dx = item.x - x;
        const dy = item.y - y;
        return dx * dx + dy * dy >= reach * reach - 1e-6;
      });
    const y = candidates.find(clear) ?? 0;
    const clamped = Math.max(-limit, Math.min(limit, y));
    offsets[index] = clamped;
    placed.push({ x, y: clamped, r });
  }
  return offsets;
}
