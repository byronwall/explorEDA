import { embeddedFontFaces } from "./embedFonts";

/** A chart drawn to a PNG, with its size in image pixels. */
export interface ChartImage {
  blob: Blob;
  width: number;
  height: number;
}

export interface RasterizeOptions {
  /** Image pixels per CSS pixel; 2 keeps text sharp on slides. */
  pixelRatio?: number;
  /**
   * Show all of every vertically scrolling box, as for a pivot table with a
   * known size. Off for a data table, which shows the rows in view.
   */
  fullExtent?: boolean;
}

/** Tallest image, in CSS pixels, before full extent stops growing. */
const MAX_EXTENT = 8000;

/** A failure the person exporting can act on; its message is shown as is. */
export class ChartExportError extends Error {
  name = "ChartExportError";
}

/**
 * Editor chrome: header actions, readouts, handles, and usage hints. Marked
 * nodes keep their layout and draw nothing, so the image matches the screen
 * without them. Composition marks its editing overlays `data-overlay`.
 */
export const EXPORT_OMIT_SELECTOR = "[data-export='omit'], [data-overlay]";

// Geometry lives in SVG attributes; the computed copies only repeat them.
const SKIPPED = new Set([
  "d",
  "x",
  "y",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "transition",
  "transition-property",
  "transition-duration",
  "transition-delay",
  "transition-timing-function",
  "transition-behavior",
  "animation",
  "animation-name",
  "animation-duration",
  "animation-delay",
  "cursor",
]);

/** Copies every computed property onto the clone, so it renders without the page's style sheets. */
function inlineStyle(source: Element, target: Element) {
  const computed = getComputedStyle(source);
  let text = "";
  for (let i = 0; i < computed.length; i++) {
    const property = computed.item(i);
    if (property.startsWith("--") || SKIPPED.has(property)) {
      continue;
    }
    text += `${property}:${computed.getPropertyValue(property)};`;
  }
  target.setAttribute("style", text);
}

/**
 * Reads a canvas's current pixels. Charts that draw with WebGL register a
 * reader that renders a frame first, since their buffer is cleared after
 * each frame is shown.
 */
const canvasReaders = new WeakMap<HTMLCanvasElement, () => string>();

export function registerCanvasReader(
  canvas: HTMLCanvasElement,
  read: () => string
) {
  canvasReaders.set(canvas, read);
  return () => {
    if (canvasReaders.get(canvas) === read) {
      canvasReaders.delete(canvas);
    }
  };
}

function canvasPixels(canvas: HTMLCanvasElement) {
  try {
    return (canvasReaders.get(canvas) ?? (() => canvas.toDataURL()))();
  } catch {
    throw new ChartExportError(
      "This chart draws content from another site, so the browser blocks exporting it."
    );
  }
}

const isScroller = (style: CSSStyleDeclaration) =>
  /auto|scroll|hidden/.test(
    `${style.overflow} ${style.overflowX} ${style.overflowY}`
  );

/**
 * A cloned scroll box starts at the top. Shift its content to the position on
 * screen, and keep sticky headers where they are drawn now. Sticky offsets
 * are measured by briefly making each sticky node static, inside one task, so
 * nothing paints in between.
 */
function keepScrollPosition(
  source: HTMLElement,
  target: HTMLElement,
  expanded: boolean
) {
  const scrollTop = expanded ? 0 : source.scrollTop;
  const { scrollLeft } = source;
  if (!scrollTop && !scrollLeft) {
    return;
  }
  for (const child of Array.from(target.children)) {
    if (!(child instanceof HTMLElement || child instanceof SVGElement)) {
      continue;
    }
    const prior = child.style.transform;
    child.style.transform = `translate(${-scrollLeft}px, ${-scrollTop}px) ${prior === "none" ? "" : prior}`;
  }
}

function stickyOffsets(panel: HTMLElement, expanding: Set<Element>) {
  const offsets = new Map<Element, { dx: number; dy: number }>();
  for (const node of Array.from(panel.querySelectorAll<HTMLElement>("*"))) {
    if (getComputedStyle(node).position !== "sticky") {
      continue;
    }
    // Only scroll boxes inside the panel are replayed in the clone.
    let scrolled = false;
    let expanded = false;
    for (
      let up = node.parentElement;
      up && up !== panel;
      up = up.parentElement
    ) {
      if (up.scrollTop || up.scrollLeft) {
        scrolled = true;
      }
      if (expanding.has(up)) {
        expanded = true;
      }
    }
    if (!scrolled) {
      continue;
    }
    const stuck = node.getBoundingClientRect();
    const inline = node.style.position;
    node.style.position = "static";
    const unstuck = node.getBoundingClientRect();
    node.style.position = inline;
    const dx = stuck.left - unstuck.left;
    // A box shown in full is drawn from its top, where nothing is stuck.
    const dy = expanded ? 0 : stuck.top - unstuck.top;
    if (dx || dy) {
      offsets.set(node, { dx, dy });
    }
  }
  return offsets;
}

/** The first opaque background behind the panel, so rounded corners and gaps are not transparent. */
function backdrop(panel: HTMLElement) {
  for (let node = panel.parentElement; node; node = node.parentElement) {
    const color = getComputedStyle(node).backgroundColor;
    if (color && !/rgba\(.*,\s*0\)$|transparent/.test(color)) {
      return color;
    }
  }
  return document.documentElement.classList.contains("dark") ? "#000" : "#fff";
}

/**
 * Builds a standalone SVG of the panel as drawn: computed styles inlined,
 * canvases replaced by their pixels, chrome hidden, scroll kept.
 */
export function panelSvg(
  panel: HTMLElement,
  fontCss = "",
  { fullExtent = false }: Pick<RasterizeOptions, "fullExtent"> = {}
) {
  // Read the panel at rest: no hover-revealed actions or pointer readout.
  // Everything below runs in one task, so the page never paints this state.
  panel.setAttribute("data-exporting", "");
  try {
    return clonePanel(panel, fontCss, fullExtent);
  } finally {
    panel.removeAttribute("data-exporting");
  }
}

/** Boxes whose hidden rows a full-extent image shows. */
function scrollersToExpand(panel: HTMLElement) {
  const boxes = new Set<Element>();
  for (const node of Array.from(panel.querySelectorAll<HTMLElement>("*"))) {
    if (
      node.scrollHeight > node.clientHeight + 1 &&
      /auto|scroll/.test(getComputedStyle(node).overflowY)
    ) {
      boxes.add(node);
    }
  }
  return boxes;
}

/** Lays the clone out off-screen to learn its height once boxes grow. */
function measuredHeight(clone: HTMLElement, width: number) {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = `position:fixed;left:-100000px;top:0;width:${width}px;visibility:hidden;pointer-events:none`;
  host.appendChild(clone);
  document.body.appendChild(host);
  const height = clone.getBoundingClientRect().height;
  host.remove();
  return Math.min(MAX_EXTENT, Math.ceil(height));
}

function clonePanel(panel: HTMLElement, fontCss: string, fullExtent: boolean) {
  const rect = panel.getBoundingClientRect();
  const width = Math.ceil(rect.width);
  let height = Math.ceil(rect.height);
  const expanding = fullExtent ? scrollersToExpand(panel) : new Set<Element>();
  const sticky = stickyOffsets(panel, expanding);
  const clone = panel.cloneNode(true) as HTMLElement;
  const sources = [panel, ...Array.from(panel.querySelectorAll("*"))];
  const targets = [clone, ...Array.from(clone.querySelectorAll("*"))];
  let images = 0;

  // First copy every style, then adjust: an adjustment to a child would be
  // overwritten when that child's own styles are copied.
  const pairs: [Element, HTMLElement | SVGElement][] = [];
  sources.forEach((source, index) => {
    let target = targets[index];
    if (!target) {
      return;
    }
    inlineStyle(source, target);
    if (source instanceof HTMLCanvasElement) {
      const image = document.createElement("img");
      image.setAttribute("src", canvasPixels(source));
      image.setAttribute("style", target.getAttribute("style") ?? "");
      target.replaceWith(image);
      target = image;
      images++;
    } else if (source instanceof HTMLImageElement) {
      images++;
    } else if (
      source instanceof HTMLInputElement ||
      source instanceof HTMLTextAreaElement
    ) {
      target.setAttribute("value", source.value);
    }
    if (target instanceof HTMLElement || target instanceof SVGElement) {
      pairs.push([source, target]);
    }
  });

  for (const [source, target] of pairs) {
    if (source.matches(EXPORT_OMIT_SELECTOR)) {
      target.style.opacity = "0";
    }
    const offset = sticky.get(source);
    if (offset) {
      target.style.position = "relative";
      target.style.top = `${offset.dy}px`;
      target.style.left = `${offset.dx}px`;
      target.style.bottom = "auto";
      target.style.right = "auto";
    }
    if (
      source instanceof HTMLElement &&
      target instanceof HTMLElement &&
      isScroller(getComputedStyle(source))
    ) {
      // No scrollbars in a picture; the content shift stands in for scrolling.
      target.style.overflow = "hidden";
      const expanded = expanding.has(source);
      keepScrollPosition(source, target, expanded);
      if (expanded) {
        // Let the box and everything around it grow to its content.
        for (
          let node: HTMLElement | null = target;
          node;
          node = node === clone ? null : node.parentElement
        ) {
          node.style.height = "auto";
          node.style.maxHeight = "none";
        }
      }
    }
  }

  clone.style.margin = "0";
  clone.style.transform = "none";
  clone.style.position = "static";
  if (expanding.size) {
    height = measuredHeight(clone, width);
    clone.style.height = `${height}px`;
  }
  const markup = new XMLSerializer().serializeToString(clone);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
    (fontCss ? `<style>${fontCss}</style>` : "") +
    `<foreignObject x="0" y="0" width="100%" height="100%">` +
    `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px">${markup}</div>` +
    `</foreignObject></svg>`;
  return { svg, width, height, images };
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "sync";
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new ChartExportError("The chart could not be drawn as an image."));
    image.src = url;
  });
}

/**
 * Draws a chart panel into a PNG at its on-screen size. Uses a `data:` URL:
 * Chromium taints a canvas drawn from a blob URL once the SVG holds HTML.
 */
export async function rasterizePanel(
  panel: HTMLElement,
  { pixelRatio = 2, fullExtent = false }: RasterizeOptions = {}
): Promise<ChartImage> {
  await document.fonts?.ready;
  const fontCss = await embeddedFontFaces(panel);
  const { svg, width, height, images } = panelSvg(panel, fontCss, {
    fullExtent,
  });
  if (!width || !height) {
    throw new ChartExportError("Show the chart on screen to export it.");
  }
  const image = await loadImage(
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  const context = canvas.getContext("2d");
  if (!context) {
    throw new ChartExportError("This browser cannot draw images.");
  }
  if (images) {
    // WebKit decodes images nested in an SVG image only after a first draw.
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    await new Promise((resolve) => setTimeout(resolve, 100));
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
  context.fillStyle = backdrop(panel);
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    try {
      canvas.toBlob(resolve, "image/png");
    } catch {
      reject(
        new ChartExportError(
          "This chart shows an image from another site, so the browser blocks exporting it."
        )
      );
    }
  });
  if (!blob) {
    throw new ChartExportError("The PNG could not be encoded.");
  }
  return { blob, width: canvas.width, height: canvas.height };
}
