/** The drawn artboard of each composition, so output reads the viewed scene. */
const artboards = new Map<string, SVGSVGElement>();

export function registerArtboard(chartId: string, svg: SVGSVGElement | null) {
  if (svg) artboards.set(chartId, svg);
  else artboards.delete(chartId);
  return () => {
    if (artboards.get(chartId) === svg) artboards.delete(chartId);
  };
}

/**
 * Serializes an artboard without editing overlays, at its own size rather
 * than the size it is shown at.
 */
export function artboardMarkup(svg: SVGSVGElement) {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  copy.querySelectorAll("[data-overlay]").forEach((node) => node.remove());
  const [, , width, height] = (copy.getAttribute("viewBox") ?? "0 0 0 0")
    .split(/\s+/)
    .map(Number);
  copy.setAttribute("width", String(width));
  copy.setAttribute("height", String(height));
  for (const name of ["class", "tabindex", "aria-description"])
    copy.removeAttribute(name);
  return {
    markup: new XMLSerializer().serializeToString(copy),
    width: width!,
    height: height!,
  };
}

/** Draws an artboard into a PNG at a pixel ratio, such as 2 for sharp slides. */
export async function artboardPng(
  svg: SVGSVGElement,
  pixelRatio = 2
): Promise<{ blob: Blob; width: number; height: number }> {
  const { markup, width, height } = artboardMarkup(svg);
  // System fonts draw in the image; wait so measured text matches.
  await document.fonts?.ready;
  const url = URL.createObjectURL(
    new Blob([markup], { type: "image/svg+xml;charset=utf-8" })
  );
  try {
    const image = new Image();
    image.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("The graphic could not be drawn."));
      image.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser cannot draw images.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) throw new Error("The PNG could not be encoded.");
    return { blob, width: canvas.width, height: canvas.height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Copies a composition as a PNG. The clipboard write starts inside the click,
 * with the image as a pending promise, so browsers keep the user gesture.
 */
export async function copyArtboardPng(chartId: string, pixelRatio = 2) {
  const svg = artboards.get(chartId);
  if (!svg) throw new Error("Open the composition to copy it.");
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined")
    throw new Error(
      "This browser cannot copy images. Use a secure (https) page in a current browser."
    );
  const png = artboardPng(svg, pixelRatio);
  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": png.then(({ blob }) => blob) }),
  ]);
  const { width, height } = await png;
  return { width, height };
}
