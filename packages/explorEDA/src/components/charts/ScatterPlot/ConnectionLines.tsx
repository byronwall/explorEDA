import { segmentCount, type ConnectionPath } from "./connectPlan";

/**
 * Paths that join points in order. Each segment takes its start point's
 * color; a wide transparent stroke over the whole path is its hit target.
 */
export function ConnectionLines({
  paths,
  activeId,
}: {
  paths: ConnectionPath[];
  activeId?: string;
}) {
  return (
    <g className="eda-scatter-connections">
      {paths.map((path) => {
        const active = path.id === activeId;
        return (
          <g
            key={path.id}
            data-connection-id={path.id}
            role="img"
            aria-label={`Path · ${path.label}: ${segmentCount(path)}`}
          >
            {path.segments.map((segment) => (
              <line
                key={`${segment.from}-${segment.to}`}
                x1={segment.x1}
                y1={segment.y1}
                x2={segment.x2}
                y2={segment.y2}
                stroke={segment.color}
                strokeWidth={active ? 2.5 : 1.5}
                strokeOpacity={segment.dimmed ? 0.2 : active ? 1 : 0.75}
                strokeLinecap="round"
                pointerEvents="none"
              />
            ))}
            {path.d && (
              <path
                d={path.d}
                fill="none"
                stroke="transparent"
                strokeWidth={10}
                pointerEvents="stroke"
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Group names beside each path's first or last drawn point. */
export function ConnectionLabels({
  paths,
  activeId,
}: {
  paths: ConnectionPath[];
  activeId?: string;
}) {
  return (
    <g className="eda-scatter-connection-labels" pointerEvents="none">
      {paths.flatMap((path) =>
        path.labels.map((label) => (
          <g key={`${path.id}:${label.anchor}`}>
            {Math.abs(label.y - label.pointY) > 3 && (
              <line
                x1={label.pointX + (label.anchor === "start" ? 3 : -3)}
                y1={label.pointY}
                x2={label.x + (label.anchor === "start" ? -2 : 2)}
                y2={label.y}
                stroke={label.color}
                strokeOpacity={0.5}
                strokeWidth={0.75}
              />
            )}
            <text
              x={label.x}
              y={label.y}
              dy="0.32em"
              textAnchor={label.anchor}
              fontSize={11}
              fontWeight={path.id === activeId ? 600 : 400}
              fill={label.color}
              stroke="var(--background)"
              strokeWidth={3}
              paintOrder="stroke"
            >
              {label.text}
            </text>
          </g>
        ))
      )}
    </g>
  );
}
