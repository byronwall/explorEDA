import type { MatrixLayout } from "./matrixPlan";

/** Points at or under this radius draw as squares straight into pixels. */
export const SQUARE_RADIUS = 1.5;

export type Rgb = [number, number, number];

/** Reused between draws so large matrices do not allocate on every brush. */
let counts = new Uint16Array(0);
let scratch: HTMLCanvasElement | undefined;

/** Rows colored by group: each group's live row indices and color. */
export interface PointGroups {
  rows: Int32Array[];
  colors: Rgb[];
}

/**
 * Draws every point cell of a matrix on one canvas. With `selected`, only the
 * rows it marks draw; without it, every row does.
 *
 * Small points skip the canvas path API: each square adds one to a per-pixel
 * count, and a pixel's alpha is what drawing the same color that many times
 * at `opacity` produces, 1 − (1 − opacity)^count. That matches source-over
 * drawing exactly and is many times faster for 100,000-row matrices.
 */
export function drawMatrixPoints(
  canvas: HTMLCanvasElement,
  layout: MatrixLayout,
  color: Rgb,
  opacity: number,
  selected?: Uint8Array,
  groups?: PointGroups
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(layout.contentWidth * dpr));
  const height = Math.max(1, Math.round(layout.contentHeight * dpr));
  if (canvas.width !== width) {
    canvas.width = width;
  }
  if (canvas.height !== height) {
    canvas.height = height;
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const square = layout.pointRadius <= SQUARE_RADIUS;
  if (!groups) {
    if (square) {
      paintSquares(ctx, layout, dpr, width, height, color, opacity, selected);
    } else {
      strokeCircles(ctx, layout, dpr, color, opacity, selected);
    }
    return;
  }
  // One pass per group, later groups on top, as the scatter plot draws them.
  for (let group = 0; group < groups.colors.length; group++) {
    const only = groups.rows[group]!;
    if (!square) {
      strokeCircles(
        ctx,
        layout,
        dpr,
        groups.colors[group]!,
        opacity,
        selected,
        only
      );
      continue;
    }
    // Pixel layers replace what they cover, so each group paints on its own
    // canvas and composites onto the chart.
    scratch ??= document.createElement("canvas");
    scratch.width = width;
    scratch.height = height;
    const layer = scratch.getContext("2d");
    if (!layer) {
      return;
    }
    paintSquares(
      layer,
      layout,
      dpr,
      width,
      height,
      groups.colors[group]!,
      opacity,
      selected,
      only
    );
    ctx.drawImage(scratch, 0, 0);
  }
}

function paintSquares(
  ctx: CanvasRenderingContext2D,
  layout: MatrixLayout,
  dpr: number,
  width: number,
  height: number,
  [red, green, blue]: Rgb,
  opacity: number,
  selected?: Uint8Array,
  only?: Int32Array
) {
  if (counts.length < width * height) {
    counts = new Uint16Array(width * height);
  } else {
    counts.fill(0, 0, width * height);
  }
  const side = Math.max(1, Math.round(layout.pointRadius * 2 * dpr));
  const half = side / 2;
  const size = layout.cellSize;
  // With `only`, walk just those rows; otherwise every live row.
  const rows = only ? only.length : layout.liveIds.length;
  // Only the cells that hold points need converting back to pixels.
  let top = height;
  let bottom = 0;
  let left = width;
  let right = 0;
  for (const cell of layout.cells) {
    if (cell.kind !== "points") {
      continue;
    }
    const xs = layout.fields[cell.column]!.offset;
    const ys = layout.fields[cell.row]!.offset;
    const x0 = Math.round(cell.x * dpr);
    const y0 = Math.round(cell.y * dpr);
    const x1 = Math.min(width, Math.round((cell.x + size) * dpr));
    const y1 = Math.min(height, Math.round((cell.y + size) * dpr));
    top = Math.min(top, y0);
    bottom = Math.max(bottom, y1);
    left = Math.min(left, x0);
    right = Math.max(right, x1);
    const baseY = (cell.y + size) * dpr;
    for (let k = 0; k < rows; k++) {
      const i = only ? only[k]! : k;
      if (selected && !selected[i]) {
        continue;
      }
      const x = xs[i]!;
      const y = ys[i]!;
      // NaN marks a row without a place on this field.
      if (x !== x || y !== y) {
        continue;
      }
      let px = Math.round(x0 + x * dpr - half);
      let py = Math.round(baseY - y * dpr - half);
      let pw = side;
      let ph = side;
      if (px < x0) {
        pw -= x0 - px;
        px = x0;
      }
      if (py < y0) {
        ph -= y0 - py;
        py = y0;
      }
      if (px + pw > x1) {
        pw = x1 - px;
      }
      if (py + ph > y1) {
        ph = y1 - py;
      }
      for (let row = 0; row < ph; row++) {
        let index = (py + row) * width + px;
        for (let column = 0; column < pw; column++) {
          if (counts[index]! < 65535) {
            counts[index]!++;
          }
          index++;
        }
      }
    }
  }
  if (right <= left || bottom <= top) {
    return;
  }
  // Alpha after n overlapping draws, as a lookup by count.
  const steps = 256;
  const alpha = new Uint8ClampedArray(steps);
  for (let n = 1; n < steps; n++) {
    alpha[n] = Math.round(255 * (1 - Math.pow(1 - opacity, n)));
  }
  const boxWidth = right - left;
  const boxHeight = bottom - top;
  const image = ctx.createImageData(boxWidth, boxHeight);
  const pixels = new Uint32Array(image.data.buffer);
  // ImageData is RGBA in memory, read as a little-endian 32-bit word.
  const rgb = (blue << 16) | (green << 8) | red;
  for (let row = 0; row < boxHeight; row++) {
    let source = (top + row) * width + left;
    let target = row * boxWidth;
    for (let column = 0; column < boxWidth; column++) {
      const count = counts[source]!;
      if (count) {
        const a = alpha[Math.min(steps - 1, count)]!;
        pixels[target] = ((a << 24) | rgb) >>> 0;
      }
      source++;
      target++;
    }
  }
  ctx.putImageData(image, left, top);
}

function strokeCircles(
  ctx: CanvasRenderingContext2D,
  layout: MatrixLayout,
  dpr: number,
  [red, green, blue]: Rgb,
  opacity: number,
  selected?: Uint8Array,
  only?: Int32Array
) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = `rgb(${red} ${green} ${blue})`;
  ctx.globalAlpha = opacity;
  const r = layout.pointRadius;
  const size = layout.cellSize;
  // With `only`, walk just those rows; otherwise every live row.
  const rows = only ? only.length : layout.liveIds.length;
  for (const cell of layout.cells) {
    if (cell.kind !== "points") {
      continue;
    }
    const xs = layout.fields[cell.column]!.offset;
    const ys = layout.fields[cell.row]!.offset;
    const base = cell.y + size;
    ctx.save();
    ctx.beginPath();
    ctx.rect(cell.x, cell.y, size, size);
    ctx.clip();
    ctx.beginPath();
    for (let k = 0; k < rows; k++) {
      const i = only ? only[k]! : k;
      if (selected && !selected[i]) {
        continue;
      }
      const x = xs[i]!;
      const y = ys[i]!;
      if (x !== x || y !== y) {
        continue;
      }
      const px = cell.x + x;
      const py = base - y;
      ctx.moveTo(px + r, py);
      ctx.arc(px, py, r, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  }
}

/** Parses "#rrggbb", "#rgb", or "rgb(r g b)" into channels; gray otherwise. */
export function toRgb(color: string): Rgb {
  const hex = color.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const digits =
      hex[1]!.length === 3
        ? [...hex[1]!].map((digit) => digit + digit).join("")
        : hex[1]!;
    return [0, 2, 4].map((at) => parseInt(digits.slice(at, at + 2), 16)) as Rgb;
  }
  const rgb = color.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (rgb) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }
  return [138, 148, 163];
}
