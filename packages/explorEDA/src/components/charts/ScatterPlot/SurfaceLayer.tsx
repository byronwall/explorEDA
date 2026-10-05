import { useId } from "react";
import { densityColor } from "./densityPlan";
import type { HexPlan } from "./hexPlan";
import type { ContourPlan } from "./contourPlan";
import type { ScatterPlan } from "./scatterPlan";

/** Small points drawn as one path per color, so thousands stay cheap in SVG. */
function PointOverlay({ plan }: { plan: ScatterPlan }) {
  const paths = new Map<string, string[]>();
  for (const point of plan.points) {
    const key = `${point.color}|${point.passesOwnFilter ? 1 : 0}`;
    const list = paths.get(key) ?? [];
    list.push(
      `M${(point.x - 1.6).toFixed(1)},${point.y.toFixed(1)}a1.6,1.6 0 1,0 3.2,0a1.6,1.6 0 1,0 -3.2,0`
    );
    paths.set(key, list);
  }
  return (
    <g pointerEvents="none" aria-hidden="true">
      {[...paths].map(([key, list]) => {
        const [color, passes] = key.split("|");
        return (
          <path
            key={key}
            d={list.join("")}
            fill={color}
            fillOpacity={passes === "1" ? 0.85 : 0.35}
            stroke="var(--background)"
            strokeWidth={0.5}
          />
        );
      })}
    </g>
  );
}

const interval = (value: number) => String(Number(value.toPrecision(3)));

export function SurfaceLayer({
  plan,
  hex,
  contour,
  showPoints,
  activeId,
}: {
  plan: ScatterPlan;
  hex?: HexPlan;
  contour?: ContourPlan;
  showPoints: boolean;
  activeId?: string;
}) {
  return (
    <g className="eda-scatter-surface">
      {hex?.bins.map((bin) => {
        const active = bin.id === activeId;
        return (
          <polygon
            key={bin.id}
            data-mark-id={bin.id}
            points={bin.points}
            fill={bin.fill}
            opacity={bin.dimmed ? 0.25 : 1}
            stroke={
              active || bin.selected ? "var(--foreground)" : "var(--background)"
            }
            strokeWidth={active || bin.selected ? 1.5 : 0.5}
            role="img"
            aria-label={`Hexagon with ${bin.rowIds.length} rows`}
          />
        );
      })}
      {contour &&
        contour.fill &&
        contour.levels.map((level) => (
          <path
            key={level.id}
            data-mark-id={level.id}
            d={level.path}
            fill={level.fill}
            fillOpacity={0.55}
            stroke="none"
            role="img"
            aria-label={`Density at least ${interval(level.threshold)} rows per unit area, ${Math.round(level.coverage * 100)}% of rows`}
          />
        ))}
      {showPoints && <PointOverlay plan={plan} />}
      {contour &&
        contour.lines &&
        contour.levels.map((level) => (
          <path
            key={`${level.id}:line`}
            data-mark-id={level.id}
            d={level.path}
            fill={contour.fill ? "none" : "transparent"}
            stroke="var(--foreground)"
            strokeOpacity={
              level.id === activeId
                ? 0.95
                : 0.25 + (0.5 * (level.index + 1)) / contour.levels.length
            }
            strokeWidth={level.id === activeId ? 2 : 1}
            pointerEvents={contour.fill ? "stroke" : "all"}
          />
        ))}
    </g>
  );
}

/** One line under the axis that says what the surface colors count. */
export function SurfaceLegend({
  hex,
  contour,
  bottom,
  left,
  right,
  compact = false,
}: {
  hex?: HexPlan;
  contour?: ContourPlan;
  bottom: number;
  left: number;
  right: number;
  /** Narrow panels show the lowest and highest level only. */
  compact?: boolean;
}) {
  const gradient = `${useId().replace(/:/g, "")}-hex`;
  return (
    <div
      className="eda-surface-legend"
      style={{ bottom, left, right }}
      role="note"
    >
      {hex && !hex.notice && (
        <span
          className="flex items-center gap-1.5"
          aria-label={`Rows per hexagon: color from 1 to ${hex.max}`}
        >
          <span>Rows per hexagon</span>
          <span>1</span>
          <svg width={64} height={9} aria-hidden="true">
            <defs>
              <linearGradient id={gradient}>
                {[0, 0.25, 0.5, 0.75, 1].map((value) => (
                  <stop
                    key={value}
                    offset={`${value * 100}%`}
                    stopColor={densityColor(
                      (1 + value * (hex.max - 1)) / hex.max
                    )}
                  />
                ))}
              </linearGradient>
            </defs>
            <rect width={64} height={9} fill={`url(#${gradient})`} />
          </svg>
          <span>{hex.max}</span>
          <span className="text-muted-foreground">
            · {hex.counted.toLocaleString()} rows
          </span>
        </span>
      )}
      {contour && !contour.notice && (
        <span
          className="flex min-w-0 items-center gap-1.5"
          aria-label={`Smoothed density levels in rows per X unit × Y unit: ${contour.levels.map((level) => interval(level.threshold)).join(", ")}`}
        >
          <span className="shrink-0">Rows per X×Y unit</span>
          {(compact && contour.levels.length > 2
            ? [contour.levels[0]!, contour.levels[contour.levels.length - 1]!]
            : contour.levels
          ).map((level, index, shown) => (
            <span key={level.id} className="flex shrink-0 items-center gap-0.5">
              <span
                className="inline-block size-2.5 rounded-[2px] border border-border"
                style={{
                  background: contour.fill ? level.fill : "transparent",
                }}
              />
              {interval(level.threshold)}
              {compact && shown.length === 2 && index === 0 && " …"}
            </span>
          ))}
          <span className="truncate text-muted-foreground">
            · {contour.rows.toLocaleString()} rows · bandwidth ×{contour.scale}
          </span>
        </span>
      )}
    </div>
  );
}
