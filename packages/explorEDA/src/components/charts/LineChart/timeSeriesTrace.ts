import type { TimePoint, TimeSeriesPlan } from "./timeSeriesPlan";
import type { TraceSource } from "../trace/traceTypes";

export interface TimeSeriesTrace {
  kind: "time-bucket" | "time-omissions";
  id: string;
  revision: string;
  plan: TimeSeriesPlan;
  point?: TimePoint;
}

export function timeSeriesTraceSource(plan: TimeSeriesPlan): TraceSource {
  return {
    role: "chart",
    revision: plan.revision,
    resolve(kind, id) {
      if (kind === "time-omissions")
        return { kind, id, revision: plan.revision, plan };
      const point = plan.points.find((point) => point.id === id);
      if (kind === "time-bucket" && point)
        return { kind, id, revision: plan.revision, plan, point };
      return undefined;
    },
    findRow(id) {
      const point = plan.points.find((point) =>
        point.contributors.some((row) => row.sourceId === id)
      );
      return point
        ? { kind: "time-bucket", id: point.id }
        : plan.invalidDateIds.includes(id)
          ? { kind: "time-omissions", id: "dates" }
          : undefined;
    },
    targets: () => [
      ...plan.points.map((point) => ({
        kind: "time-bucket",
        id: point.id,
        label: `${point.seriesLabel} · ${point.label}`,
      })),
      ...(plan.invalidDateIds.length
        ? [
            {
              kind: "time-omissions",
              id: "dates",
              label: "Rows without a readable date",
            },
          ]
        : []),
    ],
  };
}
