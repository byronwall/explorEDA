import type {
  AnalysisProject,
  AnalysisSourceRow,
  RelationshipDefinition,
} from "@/types/AnalysisProject";

/**
 * Relationship rules shared by the Schema panel and the schema diagram, so a
 * link proposed in either place is checked, named, and saved the same way.
 */

export type Cardinality = RelationshipDefinition["cardinality"];

export const CARDINALITY_LABELS: Record<Cardinality, string> = {
  "many-to-one": "Many to one",
  "one-to-one": "One to one",
  "one-to-many": "One to many",
  "many-to-many": "Many to many",
};

export interface FieldRef {
  sourceId: string;
  fieldId: string;
}

export interface MatchCounts {
  matched: number;
  unmatched: number;
  ambiguous: number;
  expanded: number;
}

/** How the rows of one table find rows of another through a pair of fields. */
export function countMatches(
  fromRows: readonly AnalysisSourceRow[],
  fromField: string,
  toRows: readonly AnalysisSourceRow[],
  toField: string
): MatchCounts {
  const counts = new Map<unknown, number>();
  for (const row of toRows) {
    const key = row[toField];
    if (key != null) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let matched = 0;
  let unmatched = 0;
  let ambiguous = 0;
  let expanded = 0;
  for (const row of fromRows) {
    const key = row[fromField];
    const count = key == null ? 0 : (counts.get(key) ?? 0);
    if (!count) unmatched += 1;
    else {
      matched += 1;
      if (count > 1) ambiguous += 1;
      expanded += Math.max(0, count - 1);
    }
  }
  return { matched, unmatched, ambiguous, expanded };
}

/** A lookup cannot follow a link whose rows match more than one record. */
export function blockedByAmbiguity(
  counts: MatchCounts | undefined,
  cardinality: Cardinality
) {
  return Boolean(
    counts?.ambiguous &&
      (cardinality === "many-to-one" || cardinality === "one-to-one")
  );
}

export function sourceName(project: AnalysisProject, sourceId: string) {
  return (
    project.sources.find((source) => source.id === sourceId)?.name ?? sourceId
  );
}

export function fieldName(project: AnalysisProject, ref: FieldRef) {
  return (
    project.sources
      .find((source) => source.id === ref.sourceId)
      ?.fields.find((field) => field.id === ref.fieldId)?.name ?? ref.fieldId
  );
}

/** A new link between two fields, or an edit that keeps an existing link's ID and name. */
export function proposeRelationship(
  project: AnalysisProject,
  from: FieldRef,
  to: FieldRef,
  cardinality: Cardinality,
  existing?: RelationshipDefinition
): RelationshipDefinition {
  return {
    id:
      existing?.id ??
      `rel-${from.sourceId}-${from.fieldId}-${to.sourceId}-${to.fieldId}`,
    name:
      existing?.name ??
      `${sourceName(project, from.sourceId)} to ${sourceName(project, to.sourceId)}`,
    from,
    to,
    cardinality,
  };
}

/** Why two fields cannot be linked, if they cannot. */
export function proposalProblem(
  project: AnalysisProject,
  from: FieldRef,
  to: FieldRef,
  editingId?: string
): string | undefined {
  if (from.sourceId === to.sourceId) {
    return "Choose a field in another table.";
  }
  const id = `rel-${from.sourceId}-${from.fieldId}-${to.sourceId}-${to.fieldId}`;
  if (
    project.relationships.some(
      (relationship) => relationship.id === id && relationship.id !== editingId
    )
  ) {
    return "This relationship already exists.";
  }
  return undefined;
}

/** Queries that follow a relationship through a lookup or expansion. */
export function queriesUsingRelationship(
  project: AnalysisProject,
  relationshipId: string
) {
  return project.queries.filter((query) =>
    query.steps.some(
      (step) =>
        (step.kind === "lookup" || step.kind === "expand") &&
        step.relationshipId === relationshipId
    )
  );
}

export function addRelationship(
  project: AnalysisProject,
  relationship: RelationshipDefinition
): AnalysisProject {
  return {
    ...project,
    relationships: [...project.relationships, relationship],
  };
}

export function replaceRelationship(
  project: AnalysisProject,
  id: string,
  relationship: RelationshipDefinition
): AnalysisProject {
  return {
    ...project,
    relationships: project.relationships.map((item) =>
      item.id === id ? relationship : item
    ),
  };
}

export function removeRelationship(
  project: AnalysisProject,
  id: string
): AnalysisProject {
  return {
    ...project,
    relationships: project.relationships.filter((item) => item.id !== id),
  };
}
