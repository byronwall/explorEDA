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
  plan,
  activeId,
  onActive,
  onTrace,
}: {
  fits: ScatterFitPlan;
  plan: ScatterPlan;
  activeId?: string;
  onActive: (id: string | undefined) => void;
  onTrace: (kind: "fit" | "fit-results", id: string) => void;
}) {
  if (plan.plotWidth < 60 || plan.plotHeight < 40) return null;
  const maxLines = Math.max(
    1,
    Math.floor((plan.plotHeight * 0.4) / LINE_HEIGHT)
  );
  const overflow = fits.fits.length > maxLines;
  const shown = overflow ? fits.fits.slice(0, maxLines - 1) : fits.fits;
  const named = fits.fits.length > 1 || Boolean(fits.groupField);
  const side = corner(plan, shown.length + (overflow ? 1 : 0));
  const trace =
    (kind: "fit" | "fit-results", id: string) =>
    (event: MouseEvent | KeyboardEvent) => {
      if ("key" in event) {
        if (event.key !== "Enter" || !event.altKey) return;
        event.preventDefault();
      } else if (!event.altKey) return;
      event.stopPropagation();
      onTrace(kind, id);
    };
  const line = (fit: ScatterFit) => {
    const summary = fitSummary(fit);
    const name = `${fit.label} ${METHOD_NAMES[fits.method].toLowerCase()} fit`;
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
                fit.kind === "overall" && fits.fits.length > 1
                  ? "3 2"
                  : undefined
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
          {fit.outcome.ok ? summary : "no fit"}
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
  return (
    <ul
      className="eda-fit-labels"
      aria-label={`${METHOD_NAMES[fits.method]} fits`}
      style={{
        top: plan.margin.top + 4,
        ...(side === "left"
          ? { left: plan.margin.left + 6 }
          : { right: plan.margin.right + 6 }),
        maxWidth: Math.max(0, plan.plotWidth - 12),
      }}
    >
      {fits.notice ? (
        <ActionTooltip content={fits.notice}>
          <li
            tabIndex={0}
            className="eda-fit-label"
            aria-label={`No fit. ${fits.notice}`}
          >
            <TriangleAlert
              className="size-3 shrink-0 text-warning"
              aria-hidden="true"
            />
            <span className="truncate">
              No {METHOD_NAMES[fits.method].toLowerCase()} fit
            </span>
          </li>
        </ActionTooltip>
      ) : (
        shown.map(line)
      )}
      {overflow && (
        <li>
          <button
            type="button"
            className="eda-fit-label eda-fit-more"
            onClick={() => onTrace("fit-results", "fit-results")}
          >
            +{fits.fits.length - shown.length} more fits
          </button>
        </li>
      )}
    </ul>
  );
}
