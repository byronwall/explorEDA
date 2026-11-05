import { useState } from "react";
import type {
  AnalysisEvaluation,
  AnalysisProject,
  AnalysisQuery,
  AnalysisView,
} from "@/types/AnalysisProject";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionTooltip } from "@/components/ui/tooltip";
import { Network } from "lucide-react";
import type { LinkProposal } from "@/lib/project/linkProposals";
import { relationshipDirection } from "./queryEditing";
import {
  FOLLOW_MODE_HELP as MODE_HELP,
  followRelationship,
  type FollowMeasure as Measure,
  type FollowMode as Mode,
} from "./stepEditing";

/**
 * Follow a relationship from the current rows without silently changing them.
 * With none that reaches these rows, it says how to make one.
 */
export function QueryRelationshipBuilder({
  project,
  query,
  view,
  evaluation,
  readOnly,
  onChange,
  onOpenView,
  onOpenDiagram,
  suggestions = [],
}: {
  project: AnalysisProject;
  query: AnalysisQuery;
  view: AnalysisView;
  evaluation: AnalysisEvaluation;
  readOnly: boolean;
  onChange: (project: AnalysisProject, view: AnalysisView) => void;
  onOpenView?: (
    view: AnalysisView,
    name: string,
    project?: AnalysisProject
  ) => void;
  /** Opens the Schema diagram on this table, to relate it. */
  onOpenDiagram?: (sourceId?: string) => void;
  /** Drafted links, to review in the Schema diagram. */
  suggestions?: LinkProposal[];
}) {
  const [relationshipId, setRelationshipId] = useState("");
  const [mode, setMode] = useState<Mode>("lookup");
  const [measure, setMeasure] = useState<Measure>("count");
  const [measureFieldId, setMeasureFieldId] = useState("");

  const outputFields =
    evaluation.stages.find((stage) => stage.stepId === query.outputStepId)
      ?.fields ?? evaluation.fields;
  // A relationship this query already follows would only add its fields twice.
  const followed = new Set(
    query.steps.flatMap((step) =>
      step.kind === "lookup" || step.kind === "expand"
        ? [step.relationshipId]
        : []
    )
  );
  const usable = project.relationships.flatMap((relationship) => {
    if (followed.has(relationship.id)) return [];
    const direction = relationshipDirection(relationship, outputFields);
    return direction ? [{ relationship, direction }] : [];
  });
  if (!usable.length) {
    // One table has nothing to relate to.
    if (project.sources.length < 2 || !onOpenDiagram) return null;
    const first = query.steps.find((step) => step.kind === "source");
    const sourceId = first?.kind === "source" ? first.sourceId : undefined;
    const suggested = suggestions.filter(
      (item) => item.from.sourceId === sourceId || item.to.sourceId === sourceId
    ).length;
    if (suggested) {
      return (
        <section className="space-y-1.5" aria-labelledby="query-relate-heading">
          <h3 id="query-relate-heading" className="text-xs font-medium">
            Use a relationship
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <p className="text-xs text-muted-foreground">
              {suggested} suggested {suggested === 1 ? "link" : "links"} from
              this table, drafted from its keys.
            </p>
            <Button
              size="sm"
              variant="outline"
              tooltip="Opens the Schema diagram, where suggested links are dashed. Accept them, then add the related fields here."
              onClick={() => onOpenDiagram(sourceId)}
            >
              <Network aria-hidden="true" />
              Review {suggested === 1 ? "link" : "links"}
            </Button>
          </div>
        </section>
      );
    }
    return (
      <section className="space-y-1.5" aria-labelledby="query-relate-heading">
        <h3 id="query-relate-heading" className="text-xs font-medium">
          Use a relationship
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <p className="text-xs text-muted-foreground">
            Relate a field of this table to another table.
          </p>
          <Button
            size="sm"
            variant="outline"
            tooltip="Opens the Schema diagram on this table. Drag one of its fields onto the matching field of another table."
            onClick={() => onOpenDiagram(sourceId)}
          >
            <Network aria-hidden="true" />
            Relate tables
          </Button>
        </div>
      </section>
    );
  }
  const selected =
    usable.find((item) => item.relationship.id === relationshipId) ??
    usable[0]!;
  const { relationship, direction } = selected;
  const target = project.sources.find(
    (source) => source.id === direction.targetSourceId
  );
  const numericFields =
    target?.fields.filter((field) => field.type === "number") ?? [];
  const sumField = measureFieldId || numericFields[0]?.id || "";
  const blocked =
    readOnly ||
    !target ||
    (mode === "lookup" && !direction.single) ||
    (mode === "aggregate" && measure !== "count" && !sumField) ||
    (mode === "expand" && !onOpenView);

  function apply() {
    if (blocked || !target) return;
    const result = followRelationship({
      project,
      query,
      relationship,
      mode,
      measure,
      measureFieldId: sumField,
    });
    if (result.kind === "replace") onChange(result.project, view);
    else if (result.kind === "open")
      onOpenView?.(result.view, result.name, result.project);
  }

  const targetName = target?.name ?? "related";
  return (
    <section className="space-y-2" aria-labelledby="query-relate-heading">
      <h3 id="query-relate-heading" className="text-xs font-medium">
        Use a relationship
      </h3>
      <div className="eda-setting-grid text-xs">
        <span>Relationship</span>
        <Select value={relationship.id} onValueChange={setRelationshipId}>
          <SelectTrigger aria-label="Relationship to follow">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {usable.map((item) => (
              <SelectItem
                key={item.relationship.id}
                value={item.relationship.id}
              >
                {item.relationship.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>Effect</span>
        <ActionTooltip content={MODE_HELP[mode]}>
          <span className="block min-w-0">
            <Select
              value={mode}
              onValueChange={(value) => setMode(value as Mode)}
            >
              <SelectTrigger aria-label="How the relationship affects rows">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lookup">Add fields · same rows</SelectItem>
                <SelectItem value="aggregate">
                  Summarize related rows · same rows
                </SelectItem>
                {onOpenView && (
                  <SelectItem value="expand">
                    One row per related record · new view
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </span>
        </ActionTooltip>
        {mode === "aggregate" && (
          <>
            <span>Measure</span>
            <Select
              value={measure}
              onValueChange={(value) => setMeasure(value as Measure)}
            >
              <SelectTrigger aria-label="Related row measure">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="count">Count</SelectItem>
                <SelectItem value="sum" disabled={!numericFields.length}>
                  Sum
                </SelectItem>
                <SelectItem value="average" disabled={!numericFields.length}>
                  Average
                </SelectItem>
              </SelectContent>
            </Select>
            {measure !== "count" && (
              <>
                <span>Field</span>
                <Select value={sumField} onValueChange={setMeasureFieldId}>
                  <SelectTrigger aria-label="Related field to summarize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {numericFields.map((field) => (
                      <SelectItem key={field.id} value={field.id}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </>
        )}
      </div>
      {mode === "lookup" && !direction.single && (
        <p className="text-xs text-muted-foreground" role="status">
          Each row can match several {targetName} records. Summarize them, or
          expand to one row per record.
        </p>
      )}
      <Button
        size="sm"
        disabled={blocked}
        tooltip={
          mode === "expand"
            ? "Opens a new view with one row per related record. This query is unchanged."
            : "Changes this query, so every view that uses it gets the change."
        }
        onClick={apply}
      >
        {mode === "lookup"
          ? `Add ${targetName} fields`
          : mode === "aggregate"
            ? "Add summary"
            : "Open expanded view"}
      </Button>
    </section>
  );
}
