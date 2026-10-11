import type { AxisGuide, AxisHidden, ChartAxesPlan } from "./axisPlan";

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
          className="eda-axis-text"
          data-role={guide.role}
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

/** Distance, in pixels, from the plot edge to a hidden-marks marker's center. */
const MARKER_INSET = 10;

/** Chevrons pointing past each end of an axis, toward the hidden marks. */
const CHEVRONS = {
  "x:low": "M2 -4 L-2 0 L2 4",
  "x:high": "M-2 -4 L2 0 L-2 4",
  "y:low": "M-4 -2 L0 2 L4 -2",
  "y:high": "M-4 2 L0 -2 L4 2",
} as const;

/** Words for an axis end, used in labels: "above the X maximum". */
export function hiddenPhrase(
  hidden: AxisHidden,
  axis: "x" | "y",
  side: "low" | "high"
) {
  const unit = hidden.count === 1 ? hidden.unit[0] : hidden.unit[1];
  const name = axis.toUpperCase();
  return `${hidden.count.toLocaleString()} ${unit} ${
    side === "high" ? `above the ${name} maximum` : `below the ${name} minimum`
  }`;
}

/** Gap, in pixels, between markers that share a plot corner. */
const MARKER_STEP = 2 * MARKER_INSET;

/** A warning sign, for rows a log axis cannot place. */
const WARNING = "M0 -4 L0 1 M0 3.6 L0 3.7";

type MarkerSide = "low" | "high" | "nonpositive";

/**
 * Small markers inside the plot where an axis does not show every row: at
 * each end a bound hides marks past, pointing toward them, and a warning at
 * the low end of a log axis for rows at or below zero. Markers that share
 * the lower-left corner step apart. Hover or focus opens the details; the
 * panel's axis editing reads the data attributes to do that.
 */
function HiddenMarkers({ plan }: { plan: ChartAxesPlan }) {
  const { plotWidth, plotHeight } = plan;
  const corner = (["x", "y"] as const).flatMap((axis) =>
    (["low", "nonpositive"] as const).flatMap((side) =>
      plan[axis].hidden?.[side] ? [`${axis}:${side}`] : []
    )
  );
  const xInCorner = corner.filter((key) => key.startsWith("x")).length;
  const place = (axis: "x" | "y", side: MarkerSide): [number, number] => {
    if (side === "high")
      return axis === "x"
        ? [plotWidth - MARKER_INSET, plotHeight - MARKER_INSET]
        : [MARKER_INSET, MARKER_INSET];
    const index = corner.indexOf(`${axis}:${side}`);
    // X markers run right along the axis; Y markers stack up above them.
    return axis === "x"
      ? [MARKER_INSET + index * MARKER_STEP, plotHeight - MARKER_INSET]
      : [
          MARKER_INSET,
          plotHeight -
            MARKER_INSET -
            (xInCorner ? 1 : 0) * MARKER_STEP -
            (index - xInCorner) * MARKER_STEP,
        ];
  };
  const markers = (["x", "y"] as const).flatMap((axis) =>
    (["low", "high", "nonpositive"] as const).flatMap((side) =>
      plan[axis].hidden?.[side] ? [{ axis, side }] : []
    )
  );
  if (!markers.length) return null;
  return (
    <g className="eda-axis-hidden-layer">
      {markers.map(({ axis, side }) => {
        const key = `${axis}:${side}` as const;
        const [x, y] = place(axis, side);
        const common = {
          className: "eda-axis-hidden",
          "data-axis-hidden": key,
          transform: `translate(${x},${y})`,
          pointerEvents: "auto" as const,
          tabIndex: 0,
          role: "button" as const,
          "aria-haspopup": "dialog" as const,
        };
        if (side === "nonpositive") {
          const off = plan[axis].hidden!.nonpositive!;
          const unit = off.count === 1 ? off.unit[0] : off.unit[1];
          return (
            <g
              key={key}
              {...common}
              data-hidden-reason="nonpositive"
              data-hidden-count={off.count}
              data-hidden-unit={off.unit.join("|")}
              aria-label={`${off.count.toLocaleString()} ${unit} at or below zero ${off.count === 1 ? "is" : "are"} not on the ${axis.toUpperCase()} log scale. Show details`}
            >
              <rect x={-7} y={-7} width={14} height={14} rx={3.5} />
              <path d={WARNING} />
            </g>
          );
        }
        const hidden = plan[axis].hidden![side]!;
        return (
          <g
            key={key}
            {...common}
            data-hidden-count={hidden.count}
            data-hidden-at={hidden.at}
            data-hidden-at-label={hidden.atLabel}
            data-hidden-cut={hidden.cut || undefined}
            data-hidden-unit={hidden.unit.join("|")}
            aria-label={`${hiddenPhrase(hidden, axis, side)}. Show details`}
          >
            <rect x={-7} y={-7} width={14} height={14} rx={3.5} />
            <path d={CHEVRONS[key as keyof typeof CHEVRONS]} />
          </g>
        );
      })}
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
      <HiddenMarkers plan={plan} />
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
