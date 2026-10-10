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
import { relationshipDirection } from "./queryEditing";
import {
  FOLLOW_MODE_HELP as MODE_HELP,
  followRelationship,
  type FollowMeasure as Measure,
  type FollowMode as Mode,
} from "./stepEditing";

/** Follow a relationship from the current rows without silently changing them. */
export function QueryRelationshipBuilder({
  project,
  query,
  view,
  evaluation,
  readOnly,
  onChange,
  onOpenView,
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
}) {
  const [relationshipId, setRelationshipId] = useState("");
  const [mode, setMode] = useState<Mode>("lookup");
  const [measure, setMeasure] = useState<Measure>("count");
  const [measureFieldId, setMeasureFieldId] = useState("");

  const outputFields =
    evaluation.stages.find((stage) => stage.stepId === query.outputStepId)
      ?.fields ?? evaluation.fields;
  const usable = project.relationships.flatMap((relationship) => {
    const direction = relationshipDirection(relationship, outputFields);
    return direction ? [{ relationship, direction }] : [];
  });
  if (!usable.length) return null;
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

  return (
    <section className="space-y-3 border-t border-border pt-4">
      <div>
        <h3 className="font-medium">Use a relationship</h3>
        <p className="text-xs text-muted-foreground">
          Changes to this query apply to every view that uses it.
        </p>
      </div>
      <label className="block space-y-1 text-xs">
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
      </label>
      <label className="block space-y-1 text-xs">
        <span>Effect</span>
        <ActionTooltip content={MODE_HELP[mode]}>
          <span className="block">
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
                <SelectItem value="expand">
                  One row per related record · new view
                </SelectItem>
              </SelectContent>
            </Select>
          </span>
        </ActionTooltip>
      </label>
      {mode === "aggregate" && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <label className="block space-y-1">
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
          </label>
          {measure !== "count" && (
            <label className="block space-y-1">
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
            </label>
          )}
        </div>
      )}
      {mode === "lookup" && !direction.single && (
        <p className="text-xs text-muted-foreground" role="status">
          Each row can match several {target?.name ?? "related"} records.
          Summarize them, or expand to one row per record.
        </p>
      )}
      <Button size="sm" disabled={blocked} onClick={apply}>
        {mode === "lookup"
          ? "Add fields"
          : mode === "aggregate"
            ? "Add summary"
            : "Open expanded view"}
      </Button>
    </section>
  );
}
