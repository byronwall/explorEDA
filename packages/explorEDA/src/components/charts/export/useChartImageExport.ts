import type { ChartType } from "@/types/ChartTypes";
import { useCallback, type RefObject } from "react";
import { toast } from "sonner";
import {
  ChartExportError,
  captureChartPanel,
  chartImageFileName,
  chartImageUnsupportedReason,
  copyChartImage,
  downloadChartImage,
} from "./chartImage";

function reportFailure(error: unknown) {
  if (error instanceof ChartExportError) {
    toast.error(error.message);
  } else {
    toast.error("The chart image could not be created.");
  }
}

/**
 * Copy and download for one chart's image. Both start inside the user's
 * click or key press: copying needs that gesture to reach the clipboard.
 */
export function useChartImageExport(
  panelRef: RefObject<HTMLElement | null>,
  id: string,
  type: ChartType,
  title: string
) {
  const reason = chartImageUnsupportedReason(type);

  const capture = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) {
      return Promise.reject(
        new ChartExportError("Show the chart on screen to export it.")
      );
    }
    return captureChartPanel(panel, { id, type });
  }, [panelRef, id, type]);

  const copy = useCallback(() => {
    if (reason) {
      return void toast.error(reason);
    }
    copyChartImage(capture()).then(
      () => toast.success("Chart image copied"),
      reportFailure
    );
  }, [capture, reason]);

  const download = useCallback(() => {
    if (reason) {
      return void toast.error(reason);
    }
    const fileName = chartImageFileName(title);
    downloadChartImage(capture(), fileName).then(
      () => toast.success(`Saved ${fileName}`),
      reportFailure
    );
  }, [capture, reason, title]);

  return { copy, download, reason };
}
