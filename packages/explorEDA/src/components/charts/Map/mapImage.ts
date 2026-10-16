const STYLE_PROPERTIES = [
  "fill",
  "fill-opacity",
  "stroke",
  "stroke-opacity",
  "stroke-width",
  "opacity",
  "font-size",
  "font-family",
  "font-weight",
  "paint-order",
  "dominant-baseline",
  "text-anchor",
];

/** Copies computed styles, so theme variables resolve outside the page. */
function inlineStyles(source: Element, target: Element) {
  const computed = getComputedStyle(source);
  const style = STYLE_PROPERTIES.map(
    (name) => `${name}:${computed.getPropertyValue(name)}`
  ).join(";");
  target.setAttribute("style", style);
  [...source.children].forEach((child, index) => {
    const copy = target.children[index];
    if (copy) inlineStyles(child, copy);
  });
}

/** The first opaque background behind the map, such as the chart panel's. */
function backgroundOf(element: HTMLElement | null): string {
  for (let node = element; node; node = node.parentElement) {
    const color = getComputedStyle(node).backgroundColor;
    if (color && color !== "transparent" && !/rgba\(.*,\s*0\)$/.test(color))
      return color;
  }
  return "#fff";
}

async function svgImage(svg: SVGSVGElement, width: number, height: number) {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  inlineStyles(svg, copy);
  copy.setAttribute("width", String(width));
  copy.setAttribute("height", String(height));
  copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const url = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(copy)], {
      type: "image/svg+xml;charset=utf-8",
    })
  );
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("The map could not be drawn."));
      image.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Draws a map frame into a PNG: the street canvas when there is one, the
 * chart's SVG above it, and the basemap credits in the corner. Returns
 * whether streets made it in; a browser that blocks reading the tiles
 * gets the marks on the background alone.
 */
export async function mapPng(frame: HTMLElement, pixelRatio = 2) {
  const svg = frame.querySelector<SVGSVGElement>("svg[role=group]");
  if (!svg) throw new Error("The map has nothing to draw yet.");
  const width = Number(svg.getAttribute("width"));
  const height = Number(svg.getAttribute("height"));
  await document.fonts?.ready;
  const marks = await svgImage(svg, width, height);
  const street = frame.querySelector<HTMLCanvasElement>(".maplibregl-canvas");
  const credits = frame
    .querySelector(".maplibregl-ctrl-attrib-inner")
    ?.textContent?.trim();
  const draw = (withStreets: boolean) => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser cannot draw images.");
    context.scale(pixelRatio, pixelRatio);
    context.fillStyle = backgroundOf(frame);
    context.fillRect(0, 0, width, height);
    if (withStreets && street) context.drawImage(street, 0, 0, width, height);
    context.drawImage(marks, 0, 0, width, height);
    const note = withStreets
      ? credits
      : street
        ? "Street basemap left out: its tiles could not be read"
        : undefined;
    if (note) {
      context.font = "10px system-ui, sans-serif";
      const textWidth = context.measureText(note).width;
      context.fillStyle = "rgba(255,255,255,0.85)";
      context.fillRect(width - textWidth - 8, height - 16, textWidth + 8, 16);
      context.fillStyle = "#333";
      context.fillText(note, width - textWidth - 4, height - 5);
    }
    return new Promise<Blob>((resolve, reject) => {
      try {
        canvas.toBlob(
          (blob) =>
            blob
              ? resolve(blob)
              : reject(new Error("The PNG could not be encoded.")),
          "image/png"
        );
      } catch (error) {
        reject(error);
      }
    });
  };
  try {
    return { blob: await draw(true), streets: Boolean(street) };
  } catch (error) {
    // A tile server without CORS headers taints the canvas.
    if (!street) throw error;
    return { blob: await draw(false), streets: false };
  }
}

export async function downloadMapPng(frame: HTMLElement, name: string) {
  const { blob, streets } = await mapPng(frame);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name.trim().replace(/[\\/:*?"<>|]+/g, "-") || "map"}.png`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  return { streets };
}
