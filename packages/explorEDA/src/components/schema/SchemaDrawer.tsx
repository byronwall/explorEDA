import { useMemo, type RefObject } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { tableSchemaGraph, type SchemaGraph } from "@/lib/schema/schemaGraph";
import { WorkspaceDrawer } from "../WorkspaceDrawer";
import { useCalculationEditor } from "../calculations/CalculationEditor";
import { SchemaDiagram } from "./SchemaDiagram";
import type { SchemaEditing, SchemaProjectEditing } from "./schemaEditing";

/** A single-table workspace's schema: its fields and calculated fields. */
function useWorkspaceSchemaGraph(enabled: boolean): SchemaGraph | undefined {
  const profiles = useDataLayer((state) => state.fieldProfiles);
  const calculations = useDataLayer((state) => state.calculations);
  const rowCount = useDataLayer((state) => state.data.length);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  // What the charts, Rows, and summaries read, for the workspace's usage card.
  const charts = useDataLayer((state) => state.charts);
  const rowsSettings = useDataLayer((state) => state.rowsSettings);
  const aggregates = useDataLayer((state) => state.aggregates);
  const saveToStructure = useDataLayer((state) => state.saveToStructure);
  const settings = useMemo(
    () => (enabled ? saveToStructure() : undefined),
    // The saved structure changes with these.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, charts, rowsSettings, aggregates, calculations]
  );
  return useMemo(
    () =>
      enabled
        ? tableSchemaGraph({
            title: "Data",
            rowCount,
            fields: profiles
              .filter((profile) => profile.name !== "__ID")
              .map((profile) => ({
                name: profile.name,
                label: getFieldLabel(profile.name),
                dataType: profile.dataType,
              })),
            calculations: calculations.map((calculation) => ({
              name: calculation.resultColumnName,
              expression: calculation.expression.rawInput,
              dependencies: calculation.expression.dependencies,
            })),
            settings,
          })
        : undefined,
    // Field labels come from the field settings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      enabled,
      profiles,
      calculations,
      rowCount,
      getFieldLabel,
      fieldSettings,
      settings,
    ]
  );
}

function countLabel(count: number, one: string, many: string) {
  return `${count.toLocaleString("en-US")} ${count === 1 ? one : many}`;
}

/** The schema diagram in a drawer as wide as Rows. */
export function SchemaDrawer({
  id,
  graph: hostGraph,
  projectEditing,
  viewId,
  onShowChart,
  onAddSource,
  focusNodeId,
  readOnly = false,
  containerRef,
  onClose,
}: {
  id: string;
  /** A project's schema. Without it, the drawer shows this workspace's table. */
  graph?: SchemaGraph;
  projectEditing?: SchemaProjectEditing;
  /** The project view this workspace shows, whose calculations it edits. */
  viewId?: string;
  /** Close the drawer and show one of this workspace's charts. */
  onShowChart?: (chartId: string) => void;
  /** Add a table; the host picks the file. */
  onAddSource?: () => void;
  /** A card to select when the diagram opens. */
  focusNodeId?: string;
  /** Show and select without edits. */
  readOnly?: boolean;
  containerRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}) {
  const workspaceGraph = useWorkspaceSchemaGraph(!hostGraph);
  const graph = hostGraph ?? workspaceGraph!;
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const updateFieldSettings = useDataLayer(
    (state) => state.updateFieldSettings
  );
  const calculationEditor = useCalculationEditor();
  const editing = useMemo((): SchemaEditing | undefined => {
    if (readOnly) return undefined;
    const calculations = (nodeId: string) =>
      calculationEditor
        ? {
            nodeId,
            open: (name?: string, returnFocus?: HTMLElement | null) =>
              calculationEditor.open(name, undefined, returnFocus),
          }
        : undefined;
    if (hostGraph) {
      return {
        project: projectEditing,
        calculations: viewId ? calculations(`view:${viewId}`) : undefined,
      };
    }
    return {
      fields: {
        settings: (field) => fieldSettings[field] ?? {},
        update: updateFieldSettings,
      },
      calculations: calculations("table:data"),
    };
  }, [
    readOnly,
    hostGraph,
    projectEditing,
    viewId,
    fieldSettings,
    updateFieldSettings,
    calculationEditor,
  ]);
  const tables = graph.nodes.filter((node) => node.kind === "table");
  const queries = graph.nodes.filter((node) => node.kind === "query").length;
  const views = graph.nodes.filter((node) => node.kind === "view").length;
  const fields = tables.reduce((sum, node) => sum + node.rows.length, 0);
  const relationships = graph.edges.filter(
    (edge) => edge.kind === "relationship"
  ).length;
  const facts = [
    countLabel(tables.length, "table", "tables"),
    countLabel(fields, "field", "fields"),
    tables.length > 1
      ? countLabel(relationships, "relationship", "relationships")
      : undefined,
    queries ? countLabel(queries, "query", "queries") : undefined,
    views && hostGraph ? countLabel(views, "view", "views") : undefined,
  ].filter(Boolean);

  return (
    <WorkspaceDrawer
      id={id}
      heading="Schema diagram"
      className="eda-schema-drawer"
      scope={<span className="eda-schema-facts">{facts.join(" · ")}</span>}
      containerRef={containerRef}
      closeLabel="Close the schema diagram"
      closeTooltip="Close the schema diagram (Esc)"
      onClose={onClose}
    >
      {(size, toolbarTarget) => (
        <SchemaDiagram
          graph={graph}
          width={size.width}
          height={size.height}
          toolbarTarget={toolbarTarget}
          editing={editing}
          onAddSource={onAddSource}
          focusNodeId={focusNodeId}
          charts={
            onShowChart && (!hostGraph || viewId)
              ? {
                  nodeId: hostGraph ? `view:${viewId}` : "view:workspace",
                  onShowChart,
                }
              : undefined
          }
        />
      )}
    </WorkspaceDrawer>
  );
}
