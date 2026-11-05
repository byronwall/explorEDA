import type {
  AnalysisField,
  AnalysisProject,
  AnalysisQuery,
  FieldDefinition,
} from "@/types/AnalysisProject";
import { relationshipDirection } from "./queryEditing";
import { followRelationship } from "./stepEditing";

/** A table a lookup can reach from a query's rows, with the fields it adds. */
export interface RelatedTable {
  relationshipId: string;
  /** The table name, with the field it is reached through when two links reach it. */
  label: string;
  fields: FieldDefinition[];
}

/** A table whose records would multiply the rows, so it opens a new view. */
export interface ExpandedTable {
  relationshipId: string;
  label: string;
}

/**
 * Relationships a query does not follow yet, from its output rows: lookups
 * that keep one row per row, and links that would multiply them.
 */
export function relatedTables(
  project: AnalysisProject,
  query: AnalysisQuery,
  outputFields: AnalysisField[]
) {
  const followed = new Set(
    query.steps.flatMap((step) =>
      step.kind === "lookup" || step.kind === "expand"
        ? [step.relationshipId]
        : []
    )
  );
  const reachable = project.relationships.flatMap((relationship) => {
    if (followed.has(relationship.id)) return [];
    const direction = relationshipDirection(relationship, outputFields);
    const target = direction
      ? project.sources.find((item) => item.id === direction.targetSourceId)
      : undefined;
    return direction && target ? [{ relationship, direction, target }] : [];
  });
  const label = ({ direction, target }: (typeof reachable)[number]) =>
    reachable.filter((item) => item.target.id === target.id).length > 1
      ? `${target.name} (${direction.inputField.name})`
      : target.name;

  const lookups: RelatedTable[] = reachable
    .filter((item) => item.direction.single)
    .map((item) => ({
      relationshipId: item.relationship.id,
      label: label(item),
      // The matched key repeats the field the rows already have.
      fields: item.target.fields.filter(
        (field) => field.id !== item.direction.targetFieldId
      ),
    }));
  const expands: ExpandedTable[] = reachable
    .filter((item) => !item.direction.single)
    .map((item) => ({
      relationshipId: item.relationship.id,
      label: label(item),
    }));
  return { lookups, expands };
}

/**
 * Adds a lookup through a relationship to the end of a query, and names the
 * field id one of its fields gets in the query's rows.
 */
export function lookupField(
  project: AnalysisProject,
  query: AnalysisQuery,
  relationshipId: string,
  fieldId: string
) {
  const relationship = project.relationships.find(
    (item) => item.id === relationshipId
  );
  if (!relationship) return undefined;
  const result = followRelationship({
    project,
    query,
    relationship,
    mode: "lookup",
  });
  if (result.kind !== "replace") return undefined;
  const next = result.project.queries.find((item) => item.id === query.id);
  const step = next?.steps.at(-1);
  if (step?.kind !== "lookup") return undefined;
  return { project: result.project, fieldId: `${step.as}.${fieldId}` };
}
