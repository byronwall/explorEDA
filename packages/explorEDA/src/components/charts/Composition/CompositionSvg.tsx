import { area as shapeArea, curveMonotoneX, line as shapeLine } from "d3-shape";
import type { ReactNode } from "react";
import type { ArtboardView } from "./artboardZoom";
import { COMPOSITION_FONT } from "./compositionTypes";
import type {
  AreaNode,
  Bounds,
  CompositionScene,
  SceneNode,
} from "./resolveComposition";

/** A stable ID for a clip box, shared by every node clipped to it. */
export function clipId(clip: Bounds) {
  return `eda-clip-${[clip.x, clip.y, clip.width, clip.height]
    .map((value) => Math.round(value * 100))
    .join("-")}`;
}

/**
 * Draws a resolved scene. Editing overlays go in `children`, inside a group
 * marked `data-overlay`, so output can drop them.
 */
export function CompositionSvg({
  scene,
  scale,
  label,
  children,
  svgRef,
  offsets,
  instanceOffset,
  view,
  ...props
}: {
  scene: CompositionScene;
  scale: number;
  label: string;
  children?: ReactNode;
  svgRef?: React.Ref<SVGSVGElement>;
  /** Temporary moves, such as during a drag, by element ID. */
  offsets?: Record<string, { dx: number; dy: number }>;
  /** The part of the artboard in view, when zoomed in. */
  view?: ArtboardView;
  /** A temporary move of one repeat of a chart unit. */
  instanceOffset?: {
    elementId: string;
    instanceKey: string;
    dx: number;
    dy: number;
  };
} & Omit<React.SVGProps<SVGSVGElement>, "scale" | "ref">) {
  // Nodes group by element, so moving one element is one transform.
  const groups: { elementId: string; nodes: SceneNode[] }[] = [];
  const clips = new Map<string, Bounds>();
  const textured = scene.nodes.some(
    (node) => node.type === "rect" && node.texture === "hand"
  );
  const gradients = scene.nodes.filter(
    (node): node is AreaNode => node.type === "area" && Boolean(node.gradient)
  );
  for (const node of scene.nodes) {
    const last = groups[groups.length - 1];
    if (last?.elementId === node.elementId) last.nodes.push(node);
    else groups.push({ elementId: node.elementId, nodes: [node] });
    if (node.clip) clips.set(clipId(node.clip), node.clip);
  }
  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
      width={Math.round(scene.width * scale)}
      height={Math.round(scene.height * scale)}
      viewBox={
        view && view.k !== 1
          ? `${view.x} ${view.y} ${scene.width / view.k} ${scene.height / view.k}`
          : `0 0 ${scene.width} ${scene.height}`
      }
      fontFamily={COMPOSITION_FONT}
      {...props}
    >
      {(clips.size > 0 || gradients.length > 0 || textured) && (
        <defs>
          {textured && (
            // Uneven edges and grain, as in a hand-colored chart.
            <filter id="eda-hand" x="-3%" y="-15%" width="106%" height="130%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.04"
                numOctaves={3}
                seed={7}
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={3}
                xChannelSelector="R"
                yChannelSelector="G"
                result="rough"
              />
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.8"
                numOctaves={2}
                seed={3}
                result="grain"
              />
              <feColorMatrix
                in="grain"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.7 0 0 0 0.5"
                result="grainAlpha"
              />
              <feComposite in="rough" in2="grainAlpha" operator="in" />
            </filter>
          )}
          {gradients.map((node) => (
            <linearGradient
              key={node.key}
              id={gradientId(node.key)}
              gradientUnits="userSpaceOnUse"
              x1={node.gradient!.x1}
              x2={node.gradient!.x2}
              y1={0}
              y2={0}
            >
              {node.gradient!.stops.map((stop) => (
                <stop
                  key={stop.offset}
                  offset={stop.offset}
                  stopColor={stop.color}
                />
              ))}
            </linearGradient>
          ))}
          {[...clips].map(([id, clip]) => (
            <clipPath key={id} id={id}>
              <rect
                x={clip.x}
                y={clip.y}
                width={clip.width}
                height={clip.height}
              />
            </clipPath>
          ))}
        </defs>
      )}
      <rect
        data-artboard=""
        width={scene.width}
        height={scene.height}
        fill={scene.background}
      />
      {groups.map(({ elementId, nodes }, index) => {
        const offset = offsets?.[elementId];
        return (
          <g
            key={`${elementId}:${index}`}
            transform={
              offset ? `translate(${offset.dx} ${offset.dy})` : undefined
            }
          >
            {nodes.map((node) =>
              instanceOffset?.elementId === node.elementId &&
              instanceOffset.instanceKey === node.instanceKey ? (
                <g
                  key={node.key}
                  transform={`translate(${instanceOffset.dx} ${instanceOffset.dy})`}
                >
                  <SceneNodeView node={node} />
                </g>
              ) : (
                <SceneNodeView key={node.key} node={node} />
              )
            )}
          </g>
        );
      })}
      {children && <g data-overlay="">{children}</g>}
    </svg>
  );
}

function SceneNodeView({ node }: { node: SceneNode }) {
  const clipPath = node.clip ? `url(#${clipId(node.clip)})` : undefined;
  switch (node.type) {
    case "text":
      return (
        <text
          data-node={node.key}
          fontSize={node.fontSize}
          fontWeight={node.fontWeight}
          fill={node.fill}
          opacity={node.opacity}
          textAnchor={node.anchor}
          stroke={node.halo}
          strokeWidth={node.halo ? 3 : undefined}
          strokeLinejoin={node.halo ? "round" : undefined}
          paintOrder={node.halo ? "stroke" : undefined}
          transform={
            node.rotate
              ? `rotate(${node.rotate} ${node.x} ${node.lines[0]?.y ?? 0})`
              : undefined
          }
        >
          {node.lines.map((line, index) => (
            <tspan key={index} x={node.x} y={line.y}>
              {line.text}
            </tspan>
          ))}
        </text>
      );
    case "rect":
      return (
        <rect
          data-node={node.key}
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          fill={node.fill}
          filter={node.texture === "hand" ? "url(#eda-hand)" : undefined}
          stroke={node.stroke}
          strokeWidth={node.stroke ? 1 : undefined}
          opacity={node.opacity}
          pointerEvents={node.under ? "none" : undefined}
          clipPath={clipPath}
        />
      );
    case "circle":
      return (
        <circle
          data-node={node.key}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          fill={node.fill}
          opacity={node.opacity}
          stroke={node.stroke}
          strokeWidth={node.stroke ? 1.25 : undefined}
          clipPath={clipPath}
        />
      );
    case "area":
      return (
        <g>
          <path
            data-node={node.key}
            d={node.segments
              .map((run) => {
                if (node.curve === "smooth") return smoothArea(run) ?? "";
                const upper = run.map(
                  (vertex, index) =>
                    `${index ? "L" : "M"}${round(vertex.x)} ${round(vertex.y1)}`
                );
                const lower = [...run]
                  .reverse()
                  .map((vertex) => `L${round(vertex.x)} ${round(vertex.y0)}`);
                return `${upper.join("")}${lower.join("")}Z`;
              })
              .join("")}
            fill={node.gradient ? `url(#${gradientId(node.key)})` : node.fill}
            fillOpacity={node.fillOpacity}
            stroke="none"
            opacity={node.opacity}
            clipPath={clipPath}
          />
          {node.stroke && (
            <path
              d={node.segments
                .map((run) =>
                  node.curve === "smooth"
                    ? (smoothLine(
                        run.map((vertex) => ({ x: vertex.x, y: vertex.y1 }))
                      ) ?? "")
                    : run
                        .map(
                          (vertex, index) =>
                            `${index ? "L" : "M"}${round(vertex.x)} ${round(vertex.y1)}`
                        )
                        .join("")
                )
                .join("")}
              fill="none"
              stroke={node.stroke}
              strokeWidth={1}
              strokeLinejoin="round"
              opacity={node.opacity}
              clipPath={clipPath}
              pointerEvents="none"
            />
          )}
        </g>
      );
    case "path":
      return (
        <path
          data-node={node.key}
          d={node.segments
            .map((run) =>
              node.curve === "smooth"
                ? (smoothLine(run) ?? "")
                : run
                    .map(
                      (vertex, index) =>
                        `${index ? "L" : "M"}${round(vertex.x)} ${round(vertex.y)}`
                    )
                    .join("")
            )
            .join("")}
          fill="none"
          stroke={node.stroke}
          strokeWidth={node.strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={node.opacity}
          clipPath={clipPath}
        />
      );
    case "line":
      return node.casing ? (
        <g opacity={node.opacity}>
          <line
            x1={node.x1}
            y1={node.y1}
            x2={node.x2}
            y2={node.y2}
            stroke={node.casing}
            strokeWidth={node.strokeWidth + 3}
            strokeOpacity={0.85}
            pointerEvents="none"
          />
          <line
            data-node={node.key}
            x1={node.x1}
            y1={node.y1}
            x2={node.x2}
            y2={node.y2}
            stroke={node.stroke}
            strokeWidth={node.strokeWidth}
            strokeDasharray={node.dash}
          />
        </g>
      ) : (
        <line
          data-node={node.key}
          x1={node.x1}
          y1={node.y1}
          x2={node.x2}
          y2={node.y2}
          stroke={node.stroke}
          strokeWidth={node.strokeWidth}
          strokeDasharray={node.dash}
          opacity={node.opacity}
        />
      );
  }
}

/** A stable, URL-safe ID for an area's gradient. */
function gradientId(key: string) {
  return `eda-gradient-${key.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

/** A monotone cubic curve through points, which never overshoots them. */
const smoothLine = shapeLine<{ x: number; y: number }>()
  .x((vertex) => vertex.x)
  .y((vertex) => vertex.y)
  .curve(curveMonotoneX);
const smoothArea = shapeArea<{ x: number; y0: number; y1: number }>()
  .x((vertex) => vertex.x)
  .y0((vertex) => vertex.y0)
  .y1((vertex) => vertex.y1)
  .curve(curveMonotoneX);

const round = (value: number) => Math.round(value * 100) / 100;
