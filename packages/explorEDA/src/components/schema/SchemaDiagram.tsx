import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Database,
  Filter,
  KeyRound,
  Link2,
  Minus,
  Plus,
  Scan,
  Sigma,
  Split,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { typeIcons, typeLabels } from "@/components/FieldMetadata";
import type {
  SchemaEdge,
  SchemaEndpoint,
  SchemaGraph,
  SchemaNode,
  SchemaRow,
} from "@/lib/schema/schemaGraph";
import {
  layoutSchemaGraph,
  routeSchemaEdge,
  rowOffset,
  SCHEMA_SIZES,
  type SchemaEdgePath,
  type SchemaLayout,
} from "@/lib/schema/schemaLayout";
import { SchemaInspector, type SchemaChartLinks } from "./SchemaInspector";
import { traceField } from "@/lib/schema/schemaTrace";
import { compactViews } from "@/lib/schema/schemaCompact";
import type { SchemaEditing, SchemaSelection } from "./schemaEditing";

const MIN_SCALE = 0.35;
/** The smallest scale a fit uses; below it, text is hard to read. */
const READABLE_SCALE = 0.6;
const MAX_SCALE = 2;
/** Movement that turns a press into a pan or a link rather than a click. */
const DRAG_THRESHOLD = 4;
const INSPECTOR_WIDTH = 296;
/** Below this width the details dock along the bottom of the diagram. */
const DOCKED_WIDTH = 560;

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

const rowCenter = (
  layout: SchemaLayout,
  graph: SchemaGraph,
  end: SchemaEndpoint
) => {
  const box = layout.boxes[end.nodeId];
  const offset = rowOffset(
    graph.nodes.find((item) => item.id === end.nodeId),
    end.rowId
  );
  if (!box || offset === undefined) return undefined;
  return { box, y: box.y + offset };
};

/** Whether a selection still names something in the graph. */
function selectionExists(graph: SchemaGraph, selection: SchemaSelection) {
  const hasRow = (end: SchemaEndpoint) =>
    graph.nodes
      .find((node) => node.id === end.nodeId)
      ?.rows.some((row) => row.id === end.rowId) ?? false;
  switch (selection.kind) {
    case "table":
      return graph.nodes.some((node) => node.id === selection.nodeId);
    case "field":
      return hasRow(selection);
    case "relationship":
      return graph.edges.some((edge) => edge.id === selection.edgeId);
    case "proposal":
      return hasRow(selection.from) && hasRow(selection.to);
  }
}

type Press = {
  pointerId: number;
  startX: number;
  startY: number;
  view: View;
  moved: boolean;
  /** A press on a field row that can be dragged onto another field. */
  linkFrom?: SchemaEndpoint;
};

/**
 * The tables, fields, and relationships of a workspace as cards and lines.
 * Select a card, field, or line to see and edit it beside the diagram. Drag
 * a field onto another table's field to relate them. Drag the background or
 * scroll to pan; pinch, Control-scroll, or the zoom buttons zoom.
 */
export function SchemaDiagram({
  graph: fullGraph,
  width,
  height,
  toolbarTarget,
  editing,
  charts,
}: {
  graph: SchemaGraph;
  width: number;
  height: number;
  /** Where the zoom controls render, such as the drawer's header. */
  toolbarTarget?: HTMLElement | null;
  /** What may be edited. Without it, the diagram only shows and selects. */
  editing?: SchemaEditing;
  /** Lets a field's uses jump to this workspace's charts. */
  charts?: SchemaChartLinks;
}) {
  // Other views fold to their charts until the user opens one.
  const [expandedViews, setExpandedViews] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const graph = useMemo(
    () => compactViews(fullGraph, expandedViews),
    [fullGraph, expandedViews]
  );
  const toggleView = useCallback((nodeId: string) => {
    setExpandedViews((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

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
  // Fit when the drawer opens, its shape changes, or cards come or go. An
  // edit that renames or relates keeps the user's view.
  const fitKey = `${shapeWidth}x${shapeHeight}:${graph.nodes
    .map((node) => `${node.id}/${node.rows.length}`)
    .join(",")}`;
  const fittedKey = useRef<string>(undefined);
  useLayoutEffect(() => {
    if (!width || fittedKey.current === fitKey) return;
    fittedKey.current = fitKey;
    fit();
  }, [fit, fitKey, width]);

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
      if (
        event.target instanceof Element &&
        event.target.closest(".eda-schema-inspector")
      ) {
        return;
      }
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

  const [selection, setSelection] = useState<SchemaSelection>();
  // An edit can remove what was selected, such as a removed relationship.
  useEffect(() => {
    if (selection && !selectionExists(graph, selection))
      setSelection(undefined);
  }, [graph, selection]);

  // A swap of the details can remove the focused control. Keep focus in the
  // diagram so Escape still clears the selection instead of closing it all.
  useEffect(() => {
    const viewport = viewportRef.current;
    const active = document.activeElement;
    if (
      !viewport ||
      (active && active !== document.body && active.isConnected)
    ) {
      return;
    }
    const inspector = viewport.querySelector<HTMLElement>(
      ".eda-schema-inspector"
    );
    (inspector ?? viewport).focus({ preventScroll: true });
  }, [selection, graph]);

  const canRelate = Boolean(editing?.project);
  const press = useRef<Press>(undefined);
  const [panning, setPanning] = useState(false);
  const [ghost, setGhost] = useState<{
    from: SchemaEndpoint;
    x: number;
    y: number;
    target?: SchemaEndpoint;
  }>();

  const endpointAt = (clientX: number, clientY: number) => {
    const element = document.elementFromPoint(clientX, clientY);
    const row = element?.closest<HTMLElement>("[data-schema-row]");
    const card = row?.closest<HTMLElement>("[data-schema-node]");
    if (!row || !card) return undefined;
    return { nodeId: card.dataset.schemaNode!, rowId: row.dataset.schemaRow! };
  };
  const worldPoint = (clientX: number, clientY: number) => {
    const rect = viewportRef.current!.getBoundingClientRect();
    return {
      x: (clientX - rect.left - view.x) / view.scale,
      y: (clientY - rect.top - view.y) / view.scale,
    };
  };

  /** What a click on an element of the diagram selects. */
  const selectionAt = (target: Element): SchemaSelection | undefined => {
    const edge = target.closest<SVGElement>("[data-schema-edge]");
    if (edge) return { kind: "relationship", edgeId: edge.dataset.schemaEdge! };
    const card = target.closest<HTMLElement>("[data-schema-node]");
    if (!card) return undefined;
    const row = target.closest<HTMLElement>("[data-schema-row]");
    const nodeId = card.dataset.schemaNode!;
    return row
      ? { kind: "field", nodeId, rowId: row.dataset.schemaRow! }
      : { kind: "table", nodeId };
  };

  const nodesById = useMemo(
    () => new Map(graph.nodes.map((node) => [node.id, node])),
    [graph]
  );

  // Rows and lines tied to the selection, so the eye follows it.
  const emphasis = useMemo(() => {
    const rows = new Set<string>();
    const edges = new Set<string>();
    const key = (end: SchemaEndpoint) => `${end.nodeId}\u0000${end.rowId}`;
    if (selection?.kind === "relationship") {
      const edge = graph.edges.find((item) => item.id === selection.edgeId);
      if (edge) {
        edges.add(edge.id);
        rows.add(key(edge.from));
        rows.add(key(edge.to));
      }
    } else if (selection?.kind === "field") {
      // The whole lineage: where the field comes from and all that reads it.
      const trace = traceField(graph, selection);
      rows.add(key(selection));
      trace.upstream.forEach((end) => rows.add(key(end)));
      trace.downstream.forEach((end) => rows.add(key(end)));
      for (const edge of graph.edges) {
        if (!trace.edges.has(edge.id)) continue;
        edges.add(edge.id);
        rows.add(key(edge.from));
        rows.add(key(edge.to));
      }
    } else if (selection?.kind === "table") {
      for (const edge of graph.edges) {
        if (
          edge.from.nodeId === selection.nodeId ||
          edge.to.nodeId === selection.nodeId
        ) {
          edges.add(edge.id);
        }
      }
    } else if (selection?.kind === "proposal") {
      rows.add(key(selection.from));
      rows.add(key(selection.to));
    }
    // Cards outside a field's lineage fade, so its path stands out.
    const nodes =
      selection?.kind === "field"
        ? new Set([...rows].map((row) => row.split("\u0000")[0]!))
        : undefined;
    return { rows, edges, key, nodes };
  }, [graph, selection]);

  const tableCount = graph.nodes.filter((node) => node.kind === "table").length;
  const relationshipCount = graph.edges.filter(
    (edge) => edge.kind === "relationship"
  ).length;

  // Keep the selected element where the user can see it and its details.
  const selectionAnchor = useMemo(() => {
    if (!selection) return undefined;
    const toScreen = (x: number, y: number) => ({
      x: view.x + x * view.scale,
      y: view.y + y * view.scale,
    });
    if (selection.kind === "relationship" || selection.kind === "proposal") {
      const ends =
        selection.kind === "proposal"
          ? [selection.from, selection.to]
          : (() => {
              const edge = graph.edges.find(
                (item) => item.id === selection.edgeId
              );
              return edge ? [edge.from, edge.to] : [];
            })();
      const points = ends
        .map((end) => rowCenter(layout, graph, end))
        .filter((point): point is NonNullable<typeof point> => Boolean(point));
      if (!points.length) return undefined;
      const right = Math.max(
        ...points.map((point) => point.box.x + point.box.width)
      );
      const left = Math.min(...points.map((point) => point.box.x));
      const y = points.reduce((sum, point) => sum + point.y, 0) / points.length;
      return { left: toScreen(left, y), right: toScreen(right, y) };
    }
    const box = layout.boxes[selection.nodeId];
    if (!box) return undefined;
    const y =
      selection.kind === "field"
        ? (rowCenter(layout, graph, selection)?.y ?? box.y)
        : box.y + SCHEMA_SIZES.header / 2;
    return {
      left: toScreen(box.x, y),
      right: toScreen(box.x + box.width, y),
    };
  }, [graph, layout, selection, view]);

  const inspectorStyle = useMemo((): CSSProperties | undefined => {
    if (!selectionAnchor) return undefined;
    if (width < DOCKED_WIDTH) return { left: 8, right: 8, bottom: 8 };
    // Try beside, then below and above the selection; take the spot that
    // covers the least of the cards, so the details hide as little as they can.
    const gap = 14;
    const estimate = Math.min(340, height - 16);
    const { left: anchorLeft, right: anchorRight } = selectionAnchor;
    const middle = (anchorLeft.x + anchorRight.x) / 2;
    const candidates = [
      { x: anchorRight.x + gap, y: anchorRight.y - 28 },
      { x: anchorLeft.x - gap - INSPECTOR_WIDTH, y: anchorLeft.y - 28 },
      { x: middle - INSPECTOR_WIDTH / 2, y: anchorRight.y + 24 },
      { x: middle - INSPECTOR_WIDTH / 2, y: anchorRight.y - 24 - estimate },
    ].map((candidate) => ({
      x: Math.min(Math.max(8, candidate.x), width - INSPECTOR_WIDTH - 8),
      y: Math.min(Math.max(8, candidate.y), Math.max(8, height - estimate - 8)),
    }));
    const covered = (spot: { x: number; y: number }) => {
      let area = 0;
      for (const box of Object.values(layout.boxes)) {
        const left = view.x + box.x * view.scale;
        const top = view.y + box.y * view.scale;
        const overlapX =
          Math.min(left + box.width * view.scale, spot.x + INSPECTOR_WIDTH) -
          Math.max(left, spot.x);
        const overlapY =
          Math.min(top + box.height * view.scale, spot.y + estimate) -
          Math.max(top, spot.y);
        if (overlapX > 0 && overlapY > 0) area += overlapX * overlapY;
      }
      // The selection itself must stay in view.
      const hidesAnchor =
        spot.x < anchorRight.x &&
        spot.x + INSPECTOR_WIDTH > anchorLeft.x &&
        spot.y < anchorRight.y + 14 &&
        spot.y + estimate > anchorRight.y - 14;
      return area + (hidesAnchor ? 1e9 : 0);
    };
    const spot = candidates.reduce((best, candidate) =>
      covered(candidate) < covered(best) ? candidate : best
    );
    return {
      left: spot.x,
      top: spot.y,
      width: INSPECTOR_WIDTH,
      maxHeight: height - spot.y - 8,
    };
  }, [selectionAnchor, width, height, layout, view]);

  // Docked along the bottom, the details can hide the selection; bring it
  // into the space above them.
  useEffect(() => {
    if (!selection || width >= DOCKED_WIDTH || !selectionAnchor) return;
    const visibleBottom = height * 0.42;
    const y = selectionAnchor.right.y;
    if (y >= 24 && y <= visibleBottom) return;
    setView((current) => ({
      ...current,
      y: current.y + (visibleBottom / 2 - y),
    }));
    // Only a new selection moves the view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  const focusCard = (nodeId: string) =>
    viewportRef.current
      ?.querySelector<HTMLElement>(`[data-schema-node="${CSS.escape(nodeId)}"]`)
      ?.focus({ preventScroll: true });

  const onCardKeyDown = (
    event: ReactKeyboardEvent<HTMLElement>,
    node: SchemaNode
  ) => {
    const rowElement = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-schema-row]"
    );
    const rowIndex = rowElement
      ? node.rows.findIndex((row) => row.id === rowElement.dataset.schemaRow)
      : -1;
    const focusRow = (index: number) =>
      event.currentTarget
        .querySelector<HTMLElement>(
          `[data-schema-row="${CSS.escape(node.rows[index]!.id)}"]`
        )
        ?.focus({ preventScroll: true });
    if (event.key === "ArrowDown" && node.rows.length) {
      event.preventDefault();
      focusRow(Math.min(node.rows.length - 1, rowIndex + 1));
    } else if (event.key === "ArrowUp" && node.rows.length) {
      event.preventDefault();
      if (rowIndex <= 0) event.currentTarget.focus({ preventScroll: true });
      else focusRow(rowIndex - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelection(
        rowIndex >= 0
          ? { kind: "field", nodeId: node.id, rowId: node.rows[rowIndex]!.id }
          : { kind: "table", nodeId: node.id }
      );
    }
  };

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

  const ghostStart = ghost ? rowCenter(layout, graph, ghost.from) : undefined;

  return (
    <>
      {toolbarTarget ? createPortal(controls, toolbarTarget) : controls}
      <div
        ref={viewportRef}
        className="eda-schema-viewport"
        style={{ width, height }}
        role="group"
        tabIndex={-1}
        aria-roledescription="diagram"
        aria-label={`${tableCount} ${tableCount === 1 ? "table" : "tables"}, ${relationshipCount} ${relationshipCount === 1 ? "relationship" : "relationships"}`}
        data-panning={panning || undefined}
        data-linking={ghost ? "" : undefined}
        onKeyDown={(event) => {
          if (event.key !== "Escape" || !selection || event.defaultPrevented)
            return;
          event.preventDefault();
          const nodeId =
            selection.kind === "table" || selection.kind === "field"
              ? selection.nodeId
              : undefined;
          setSelection(undefined);
          if (nodeId) focusCard(nodeId);
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          const target = event.target as Element;
          const row = target.closest<HTMLElement>("[data-schema-row]");
          const card = row?.closest<HTMLElement>("[data-schema-node]");
          const node = card
            ? nodesById.get(card.dataset.schemaNode!)
            : undefined;
          press.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            view,
            moved: false,
            linkFrom:
              canRelate && row && node?.sourceId
                ? { nodeId: node.id, rowId: row.dataset.schemaRow! }
                : undefined,
          };
        }}
        onPointerMove={(event) => {
          const current = press.current;
          if (!current || current.pointerId !== event.pointerId) return;
          const dx = event.clientX - current.startX;
          const dy = event.clientY - current.startY;
          if (!current.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
          if (!current.moved) {
            current.moved = true;
            event.currentTarget.setPointerCapture?.(event.pointerId);
            if (!current.linkFrom) setPanning(true);
          }
          if (current.linkFrom) {
            const point = worldPoint(event.clientX, event.clientY);
            const over = endpointAt(event.clientX, event.clientY);
            setGhost({
              from: current.linkFrom,
              ...point,
              target:
                over &&
                over.nodeId !== current.linkFrom.nodeId &&
                nodesById.get(over.nodeId)?.sourceId
                  ? over
                  : undefined,
            });
            return;
          }
          setView({
            ...current.view,
            x: current.view.x + dx,
            y: current.view.y + dy,
          });
        }}
        onPointerUp={(event) => {
          const current = press.current;
          press.current = undefined;
          setPanning(false);
          if (!current || current.pointerId !== event.pointerId) return;
          if (current.moved && current.linkFrom) {
            const target = ghost?.target;
            setGhost(undefined);
            if (target) {
              setSelection({
                kind: "proposal",
                from: current.linkFrom,
                to: target,
              });
            }
            return;
          }
          if (current.moved) return;
          setSelection(selectionAt(event.target as Element));
        }}
        onPointerCancel={() => {
          press.current = undefined;
          setPanning(false);
          setGhost(undefined);
        }}
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
            {paths
              // A view's rows name where each field comes from; its lines
              // show only for the selection, so they do not crowd the rest.
              .filter(
                (path) =>
                  path.edge.kind !== "usage" || emphasis.edges.has(path.edge.id)
              )
              .map((path) => (
                <SchemaEdgeLine
                  key={path.edge.id}
                  path={path}
                  selected={
                    selection?.kind === "relationship" &&
                    selection.edgeId === path.edge.id
                  }
                  emphasized={emphasis.edges.has(path.edge.id)}
                  dimmed={
                    Boolean(selection) && !emphasis.edges.has(path.edge.id)
                  }
                />
              ))}
            {ghost && ghostStart && (
              <path
                className="eda-schema-edge"
                data-kind="ghost"
                d={`M ${ghostStart.box.x + ghostStart.box.width} ${ghostStart.y} L ${ghost.x} ${ghost.y}`}
              />
            )}
            {selection?.kind === "proposal" && (
              <ProposalLine
                graph={graph}
                layout={layout}
                selection={selection}
              />
            )}
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
                linkedRows={linkedRows(graph.edges, node.id)}
                selected={
                  selection?.kind === "table" && selection.nodeId === node.id
                }
                dimmed={Boolean(emphasis.nodes && !emphasis.nodes.has(node.id))}
                selectedRow={
                  selection?.kind === "field" && selection.nodeId === node.id
                    ? selection.rowId
                    : undefined
                }
                isEmphasized={(rowId) =>
                  emphasis.rows.has(emphasis.key({ nodeId: node.id, rowId }))
                }
                dropTarget={
                  ghost?.target?.nodeId === node.id
                    ? ghost.target.rowId
                    : undefined
                }
                relatable={canRelate && Boolean(node.sourceId)}
                onKeyDown={(event) => onCardKeyDown(event, node)}
              />
            );
          })}
        </div>
        {selection && inspectorStyle && (
          <SchemaInspector
            graph={graph}
            selection={selection}
            editing={editing}
            charts={charts}
            onToggleView={toggleView}
            style={inspectorStyle}
            onSelect={setSelection}
            onClose={() => setSelection(undefined)}
          />
        )}
      </div>
    </>
  );
}

/** Rows of a card that a relationship touches, so they show where lines land. */
function linkedRows(edges: SchemaEdge[], nodeId: string) {
  const rows = new Set<string>();
  for (const edge of edges) {
    if (edge.kind !== "relationship") continue;
    for (const end of [edge.from, edge.to]) {
      if (end.nodeId === nodeId) rows.add(end.rowId);
    }
  }
  return rows;
}

function SchemaCard({
  node,
  style,
  linkedRows,
  selected,
  dimmed,
  selectedRow,
  isEmphasized,
  dropTarget,
  relatable,
  onKeyDown,
}: {
  node: SchemaNode;
  style: CSSProperties;
  linkedRows: Set<string>;
  selected: boolean;
  dimmed: boolean;
  selectedRow?: string;
  isEmphasized: (rowId: string) => boolean;
  dropTarget?: string;
  relatable: boolean;
  onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
}) {
  return (
    <section
      className="eda-schema-card"
      data-kind={node.kind}
      data-schema-node={node.id}
      data-selected={selected || undefined}
      data-dimmed={dimmed || undefined}
      style={style}
      tabIndex={0}
      aria-label={`${node.title}${node.detail ? `, ${node.detail}` : ""}`}
      onKeyDown={onKeyDown}
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
      <ul
        className="eda-schema-rows"
        role="listbox"
        aria-label={`${node.title} fields`}
      >
        {node.rows.map((row) => (
          <SchemaRowItem
            key={row.id}
            row={row}
            linked={linkedRows.has(row.id)}
            selected={selectedRow === row.id}
            emphasized={isEmphasized(row.id)}
            dropTarget={dropTarget === row.id}
            relatable={relatable}
          />
        ))}
        {node.rows.length === 0 && (
          <li className="eda-schema-row eda-schema-empty">No fields</li>
        )}
      </ul>
    </section>
  );
}

const STEP_ICONS = {
  source: Database,
  lookup: Link2,
  expand: Split,
  calculate: Sigma,
  filter: Filter,
  aggregate: Sigma,
} as const;

function SchemaRowItem({
  row,
  linked,
  selected,
  emphasized,
  dropTarget,
  relatable,
}: {
  row: SchemaRow;
  linked: boolean;
  selected: boolean;
  emphasized: boolean;
  dropTarget: boolean;
  relatable: boolean;
}) {
  if (row.kind === "heading") {
    return (
      <li
        className="eda-schema-row"
        data-kind="heading"
        role="presentation"
        style={{ height: SCHEMA_SIZES.row }}
      >
        <span className="eda-schema-label">{row.label}</span>
      </li>
    );
  }
  const Icon =
    row.kind === "step" && row.step
      ? STEP_ICONS[row.step]
      : row.dataType
        ? typeIcons[row.dataType]
        : undefined;
  const type = row.dataType ? typeLabels[row.dataType] : undefined;
  const facts = [
    row.kind === "step" ? "step" : row.kind === "use" ? undefined : type,
    row.detail,
    row.key ? "key" : undefined,
    row.calculation ? `calculated: ${row.calculation.expression}` : undefined,
    row.status === "missing" ? "missing from its query" : undefined,
    row.status === "error" ? (row.calculation?.error ?? "error") : undefined,
  ].filter(Boolean);
  return (
    <li
      className="eda-schema-row"
      style={{ height: SCHEMA_SIZES.row }}
      tabIndex={-1}
      data-kind={row.kind ?? "field"}
      data-schema-row={row.id}
      data-linked={linked || undefined}
      data-selected={selected || undefined}
      data-emphasized={emphasized || undefined}
      data-drop-target={dropTarget || undefined}
      data-relatable={relatable || undefined}
      data-status={row.status}
      data-calculated={row.calculation ? "" : undefined}
      aria-label={[row.label, ...facts].join(", ")}
      aria-selected={selected}
      role="option"
    >
      <span className="eda-schema-type" aria-hidden="true">
        {row.mark ? (
          <span className="eda-schema-calc-mark">{row.mark}</span>
        ) : Icon ? (
          <Icon />
        ) : null}
      </span>
      <span className="eda-schema-label">{row.label}</span>
      {row.detail && (
        <span className="eda-schema-row-detail">{row.detail}</span>
      )}
      {row.status && (
        <AlertTriangle className="eda-schema-status" aria-hidden="true" />
      )}
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

function SchemaEdgeLine({
  path,
  selected,
  emphasized,
  dimmed,
}: {
  path: SchemaEdgePath;
  selected: boolean;
  emphasized: boolean;
  dimmed: boolean;
}) {
  const { edge } = path;
  if (edge.kind !== "relationship") {
    return (
      <path
        className="eda-schema-edge"
        data-kind={edge.kind}
        data-emphasized={emphasized || undefined}
        data-dimmed={dimmed || undefined}
        d={path.d}
      />
    );
  }
  const cardinality = edge.cardinality ?? "many-to-one";
  const fromMany =
    cardinality === "many-to-one" || cardinality === "many-to-many";
  const toMany =
    cardinality === "one-to-many" || cardinality === "many-to-many";
  return (
    <g
      className="eda-schema-edge-group"
      data-selected={selected || undefined}
      data-emphasized={emphasized || undefined}
      data-dimmed={dimmed || undefined}
    >
      <path className="eda-schema-edge" data-kind="relationship" d={path.d} />
      <path
        className="eda-schema-edge-mark"
        d={`${cardinalityMarks(path.start, fromMany)} ${cardinalityMarks(path.end, toMany)}`}
      />
      {/* A wide, invisible stroke that takes clicks on the line. */}
      <path
        className="eda-schema-edge-hit"
        data-schema-edge={edge.id}
        d={path.d}
      />
    </g>
  );
}

/** The pending link between the two fields of a proposal. */
function ProposalLine({
  graph,
  layout,
  selection,
}: {
  graph: SchemaGraph;
  layout: SchemaLayout;
  selection: Extract<SchemaSelection, { kind: "proposal" }>;
}) {
  const path = routeSchemaEdge(graph, layout, {
    id: "proposal",
    kind: "relationship",
    from: selection.from,
    to: selection.to,
  });
  if (!path) return null;
  return <path className="eda-schema-edge" data-kind="ghost" d={path.d} />;
}
