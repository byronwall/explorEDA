import type { AxisGuide, ChartAxesPlan } from "./axisPlan";

const GUIDE_DESCRIPTION = "Alt+Enter to inspect";

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

function GuideShape({
  guide,
  active,
}: {
  guide: AxisGuide;
  active: boolean;
}) {
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
          className="chart-guide"
          {...interactiveProps(guide, interactive)}
        >
          <GuideShape guide={guide} active={guide.id === activeId} />
        </g>
      ))}
    </g>
  );
}
