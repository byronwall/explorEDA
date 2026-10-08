import type { ReactNode } from "react";
import { COMPOSITION_FONT } from "./compositionTypes";
import type { CompositionScene, SceneNode } from "./resolveComposition";

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
  ...props
}: {
  scene: CompositionScene;
  scale: number;
  label: string;
  children?: ReactNode;
  svgRef?: React.Ref<SVGSVGElement>;
  /** Temporary moves, such as during a drag, by element ID. */
  offsets?: Record<string, { dx: number; dy: number }>;
} & Omit<React.SVGProps<SVGSVGElement>, "scale" | "ref">) {
  // Nodes group by element, so moving one element is one transform.
  const groups: { elementId: string; nodes: SceneNode[] }[] = [];
  for (const node of scene.nodes) {
    const last = groups[groups.length - 1];
    if (last?.elementId === node.elementId) last.nodes.push(node);
    else groups.push({ elementId: node.elementId, nodes: [node] });
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
            {nodes.map((node) => (
              <SceneNodeView key={node.key} node={node} />
            ))}
          </g>
        );
      })}
      {children && <g data-overlay="">{children}</g>}
    </svg>
  );
}

function SceneNodeView({ node }: { node: SceneNode }) {
  switch (node.type) {
    case "text":
      return (
        <text
          fontSize={node.fontSize}
          fontWeight={node.fontWeight}
          fill={node.fill}
          textAnchor={node.anchor}
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
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          fill={node.fill}
        />
      );
    case "circle":
      return (
        <circle
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          fill={node.fill}
          stroke={node.stroke}
          strokeWidth={node.stroke ? 1.25 : undefined}
        />
      );
    case "line":
      return (
        <line
          x1={node.x1}
          y1={node.y1}
          x2={node.x2}
          y2={node.y2}
          stroke={node.stroke}
          strokeWidth={node.strokeWidth}
          strokeDasharray={node.dash}
        />
      );
  }
}
