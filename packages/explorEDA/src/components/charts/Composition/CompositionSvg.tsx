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
  ...props
}: {
  scene: CompositionScene;
  scale: number;
  label: string;
  children?: ReactNode;
  svgRef?: React.Ref<SVGSVGElement>;
} & Omit<React.SVGProps<SVGSVGElement>, "scale" | "ref">) {
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
      {scene.nodes.map((node) => (
        <SceneNodeView key={node.key} node={node} />
      ))}
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
  }
}
