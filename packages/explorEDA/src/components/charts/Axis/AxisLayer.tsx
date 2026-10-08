import type { AxisGuide, ChartAxesPlan } from "./axisPlan";

const GUIDE_DESCRIPTION = "Alt+Enter to inspect";
const FIELD_DESCRIPTION =
  "Command-click or open the context menu to inspect the field";

const activeLine = { stroke: "var(--primary)", strokeWidth: 2.5 };

function interactiveProps(guide: AxisGuide, interactive: boolean) {
  return interactive
    ? {
        tabIndex: 0,
        role: "button" as const,
        "aria-label": guide.ariaLabel,
        "aria-description": GUIDE_DESCRIPTION,
      }
    : { "aria-label": guide.ariaLabel };
}

/**
 * Axis titles and tick labels name a field. They take the pointer even on a
 * chart without guide tracing, so Command-click and the context menu can
 * open the field inspector.
 */
function fieldProps(guide: AxisGuide, interactive: boolean) {
  if (!guide.label || !guide.field) return {};
  const props: Record<string, unknown> = { pointerEvents: "auto" };
  if (guide.role === "label") {
    props.tabIndex = 0;
    props["aria-description"] = interactive
      ? `${GUIDE_DESCRIPTION}. ${FIELD_DESCRIPTION}`
      : FIELD_DESCRIPTION;
    if (!interactive) {
      props.role = "button";
      props["aria-label"] = guide.ariaLabel;
    }
  }
  return props;
}

function GuideShape({ guide, active }: { guide: AxisGuide; active: boolean }) {
  const { line, label } = guide;
  return (
    <>
      {line && (
        <line
          {...line}
          className="stroke-border"
          style={active ? activeLine : undefined}
        />
      )}
      {label && (
        <text
          x={label.x}
          y={label.y}
          dy={label.dy}
          transform={label.rotate ? `rotate(${label.rotate})` : undefined}
          textAnchor={label.anchor}
          fontSize={label.fontSize}
          fill={active ? "var(--primary)" : undefined}
          textDecoration={active ? "underline" : undefined}
          aria-label={label.fullText}
        >
          {label.text}
        </text>
      )}
    </>
  );
}

/** Draws planned grid lines. Place it inside the plot clip. */
export function PlannedGrid({
  plan,
  interactive = false,
  activeId,
}: {
  plan: ChartAxesPlan;
  interactive?: boolean;
  activeId?: string | null;
}) {
  const guides = [...plan.x.gridGuides, ...plan.y.gridGuides];
  if (!guides.length) return null;
  return (
    <g
      className="stroke-border"
      opacity={0.55}
      pointerEvents={interactive ? undefined : "none"}
    >
      {guides.map((guide) => (
        <g key={guide.id}>
          <line
            {...guide.line}
            pointerEvents="none"
            style={guide.id === activeId ? activeLine : undefined}
          />
          {interactive && (
            <line
              {...guide.line}
              data-plan-id={guide.id}
              className="chart-guide-hit"
              stroke="transparent"
              strokeWidth={10}
              pointerEvents="stroke"
              {...interactiveProps(guide, true)}
            />
          )}
        </g>
      ))}
    </g>
  );
}

/** Height of the band under the X axis, and least width beside the Y axis, that edits its range. */
const STRIP_SIZE = 24;

/**
 * An invisible band along a numeric axis, over its tick labels. Double-click
 * or the context menu there edits the axis range. It carries the drawn
 * domain so an editor can show and invert it.
 */
function AxisEditStrip({
  plan,
  axis,
}: {
  plan: ChartAxesPlan;
  axis: "x" | "y";
}) {
  const scale = plan[axis].scale;
  if (scale.type === "band") return null;
  const { plotWidth, plotHeight, margin } = plan;
  const width = Math.max(STRIP_SIZE, margin.left - 18);
  const box =
    axis === "x"
      ? { x: 0, y: plotHeight, width: plotWidth, height: STRIP_SIZE }
      : { x: -width, y: 0, width, height: plotHeight };
  // Grips mark each end, which a drag stretches.
  const ends =
    axis === "x"
      ? [0, plotWidth].map((at) => ({
          x: at - 1.5,
          y: plotHeight + 4,
          width: 3,
          height: 14,
        }))
      : [plotHeight, 0].map((at) => ({
          x: -width + 2,
          y: at - 1.5,
          width: 14,
          height: 3,
        }));
  return (
    <g
      className="eda-axis-edit"
      data-axis-edit={axis}
      data-scale-type={scale.type}
      data-domain={scale.domain.join(",")}
      data-range={scale.range.join(",")}
    >
      <rect
        {...box}
        className="eda-axis-strip"
        fill="transparent"
        pointerEvents="all"
      />
      {ends.map((end, index) => (
        <rect
          key={index}
          {...end}
          rx={1.5}
          className="eda-axis-grip"
          pointerEvents="none"
        />
      ))}
    </g>
  );
}

/** Draws planned axis rules, ticks, labels and the zero line. */
export function PlannedAxes({
  plan,
  interactive = false,
  activeId,
}: {
  plan: ChartAxesPlan;
  interactive?: boolean;
  activeId?: string | null;
}) {
  return (
    <g
      className="fill-muted-foreground"
      pointerEvents={interactive ? "auto" : "none"}
    >
      <AxisEditStrip plan={plan} axis="x" />
      <AxisEditStrip plan={plan} axis="y" />
      {[...plan.x.guides, ...plan.y.guides].map((guide) => (
        <g
          key={guide.id}
          data-plan-id={guide.id}
          data-field={guide.label ? guide.field : undefined}
          data-axis={guide.label && guide.field ? guide.axis : undefined}
          className="chart-guide"
          {...interactiveProps(guide, interactive)}
          {...fieldProps(guide, interactive)}
        >
          <GuideShape guide={guide} active={guide.id === activeId} />
        </g>
      ))}
    </g>
  );
}
