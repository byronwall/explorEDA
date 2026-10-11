import { useId, useMemo, type ReactNode } from "react";
import {
  projectAnnotations,
  type AnnotationFrame,
} from "@/lib/annotations/resolve";
import type { ChartAnnotation } from "@/lib/annotations/types";
import { AnnotationLayer } from "./AnnotationLayer";
import { useAnnotationRows } from "./useAnnotationRows";

export type ChartAnnotationFrame = Omit<AnnotationFrame, "ids" | "getColumn">;

/**
 * Projects a chart's saved annotations through the frame it draws now. A
 * component rather than a hook, so a renderer can build the frame after its
 * own early returns.
 */
function ChartAnnotations({
  chartId,
  annotations,
  frame,
  clipPath,
}: {
  chartId: string;
  annotations: ChartAnnotation[];
  frame: ChartAnnotationFrame;
  clipPath: string;
}) {
  const rows = useAnnotationRows();
  const panelId = useId();
  const projected = useMemo(
    () => projectAnnotations(annotations, { ...frame, ...rows }),
    [annotations, frame, rows]
  );
  return (
    <AnnotationLayer
      chartId={chartId}
      panelId={panelId}
      annotations={annotations}
      projected={projected}
      plotWidth={frame.plotWidth}
      plotHeight={frame.plotHeight}
      clipPath={clipPath}
    />
  );
}

/**
 * The annotation slot for a chart's SVG shell, which passes the plot clip
 * path. Undefined when the chart has no annotations.
 */
export function annotationSlot(
  settings: { id: string; annotations?: ChartAnnotation[] },
  frame: ChartAnnotationFrame | undefined
): ((clipPath: string) => ReactNode) | undefined {
  const annotations = settings.annotations;
  if (!annotations?.length || !frame) return undefined;
  return (clipPath) => (
    <ChartAnnotations
      chartId={settings.id}
      annotations={annotations}
      frame={frame}
      clipPath={clipPath}
    />
  );
}
