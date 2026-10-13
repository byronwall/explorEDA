import type { ChartType } from "@/types/ChartTypes";
import { compositionPng } from "../Composition/compositionOutput";
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
const unsupported: Partial<Record<ChartType, string>> = {};

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

/**
 * Draws one chart to a PNG. A composition is already a finished graphic, so
 * it exports its artboard at its own size; every other chart exports its
 * panel as drawn.
 */
export function captureChartPanel(
  panel: HTMLElement,
  chart: { id: string; type: ChartType },
  options?: RasterizeOptions
): Promise<ChartImage> {
  const { type } = chart;
  const reason = chartImageUnsupportedReason(type);
  if (reason) {
    return Promise.reject(new ChartExportError(reason));
  }
  if (type === "composition") {
    return compositionPng(chart.id, options?.pixelRatio).catch((error) => {
      throw new ChartExportError(
        error instanceof Error ? error.message : String(error)
      );
    });
  }
  // Every chart but the raw data table has a known size, so it is shown in
  // full; a data table shows the rows in view.
  return rasterizePanel(panel, {
    fullExtent: type !== "data-table",
    ...options,
  });
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
