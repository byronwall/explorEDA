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
