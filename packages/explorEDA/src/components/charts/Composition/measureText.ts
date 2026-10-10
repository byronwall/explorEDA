import { COMPOSITION_FONT } from "./compositionTypes";
import type { MeasureText } from "./resolveComposition";

let context: CanvasRenderingContext2D | null | undefined;
const cache = new Map<string, number>();

/** Measures with a canvas in the composition font, or estimates without one. */
export const measureCompositionText: MeasureText = (
  text,
  fontSize,
  fontWeight
) => {
  const key = `${fontWeight}|${fontSize}|${text}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
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
  let width: number;
  if (context) {
    context.font = `${fontWeight} ${fontSize}px ${COMPOSITION_FONT}`;
    width = context.measureText(text).width;
  } else {
    width = estimateTextWidth(text, fontSize, fontWeight);
  }
  if (cache.size > 5000) cache.clear();
  cache.set(key, width);
  return width;
};

/** A deterministic width for tests and environments without a canvas. */
export function estimateTextWidth(
  text: string,
  fontSize: number,
  fontWeight: number
) {
  return text.length * fontSize * (fontWeight >= 600 ? 0.58 : 0.54);
}
