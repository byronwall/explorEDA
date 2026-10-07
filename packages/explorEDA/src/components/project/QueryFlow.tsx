import { useState } from "react";
import type {
  AnalysisDiagnostic,
  AnalysisEvaluation,
  AnalysisProject,
  AnalysisQuery,
  AnalysisStep,
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
import { cn } from "@/lib/utils";
import {
  relationshipDirection,
  replaceQuery,
  stepDetail,
  stepTitle,
} from "./queryEditing";

const rows = (n: number) => (n === 1 ? "1 row" : `${n.toLocaleString()} rows`);
const DIAGNOSTIC_TEXT: Record<
  AnalysisDiagnostic["code"],
  (n: number) => string
> = {
  "missing-source": () => "A source table is unavailable.",
  "missing-key": (n) => `${rows(n)} without a key value.`,
  "duplicate-key": (n) => `${rows(n)} share a key with another row.`,
  "ambiguous-lookup": (n) =>
    `${rows(n)} match more than one related record, so their related fields stay empty.`,
  "missing-lookup": (n) => `${rows(n)} without a related record.`,
  "invalid-query": () => "Some inputs are invalid.",
  "calculation-error": (n) => `${rows(n)} could not be calculated.`,
  "missing-parameter": () => "Some inputs are not set.",
  "conflicting-entity-measure": (n) =>
    `${n === 1 ? "1 ID has" : `${n.toLocaleString()} IDs have`} different values, so a summary is unavailable.`,
};

/** Each step with its row counts, oldest first. Selecting one shows its rows. */
export function QueryFlow({
  project,
  query,
  evaluation,
  selectedStepId,
  full,
  readOnly,
  onSelectStep,
  onModeChange,
  onChange,
}: {
  project: AnalysisProject;
  query: AnalysisQuery;
  evaluation: AnalysisEvaluation;
  selectedStepId: string | undefined;
  full: boolean;
  readOnly: boolean;
  onSelectStep: (stepId: string) => void;
  onModeChange: (full: boolean) => void;
  onChange: (project: AnalysisProject) => void;
}) {
  const ordered = evaluation.stages.length
    ? evaluation.stages.flatMap((stage) => {
        const step = query.steps.find((item) => item.id === stage.stepId);
        return step ? [step] : [];
      })
    : query.steps;
  // Summary shows the selected step and the output; Full shows every step.
  const shown = full
    ? ordered
    : ordered.filter(
        (step) => step.id === selectedStepId || step.id === query.outputStepId
      );

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium">Query flow</h3>
        <div
          className="flex rounded-md border border-border p-0.5"
          role="group"
          aria-label="Query flow detail"
        >
          {[false, true].map((value) => (
            <ActionTooltip
              key={String(value)}
              content={
                value
                  ? "Every step, with its condition and row counts"
                  : "Only the selected step and the query output"
              }
            >
              <button
                type="button"
                aria-pressed={full === value}
                className="rounded px-2 py-1 text-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-muted"
                onClick={() => onModeChange(value)}
              >
                {value ? "Full" : "Summary"}
              </button>
            </ActionTooltip>
          ))}
        </div>
      </div>
      <ol className="space-y-2">
        {shown.map((step) => (
          <FlowStep
            key={step.id}
            project={project}
            query={query}
            step={step}
            evaluation={evaluation}
            active={step.id === selectedStepId}
            detailed={full || step.id === selectedStepId}
            readOnly={readOnly}
            onSelect={() => onSelectStep(step.id)}
            onChange={onChange}
          />
        ))}
      </ol>
      <Diagnostics diagnostics={evaluation.diagnostics} />
    </section>
  );
}

function FlowStep({
  project,
  query,
  step,
  evaluation,
  active,
  detailed,
  readOnly,
  onSelect,
  onChange,
}: {
  project: AnalysisProject;
  query: AnalysisQuery;
  step: AnalysisStep;
  evaluation: AnalysisEvaluation;
  active: boolean;
  detailed: boolean;
  readOnly: boolean;
  onSelect: () => void;
  onChange: (project: AnalysisProject) => void;
}) {
  const [replacement, setReplacement] = useState("");
  const stage = evaluation.stages.find((item) => item.stepId === step.id);
  const inputFields =
    step.kind === "source"
      ? []
      : (evaluation.stages.find((item) => item.stepId === step.inputStepId)
          ?.fields ?? []);
  const unresolved =
    (step.kind === "lookup" || step.kind === "expand") &&
    !project.relationships.some((item) => item.id === step.relationshipId);
  const replacements =
    unresolved && (step.kind === "lookup" || step.kind === "expand")
      ? project.relationships.filter((relationship) => {
          const direction = relationshipDirection(relationship, inputFields);
          return (
            direction &&
            (!step.inputFieldId ||
              direction.inputField.id === step.inputFieldId)
          );
        })
      : [];
  const detail = stepDetail(step, project, inputFields);
  const title = stepTitle(step, project);

  function repair() {
    onChange(
      replaceQuery(project, {
        ...query,
        steps: query.steps.map((item) =>
          item.id === step.id &&
          (item.kind === "lookup" || item.kind === "expand")
            ? { ...item, relationshipId: replacement }
            : item
        ),
      })
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "step" : undefined}
        className={cn(
          "w-full rounded-md border p-2.5 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active ? "border-ring bg-muted/50" : "border-border"
        )}
      >
        <div className="flex items-baseline gap-2">
          <span className="min-w-0 flex-1 font-medium">{title}</span>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {stage
              ? stage.inputCount === stage.outputCount || step.kind === "source"
                ? `${stage.outputCount.toLocaleString()} rows`
                : `${stage.inputCount.toLocaleString()} → ${stage.outputCount.toLocaleString()} rows`
              : "—"}
          </span>
        </div>
        {detailed && detail && (
          <p className="mt-1 break-words text-xs text-muted-foreground">
            {detail}
          </p>
        )}
        {unresolved && (
          <p role="alert" className="mt-1 text-xs text-destructive">
            Its relationship was removed. Choose a replacement to restore it.
          </p>
        )}
      </button>
      {unresolved && !readOnly && (
        <div className="mt-2 space-y-2 rounded-md border border-warning p-2.5">
          {replacements.length ? (
            <div className="flex gap-2">
              <Select value={replacement} onValueChange={setReplacement}>
                <SelectTrigger
                  aria-label={`Replacement relationship for ${title}`}
                >
                  <SelectValue placeholder="Choose a relationship" />
                </SelectTrigger>
                <SelectContent>
                  {replacements.map((relationship) => (
                    <SelectItem key={relationship.id} value={relationship.id}>
                      {relationship.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={repair} disabled={!replacement}>
                Repair
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No relationship starts from this step’s field. Add one in Schema.
            </p>
          )}
        </div>
      )}
    </li>
  );
}

/** Data problems found while evaluating, counted by kind. */
function Diagnostics({ diagnostics }: { diagnostics: AnalysisDiagnostic[] }) {
  if (!diagnostics.length) return null;
  const counts = new Map<AnalysisDiagnostic["code"], number>();
  for (const item of diagnostics)
    counts.set(item.code, (counts.get(item.code) ?? 0) + 1);
  return (
    <ul
      aria-label="Data checks"
      className="space-y-1 rounded-md border border-warning p-2.5 text-xs"
    >
      {[...counts].map(([code, count]) => (
        <li key={code}>{DIAGNOSTIC_TEXT[code](count)}</li>
      ))}
    </ul>
  );
}
