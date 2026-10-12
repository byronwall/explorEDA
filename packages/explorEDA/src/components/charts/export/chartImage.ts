import type { ChartType } from "@/types/ChartTypes";
import {
  ChartExportError,
  rasterizePanel,
  type ChartImage,
  type RasterizeOptions,
} from "./rasterizePanel";

/**
 * Why a chart type cannot be exported yet, or undefined when it can. The
 * export actions stay listed for every chart and say why they are off.
 */
const unsupported: Partial<Record<ChartType, string>> = {
  "3d-scatter": "Image export isn't available for 3D charts yet.",
};

export function chartImageUnsupportedReason(type: ChartType) {
  return unsupported[type];
}

/** `price-vs-carat-2026-10-12.png`, from the chart title and today's date. */
export function chartImageFileName(title: string, date = new Date()) {
  const slug =
    title
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/, "") || "chart";
  const day = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
  return `${slug}-${day}.png`;
}

export function captureChartPanel(
  panel: HTMLElement,
  type: ChartType,
  options?: RasterizeOptions
): Promise<ChartImage> {
  const reason = chartImageUnsupportedReason(type);
  if (reason) {
    return Promise.reject(new ChartExportError(reason));
  }
  return rasterizePanel(panel, options);
}

export function canCopyImages() {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.clipboard?.write &&
    typeof ClipboardItem !== "undefined"
  );
}

/**
 * Copies a chart image. The clipboard write starts inside the click or key
 * press, with the image as a pending promise, so browsers keep the gesture.
 */
export async function copyChartImage(image: Promise<ChartImage>) {
  if (!canCopyImages()) {
    throw new ChartExportError(
      "This browser cannot copy images here. Download the image instead."
    );
  }
  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": image.then(({ blob }) => blob) }),
  ]);
  return image;
}

export async function downloadChartImage(
  image: Promise<ChartImage>,
  fileName: string
) {
  const result = await image;
  const url = URL.createObjectURL(result.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before releasing it.
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
  return result;
}

export { ChartExportError, type ChartImage };
