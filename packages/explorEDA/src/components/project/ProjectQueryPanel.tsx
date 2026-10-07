import { Copy, ExternalLink } from "lucide-react";
import type {
  AnalysisEvaluation,
  AnalysisProject,
  AnalysisScalar,
  AnalysisSourceRow,
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
import { copyQuery, newId, queryForStage } from "./queryEditing";
import { queryParameters } from "./parameterBindings";
import { QueryParameters } from "./QueryParameters";
import { QueryRelationshipBuilder } from "./QueryRelationshipBuilder";
import { QueryFlow } from "./QueryFlow";
import { QueryStageRows } from "./QueryStageRows";

type OpenView = (
  view: AnalysisView,
  name: string,
  project?: AnalysisProject
) => void;

/**
 * The selected view's query: pick another, follow relationships, set inputs,
 * and walk every step down to its rows and their source records.
 */
export function ProjectQueryPanel({
  project,
  view,
  tables,
  evaluation,
  pending,
  incompatibleFields,
  unresolvedRowKeys,
  focusRowKeys,
  readOnly,
  onChange,
  onClearFocus,
  onResetSettings,
  onOpenView,
}: {
  project: AnalysisProject;
  view: AnalysisView;
  tables: Record<string, readonly AnalysisSourceRow[]>;
  evaluation: AnalysisEvaluation;
  pending: boolean;
  incompatibleFields: string[];
  unresolvedRowKeys: number;
  focusRowKeys?: string[];
  readOnly: boolean;
  onChange: (project: AnalysisProject, view: AnalysisView) => void;
  onClearFocus: () => void;
  onResetSettings?: () => void;
  onOpenView?: OpenView;
}) {
  const query = project.queries.find((item) => item.id === view.queryId);
  const parameters = queryParameters(project.parameters, query);
  const changeView = (next: AnalysisView) => onChange(project, next);
  const selectQuery = (queryId: string) =>
    changeView({
      ...view,
      queryId,
      inspection: { mode: view.inspection?.mode },
      selectedRowKeys: [],
    });

  if (!query) {
    return (
      <div className="space-y-2 p-3 text-sm">
        <p className="font-medium">This view’s query no longer exists.</p>
        <p className="text-xs text-muted-foreground">
          Choose another query for this view.
        </p>
        <QueryPicker
          project={project}
          value={view.queryId}
          onChange={selectQuery}
          disabled={readOnly}
        />
      </div>
    );
  }

  const savedStepId = view.inspection?.stepId;
  const savedStepMissing =
    !!savedStepId &&
    !evaluation.stages.some((stage) => stage.stepId === savedStepId);
  const stage = savedStepMissing
    ? undefined
    : evaluation.stages.find(
        (item) => item.stepId === (savedStepId ?? query.outputStepId)
      );
  // A trace points at output rows, so it only narrows the output step.
  const focus = stage?.stepId === query.outputStepId ? focusRowKeys : undefined;
  const canOpen = !!onOpenView && !readOnly;

  function openCopy() {
    if (!query || !onOpenView) return;
    const copy = copyQuery(query, project);
    onOpenView(
      { ...view, id: newId("view"), name: copy.name, queryId: copy.id },
      copy.name,
      { ...project, queries: [...project.queries, copy] }
    );
  }

  function openStage(stepId: string) {
    if (!query || !onOpenView) return;
    const stageQuery = queryForStage(query, stepId, project);
    onOpenView(
      {
        id: newId("view"),
        name: stageQuery.name,
        queryId: stageQuery.id,
        bindings: view.bindings,
      },
      stageQuery.name,
      { ...project, queries: [...project.queries, stageQuery] }
    );
  }

  return (
    <div className="space-y-5 p-3 text-sm">
      <section className="space-y-2">
        <QueryPicker
          project={project}
          value={view.queryId}
          onChange={selectQuery}
          disabled={readOnly}
        />
        <p className="text-xs text-muted-foreground">
          Rows are {query.frameLabel} ·{" "}
          {evaluation.counts.output.toLocaleString()}
          {pending ? " · updating" : ""}
        </p>
        {canOpen && (
          <ActionTooltip content="Opens an independent copy of this query in a new view, so you can change it without affecting views that use this one.">
            <Button size="sm" variant="outline" onClick={openCopy}>
              <Copy aria-hidden="true" />
              Copy query to a new view
            </Button>
          </ActionTooltip>
        )}
        {incompatibleFields.length > 0 && (
          <div
            role="status"
            className="space-y-2 rounded-md border border-warning p-2.5 text-xs"
          >
            <p>
              This view’s charts use fields this query does not have:{" "}
              {incompatibleFields.join(", ")}. They are hidden until it matches.
            </p>
            {onResetSettings && !readOnly && (
              <Button size="sm" variant="outline" onClick={onResetSettings}>
                Start this view’s charts over
              </Button>
            )}
          </div>
        )}
        {unresolvedRowKeys > 0 && (
          <p
            role="status"
            className="rounded-md border border-warning p-2.5 text-xs"
          >
            {unresolvedRowKeys === 1
              ? "1 selected row is"
              : `${unresolvedRowKeys} selected rows are`}{" "}
            not in this result. Its chart selection stays until you clear it.
          </p>
        )}
      </section>

      {parameters.length > 0 && (
        <QueryParameters
          project={project}
          query={query}
          parameters={parameters}
          tables={tables}
          bindings={view.bindings ?? EMPTY}
          readOnly={readOnly}
          onApply={(bindings: Record<string, AnalysisScalar>) =>
            changeView({ ...view, bindings })
          }
        />
      )}

      <QueryFlow
        project={project}
        query={query}
        evaluation={evaluation}
        selectedStepId={stage?.stepId}
        full={view.inspection?.mode === "full"}
        readOnly={readOnly}
        onSelectStep={(stepId) =>
          changeView({
            ...view,
            inspection: { ...view.inspection, stepId, rowKey: undefined },
          })
        }
        onModeChange={(full) =>
          changeView({
            ...view,
            inspection: { ...view.inspection, mode: full ? "full" : "summary" },
          })
        }
        onChange={(next) => onChange(next, view)}
      />

      {savedStepMissing && (
        <div
          role="status"
          className="space-y-2 rounded-md border border-warning p-2.5 text-xs"
        >
          <p>The step this view had open is no longer in the query.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              changeView({
                ...view,
                inspection: { ...view.inspection, stepId: undefined },
              })
            }
          >
            Show the output
          </Button>
        </div>
      )}

      {stage && (
        <>
          {canOpen && stage.stepId !== query.outputStepId && (
            <ActionTooltip content="Opens this step’s rows as their own query in a new view. This view is unchanged.">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openStage(stage.stepId)}
              >
                <ExternalLink aria-hidden="true" />
                Open this step as a view
              </Button>
            </ActionTooltip>
          )}
          <QueryStageRows
            key={stage.stepId}
            project={project}
            tables={tables}
            stage={stage}
            focusRowKeys={focus}
            selectedRowKey={view.inspection?.rowKey}
            readOnly={readOnly}
            onSelectRow={(rowKey) =>
              changeView({
                ...view,
                inspection: {
                  ...view.inspection,
                  stepId: stage.stepId,
                  rowKey,
                },
              })
            }
            onClearFocus={onClearFocus}
            onOpenView={onOpenView}
          />
        </>
      )}

      {!readOnly && (
        <QueryRelationshipBuilder
          project={project}
          query={query}
          view={view}
          evaluation={evaluation}
          readOnly={readOnly}
          onChange={onChange}
          onOpenView={onOpenView}
        />
      )}
    </div>
  );
}

const EMPTY: Record<string, AnalysisScalar> = {};

function QueryPicker({
  project,
  value,
  onChange,
  disabled,
}: {
  project: AnalysisProject;
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger aria-label="Query for this view">
        <SelectValue placeholder="Choose a query" />
      </SelectTrigger>
      <SelectContent>
        {project.queries.map((query) => (
          <SelectItem key={query.id} value={query.id}>
            <span aria-hidden="true">{query.glyph} </span>
            {query.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
