import type { ReactNode } from "react";
import { COMPOSITION_FONT } from "./compositionTypes";
import type { Bounds, CompositionScene, SceneNode } from "./resolveComposition";

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
  ...props
}: {
  scene: CompositionScene;
  scale: number;
  label: string;
  children?: ReactNode;
  svgRef?: React.Ref<SVGSVGElement>;
  /** Temporary moves, such as during a drag, by element ID. */
  offsets?: Record<string, { dx: number; dy: number }>;
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
      viewBox={`0 0 ${scene.width} ${scene.height}`}
      fontFamily={COMPOSITION_FONT}
      {...props}
    >
      {clips.size > 0 && (
        <defs>
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
          opacity={node.opacity}
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
    case "path":
      return (
        <path
          data-node={node.key}
          d={node.segments
            .map((run) =>
              run
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
      return (
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

const round = (value: number) => Math.round(value * 100) / 100;
