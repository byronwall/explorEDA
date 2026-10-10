import { useMemo, type RefObject } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { tableSchemaGraph, type SchemaGraph } from "@/lib/schema/schemaGraph";
import { WorkspaceDrawer } from "../WorkspaceDrawer";
import { SchemaDiagram } from "./SchemaDiagram";
import type { SchemaEditing, SchemaProjectEditing } from "./schemaEditing";

/** A single-table workspace's schema: its fields and calculated fields. */
function useWorkspaceSchemaGraph(enabled: boolean): SchemaGraph | undefined {
  const profiles = useDataLayer((state) => state.fieldProfiles);
  const calculations = useDataLayer((state) => state.calculations);
  const rowCount = useDataLayer((state) => state.data.length);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
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
          })
        : undefined,
    // Field labels come from the field settings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, profiles, calculations, rowCount, getFieldLabel, fieldSettings]
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
  readOnly = false,
  containerRef,
  onClose,
}: {
  id: string;
  /** A project's schema. Without it, the drawer shows this workspace's table. */
  graph?: SchemaGraph;
  projectEditing?: SchemaProjectEditing;
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
  const editing = useMemo((): SchemaEditing | undefined => {
    if (readOnly) return undefined;
    if (hostGraph)
      return projectEditing ? { project: projectEditing } : undefined;
    return {
      fields: {
        settings: (field) => fieldSettings[field] ?? {},
        update: updateFieldSettings,
      },
    };
  }, [readOnly, hostGraph, projectEditing, fieldSettings, updateFieldSettings]);
  const tables = graph.nodes.filter((node) => node.kind === "table");
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
        />
      )}
    </WorkspaceDrawer>
  );
}
