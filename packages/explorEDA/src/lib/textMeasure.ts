/**
 * Measures rendered text width with a shared canvas, so layout can make room
 * for wide or serif type. Without a canvas (tests, server rendering) it falls
 * back to an average-character estimate.
 */
let context: CanvasRenderingContext2D | null | undefined;
const cache = new Map<string, number>();
const CACHE_LIMIT = 4000;

function getContext() {
  if (context === undefined) {
    try {
      context =
        typeof document === "undefined"
          ? null
          : document.createElement("canvas").getContext("2d");
    } catch {
      context = null;
    }
  }
  return context;
}

/** Width estimate the axis layout used before it measured text. */
export function estimateTextWidth(text: string, size: number) {
  return text.length * size * 0.6;
}

export function measureTextWidth(
  text: string,
  size: number,
  family: string,
  weight: string | number = 400
) {
  const ctx = getContext();
  if (!ctx) return estimateTextWidth(text, size);
  const font = `${weight} ${size}px ${family}`;
  const key = `${font}|${text}`;
  const known = cache.get(key);
  if (known !== undefined) return known;
  ctx.font = font;
  const width = ctx.measureText(text).width;
  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(key, width);
  return width;
}

/** Fonts that finish loading change widths, so cached widths are dropped. */
export function clearTextMeasureCache() {
  cache.clear();
}
