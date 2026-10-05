import { TriangleAlert } from "lucide-react";
import type { KeyboardEvent, MouseEvent } from "react";
import { ActionTooltip } from "@/components/ui/tooltip";
import {
  METHOD_NAMES,
  fitSummary,
  type ScatterFit,
  type ScatterFitPlan,
} from "./fitPlan";
import type { ScatterPlan } from "./scatterPlan";
import type { PairedSummaryPlan } from "./pairedSummary";
import { DEFAULT_SPAN, fitEquation, formatR2 } from "./regression";

export type AnalysisTraceKind = "fit" | "fit-results" | "paired-summary";

const formatR = (r: number | undefined) =>
  r === undefined ? "undefined" : r.toFixed(2).replace("-", "−");

/** Height of one equation line, used to fit the stack to the panel. */
const LINE_HEIGHT = 17;

/** The top corner with fewer points under the label stack. */
function corner(plan: ScatterPlan, lines: number) {
  const width = Math.min(plan.plotWidth * 0.55, 280);
  const height = lines * LINE_HEIGHT + 4;
  let left = 0;
  let right = 0;
  for (const point of plan.points) {
    if (point.y > height) continue;
    if (point.x < width) left++;
    if (point.x > plan.plotWidth - width) right++;
  }
  return right < left ? "right" : "left";
}

/**
 * Equations sit in a quiet corner of the plot. When they would crowd it, the
 * last line opens every group's result in the chart trace instead.
 */
export function FitLabels({
  fits,
  summary,
  plan,
  activeId,
  onActive,
  onTrace,
}: {
  fits?: ScatterFitPlan;
  summary?: PairedSummaryPlan;
  plan: ScatterPlan;
  activeId?: string;
  onActive: (id: string | undefined) => void;
  onTrace: (kind: AnalysisTraceKind, id: string) => void;
}) {
  if (plan.plotWidth < 60 || plan.plotHeight < 40) return null;
  // LOESS states its method and span once; each group line keeps its fit quality.
  const loessHeader =
    fits && !fits.notice && fits.method === "loess"
      ? `LOESS · span ${fits.settings.span ?? DEFAULT_SPAN}`
      : undefined;
  const maxLines = Math.max(
    1,
    Math.floor((plan.plotHeight * 0.4) / LINE_HEIGHT) -
      (summary ? 1 : 0) -
      (loessHeader ? 1 : 0)
  );
  const all = fits?.notice ? [] : (fits?.fits ?? []);
  const overflow = all.length > maxLines;
  const shown = overflow ? all.slice(0, maxLines - 1) : all;
  // Small multiples keep the equation; R² stays in the label's trace.
  const narrow = plan.plotWidth < 300;
  // A facet that holds one group already names it in its heading.
  const named = all.length > 1;
  const side = corner(
    plan,
    shown.length +
      (overflow ? 1 : 0) +
      (summary ? 1 : 0) +
      (loessHeader ? 1 : 0) +
      (fits?.notice ? 1 : 0)
  );
  const trace =
    (kind: AnalysisTraceKind, id: string) =>
    (event: MouseEvent | KeyboardEvent) => {
      if ("key" in event) {
        if (event.key !== "Enter" || !event.altKey) return;
        event.preventDefault();
      } else if (!event.altKey) return;
      event.stopPropagation();
      onTrace(kind, id);
    };
  const method = fits ? METHOD_NAMES[fits.method] : "";
  const line = (fit: ScatterFit) => {
    const summary = fitSummary(fit);
    const text =
      fit.outcome.ok && fit.outcome.method === "loess"
        ? `pseudo R² ${formatR2(fit.outcome.r2)}`
        : narrow && fit.outcome.ok
          ? (fitEquation(fit.outcome) ?? summary)
          : summary;
    const name = `${fit.label} ${method.toLowerCase()} fit`;
    const item = (
      <li
        key={fit.id}
        tabIndex={0}
        data-fit-id={fit.id}
        className="eda-fit-label"
        data-active={activeId === fit.id || undefined}
        aria-label={`${name}: ${fit.outcome.ok ? summary : `unavailable. ${fit.outcome.reason}`}. Alt-Enter traces it.`}
        onPointerEnter={() => onActive(fit.id)}
        onPointerLeave={() => onActive(undefined)}
        onFocus={() => onActive(fit.id)}
        onBlur={() => onActive(undefined)}
        onClick={trace("fit", fit.id)}
        onKeyDown={trace("fit", fit.id)}
      >
        {fit.outcome.ok ? (
          <svg width={14} height={8} aria-hidden="true" className="shrink-0">
            <line
              x1={1}
              x2={13}
              y1={4}
              y2={4}
              stroke={fit.color}
              strokeWidth={2}
              strokeDasharray={
                fit.kind === "overall" && all.length > 1 ? "3 2" : undefined
              }
            />
          </svg>
        ) : (
          <TriangleAlert
            className="size-3 shrink-0 text-warning"
            aria-hidden="true"
          />
        )}
        <span className="truncate">
          {named && <span className="font-medium">{fit.label}: </span>}
          {fit.outcome.ok ? text : "no fit"}
        </span>
      </li>
    );
    return fit.outcome.ok ? (
      item
    ) : (
      <ActionTooltip key={fit.id} content={fit.outcome.reason}>
        {item}
      </ActionTooltip>
    );
  };
  const warning = (key: string, text: string, notice: string) => (
    <ActionTooltip key={key} content={notice}>
      <li
        tabIndex={0}
        className="eda-fit-label"
        aria-label={`${text}. ${notice}`}
      >
        <TriangleAlert
          className="size-3 shrink-0 text-warning"
          aria-hidden="true"
        />
        <span className="truncate">{text}</span>
      </li>
    </ActionTooltip>
  );
  const pooled = summary?.pooled;
  return (
    <ul
      className="eda-fit-labels"
      aria-label={fits ? `${method} fits` : "Paired summary"}
      style={{
        top: plan.margin.top + 4,
        ...(side === "left"
          ? { left: plan.margin.left + 6 }
          : { right: plan.margin.right + 6 }),
        maxWidth: Math.max(0, plan.plotWidth - 12),
      }}
    >
      {summary &&
        (summary.notice || !pooled ? (
          warning("summary", "No paired summary", summary.notice ?? "")
        ) : (
          <li
            key="summary"
            tabIndex={0}
            className="eda-fit-label"
            aria-label={`Paired summary: Pearson r ${formatR(pooled.r)} for all ${pooled.pairs} pairs${summary.groups.length > 1 ? `; ${summary.groups.map((group) => `${group.label} ${formatR(group.r)}`).join(", ")}` : ""}. Alt-Enter traces it.`}
            onClick={trace("paired-summary", "paired-summary")}
            onKeyDown={trace("paired-summary", "paired-summary")}
          >
            <span className="eda-summary-line truncate">
              <span className="text-muted-foreground">Pearson r</span>{" "}
              <b>{formatR(pooled.r)}</b>
              {summary.groups.length > 1 &&
                summary.groups.map((group) => (
                  <span key={group.id} className="eda-summary-group">
                    <span
                      className="eda-summary-dot"
                      style={{ background: group.color }}
                      aria-hidden="true"
                    />
                    {formatR(group.r)}
                  </span>
                ))}
              <span className="text-muted-foreground">
                {" "}
                · n {pooled.pairs.toLocaleString()}
              </span>
            </span>
          </li>
        ))}
      {fits?.notice &&
        warning("fit-notice", `No ${method.toLowerCase()} fit`, fits.notice)}
      {loessHeader && (
        <li className="eda-fit-label eda-fit-heading" aria-hidden="true">
          {loessHeader}
        </li>
      )}
      {shown.map(line)}
      {overflow && (
        <li>
          <button
            type="button"
            className="eda-fit-label eda-fit-more"
            onClick={() => onTrace("fit-results", "fit-results")}
          >
            +{all.length - shown.length} more fits
          </button>
        </li>
      )}
    </ul>
  );
}
