import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { KeyRound, Minus, Plus, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { typeIcons, typeLabels } from "@/components/FieldMetadata";
import type {
  SchemaEdge,
  SchemaGraph,
  SchemaNode,
  SchemaRow,
} from "@/lib/schema/schemaGraph";
import {
  layoutSchemaGraph,
  routeSchemaEdge,
  SCHEMA_SIZES,
  type SchemaEdgePath,
} from "@/lib/schema/schemaLayout";

const MIN_SCALE = 0.35;
/** The smallest scale a fit uses; below it, text is hard to read. */
const READABLE_SCALE = 0.6;
const MAX_SCALE = 2;
/** Movement that turns a press into a pan rather than a click. */
const DRAG_THRESHOLD = 4;

interface View {
  x: number;
  y: number;
  scale: number;
}

const clampScale = (scale: number) =>
  Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));

/** The scale and offset that show the whole diagram in the viewport. */
function fitView(
  layout: { width: number; height: number },
  width: number,
  height: number
): View {
  if (!width || !height) return { x: 0, y: 0, scale: 1 };
  // Readable cards matter more than seeing everything at once; past the
  // smallest readable scale, the diagram pans.
  const scale = Math.max(
    READABLE_SCALE,
    clampScale(Math.min(1, width / layout.width, height / layout.height))
  );
  return {
    x: Math.max(0, (width - layout.width * scale) / 2),
    y: Math.max(0, (height - layout.height * scale) / 2),
    scale,
  };
}

/**
 * The tables, fields, and relationships of a workspace as cards and lines.
 * Drag or scroll to pan; pinch, Control-scroll, or the zoom buttons to zoom.
 */
export function SchemaDiagram({
  graph,
  width,
  height,
  toolbarTarget,
}: {
  graph: SchemaGraph;
  width: number;
  height: number;
  /** Where the zoom controls render, such as the drawer's header. */
  toolbarTarget?: HTMLElement | null;
}) {
  // Lay out for the drawer's shape, in coarse steps so a resize that barely
  // changes the shape keeps the arrangement.
  const shapeWidth = Math.round(width / 40) * 40;
  const shapeHeight = Math.round(height / 40) * 40;
  const layout = useMemo(
    () => layoutSchemaGraph(graph, { width: shapeWidth, height: shapeHeight }),
    [graph, shapeWidth, shapeHeight]
  );
  const paths = useMemo(
    () =>
      graph.edges
        .map((edge) => routeSchemaEdge(graph, layout, edge))
        .filter((path): path is SchemaEdgePath => Boolean(path)),
    [graph, layout]
  );

  const [view, setView] = useState<View>({ x: 0, y: 0, scale: 1 });
  const fit = useCallback(
    () => setView(fitView(layout, width, height)),
    [layout, width, height]
  );
  // Fit whenever the arrangement changes, such as when the drawer opens or
  // its shape changes; between those, the view is the user's.
  const fittedLayout = useRef<typeof layout>(undefined);
  useLayoutEffect(() => {
    if (!width || fittedLayout.current === layout) return;
    fittedLayout.current = layout;
    fit();
  }, [fit, layout, width]);

  const zoomAt = useCallback(
    (factor: number, originX = width / 2, originY = height / 2) => {
      setView((current) => {
        const scale = clampScale(current.scale * factor);
        const ratio = scale / current.scale;
        return {
          scale,
          x: originX - (originX - current.x) * ratio,
          y: originY - (originY - current.y) * ratio,
        };
      });
    },
    [width, height]
  );

  const viewportRef = useRef<HTMLDivElement>(null);
  // Wheel listeners must not be passive to keep the page from scrolling.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        const rect = viewport.getBoundingClientRect();
        zoomAt(
          Math.exp(-event.deltaY * 0.01),
          event.clientX - rect.left,
          event.clientY - rect.top
        );
        return;
      }
      setView((current) => ({
        ...current,
        x: current.x - event.deltaX,
        y: current.y - event.deltaY,
      }));
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const drag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    view: View;
    moved: boolean;
  }>(undefined);

  const nodesById = useMemo(
    () => new Map(graph.nodes.map((node) => [node.id, node])),
    [graph]
  );

  const tableCount = graph.nodes.filter((node) => node.kind === "table").length;
  const relationshipCount = graph.edges.filter(
    (edge) => edge.kind === "relationship"
  ).length;

  const controls = (
    <div className="eda-schema-controls" role="group" aria-label="Zoom">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Zoom out"
        tooltip="Zoom out (or Control-scroll)"
        onClick={() => zoomAt(1 / 1.25)}
      >
        <Minus aria-hidden="true" />
      </Button>
      <span className="eda-schema-zoom" aria-live="polite">
        {Math.round(view.scale * 100)}%
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Zoom in"
        tooltip="Zoom in (or Control-scroll)"
        onClick={() => zoomAt(1.25)}
      >
        <Plus aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Fit the diagram"
        tooltip="Fit the whole diagram in view"
        onClick={fit}
      >
        <Scan aria-hidden="true" />
      </Button>
    </div>
  );

  return (
    <>
      {toolbarTarget ? createPortal(controls, toolbarTarget) : controls}
      <div
        ref={viewportRef}
        className="eda-schema-viewport"
        style={{ width, height }}
        role="group"
        aria-roledescription="diagram"
        aria-label={`${tableCount} ${tableCount === 1 ? "table" : "tables"}, ${relationshipCount} ${relationshipCount === 1 ? "relationship" : "relationships"}`}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          drag.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            view,
            moved: false,
          };
        }}
        onPointerMove={(event) => {
          const current = drag.current;
          if (!current || current.pointerId !== event.pointerId) return;
          const dx = event.clientX - current.startX;
          const dy = event.clientY - current.startY;
          if (!current.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
          if (!current.moved) {
            current.moved = true;
            event.currentTarget.setPointerCapture?.(event.pointerId);
          }
          setView({
            ...current.view,
            x: current.view.x + dx,
            y: current.view.y + dy,
          });
        }}
        onPointerUp={() => {
          drag.current = undefined;
        }}
        onPointerCancel={() => {
          drag.current = undefined;
        }}
        data-panning={drag.current?.moved || undefined}
      >
        <div
          className="eda-schema-world"
          style={{
            width: layout.width,
            height: layout.height,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          }}
        >
          <svg
            className="eda-schema-edges"
            width={layout.width}
            height={layout.height}
            aria-hidden="true"
          >
            {paths.map((path) => (
              <SchemaEdgeLine key={path.edge.id} path={path} />
            ))}
          </svg>
          {graph.nodes.map((node) => {
            const box = layout.boxes[node.id];
            if (!box) return null;
            return (
              <SchemaCard
                key={node.id}
                node={node}
                style={{
                  left: box.x,
                  top: box.y,
                  width: box.width,
                  height: box.height,
                }}
                linkedRows={linkedRows(graph.edges, node.id, nodesById)}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

/** Rows of a card that a line touches, so they can show where lines land. */
function linkedRows(
  edges: SchemaEdge[],
  nodeId: string,
  nodes: Map<string, SchemaNode>
) {
  const rows = new Set<string>();
  for (const edge of edges) {
    if (edge.kind !== "relationship") continue;
    for (const end of [edge.from, edge.to]) {
      if (end.nodeId === nodeId && nodes.has(end.nodeId)) rows.add(end.rowId);
    }
  }
  return rows;
}

function SchemaCard({
  node,
  style,
  linkedRows,
}: {
  node: SchemaNode;
  style: React.CSSProperties;
  linkedRows: Set<string>;
}) {
  return (
    <section
      className="eda-schema-card"
      data-kind={node.kind}
      style={style}
      aria-label={`${node.title}${node.detail ? `, ${node.detail}` : ""}`}
    >
      <header
        className="eda-schema-card-header"
        style={{ height: SCHEMA_SIZES.header }}
      >
        {node.glyph && (
          <span className="eda-schema-glyph" aria-hidden="true">
            {node.glyph}
          </span>
        )}
        <h3>{node.title}</h3>
        {node.detail && (
          <span className="eda-schema-detail">{node.detail}</span>
        )}
      </header>
      <ul className="eda-schema-rows">
        {node.rows.map((row) => (
          <SchemaRowItem
            key={row.id}
            row={row}
            linked={linkedRows.has(row.id)}
          />
        ))}
        {node.rows.length === 0 && (
          <li className="eda-schema-row eda-schema-empty">No fields</li>
        )}
      </ul>
    </section>
  );
}

function SchemaRowItem({ row, linked }: { row: SchemaRow; linked: boolean }) {
  const Icon = row.dataType ? typeIcons[row.dataType] : undefined;
  const type = row.dataType ? typeLabels[row.dataType] : "Unknown type";
  const facts = [
    type,
    row.key ? "key" : undefined,
    row.calculation ? `calculated: ${row.calculation.expression}` : undefined,
  ].filter(Boolean);
  return (
    <li
      className="eda-schema-row"
      style={{ height: SCHEMA_SIZES.row }}
      data-linked={linked || undefined}
      data-calculated={row.calculation ? "" : undefined}
      aria-label={`${row.label}, ${facts.join(", ")}`}
    >
      <span className="eda-schema-type" aria-hidden="true">
        {row.calculation ? (
          <span className="eda-schema-calc-mark">ƒ</span>
        ) : Icon ? (
          <Icon />
        ) : null}
      </span>
      <span className="eda-schema-label">{row.label}</span>
      {row.key && <KeyRound className="eda-schema-key" aria-hidden="true" />}
    </li>
  );
}

/** A crow's foot on the many side, a bar on the one side. */
function cardinalityMarks(
  end: { x: number; y: number; side: -1 | 1 },
  many: boolean
) {
  const out = end.side;
  if (many) {
    const tip = end.x + out * 12;
    return `M ${tip} ${end.y} L ${end.x} ${end.y - 6} M ${tip} ${end.y} L ${end.x} ${end.y} M ${tip} ${end.y} L ${end.x} ${end.y + 6}`;
  }
  const bar = end.x + out * 8;
  return `M ${bar} ${end.y - 6} L ${bar} ${end.y + 6}`;
}

function SchemaEdgeLine({ path }: { path: SchemaEdgePath }) {
  const { edge } = path;
  if (edge.kind === "calculation") {
    return (
      <path className="eda-schema-edge" data-kind="calculation" d={path.d} />
    );
  }
  const cardinality = edge.cardinality ?? "many-to-one";
  const fromMany =
    cardinality === "many-to-one" || cardinality === "many-to-many";
  const toMany =
    cardinality === "one-to-many" || cardinality === "many-to-many";
  return (
    <g className="eda-schema-edge-group">
      <path className="eda-schema-edge" data-kind="relationship" d={path.d} />
      <path
        className="eda-schema-edge-mark"
        d={`${cardinalityMarks(path.start, fromMany)} ${cardinalityMarks(path.end, toMany)}`}
      />
    </g>
  );
}
