import { useMemo, useState } from "react";
import { Plus, Table2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AnalysisFilterOperator,
  AnalysisQuery,
  AnalysisStep,
} from "@/types/AnalysisProject";
import {
  fieldName,
  relationshipDirection,
  sourceView,
} from "@/components/project/queryEditing";
import {
  appendSteps,
  calculateStep,
  expressionProblem,
  filterStep,
  filterValue,
  FOLLOW_MODE_HELP,
  FOLLOW_MODE_LABELS,
  followRelationship,
  OPERATOR_LABELS,
  queryFields,
  removeStep,
  replaceStep,
  stepInputFields,
  usableRelationships,
  type FollowMeasure,
  type FollowMode,
} from "@/components/project/stepEditing";
import { CommitInput, Field } from "./InspectorControls";
import type { SchemaProjectEditing } from "./schemaEditing";

type StepKindChoice = "follow" | "calculate" | "filter";

const STEP_KIND_LABELS: Record<StepKindChoice, string> = {
  follow: "Use a relationship",
  calculate: "Calculate a field",
  filter: "Keep matching rows",
};

const VALUELESS = new Set<AnalysisFilterOperator>(["is-null", "is-not-null"]);

function findQuery(editing: SchemaProjectEditing, queryId: string) {
  return editing.project.queries.find((query) => query.id === queryId);
}

/** Add a step to the end of a query: follow a link, calculate, or filter. */
export function AddStep({
  editing,
  queryId,
}: {
  editing: SchemaProjectEditing;
  queryId: string;
}) {
  const [choice, setChoice] = useState<StepKindChoice>();
  const query = findQuery(editing, queryId);
  if (!query) return null;
  return (
    <div className="eda-schema-inspector-section">
      <span>Add a step</span>
      <Select
        value={choice ?? ""}
        onValueChange={(value) => setChoice(value as StepKindChoice)}
      >
        <SelectTrigger aria-label="Kind of step to add">
          <SelectValue placeholder="Choose a step" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(STEP_KIND_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {choice === "follow" && (
        <FollowForm
          editing={editing}
          query={query}
          onDone={() => setChoice(undefined)}
        />
      )}
      {choice === "calculate" && (
        <CalculateForm
          editing={editing}
          query={query}
          onDone={() => setChoice(undefined)}
        />
      )}
      {choice === "filter" && (
        <FilterForm
          editing={editing}
          query={query}
          onDone={() => setChoice(undefined)}
        />
      )}
    </div>
  );
}

function FollowForm({
  editing,
  query,
  onDone,
}: {
  editing: SchemaProjectEditing;
  query: AnalysisQuery;
  onDone: () => void;
}) {
  const fields = useMemo(
    () => queryFields(editing.project, query.id),
    [editing.project, query.id]
  );
  const outputFields = fields.stages.get(query.outputStepId) ?? fields.output;
  const usable = usableRelationships(editing.project, outputFields);
  const [relationshipId, setRelationshipId] = useState(
    usable[0]?.relationship.id ?? ""
  );
  const [mode, setMode] = useState<FollowMode>("lookup");
  const [measure, setMeasure] = useState<FollowMeasure>("count");
  const [error, setError] = useState("");
  const selected = usable.find(
    (item) => item.relationship.id === relationshipId
  );
  if (!usable.length) {
    return (
      <p className="eda-schema-inspector-hint">
        No relationship matches a field of these rows yet. Relate a table first.
      </p>
    );
  }
  const modes: FollowMode[] = editing.onOpenView
    ? ["lookup", "aggregate", "expand"]
    : ["lookup", "aggregate"];
  const apply = () => {
    if (!selected) return;
    const result = followRelationship({
      project: editing.project,
      query,
      relationship: selected.relationship,
      mode,
      measure,
    });
    if (result.kind === "blocked") {
      setError(result.reason);
      return;
    }
    if (result.kind === "replace") editing.onChange(result.project);
    else editing.onOpenView?.(result.view, result.name, result.project);
    onDone();
  };
  return (
    <>
      <Field label="Relationship">
        <Select value={relationshipId} onValueChange={setRelationshipId}>
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
      </Field>
      <Field label="Effect">
        <Select
          value={mode}
          onValueChange={(value) => {
            setMode(value as FollowMode);
            setError("");
          }}
        >
          <SelectTrigger aria-label="How the relationship affects rows">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {modes.map((value) => (
              <SelectItem key={value} value={value}>
                {FOLLOW_MODE_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <p className="eda-schema-inspector-hint">{FOLLOW_MODE_HELP[mode]}</p>
      {mode === "aggregate" && (
        <Field label="Measure">
          <Select
            value={measure}
            onValueChange={(value) => setMeasure(value as FollowMeasure)}
          >
            <SelectTrigger aria-label="Related row measure">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="count">Count</SelectItem>
              <SelectItem value="sum">Sum</SelectItem>
              <SelectItem value="average">Average</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      )}
      {selected && mode === "lookup" && !selected.direction.single && (
        <p className="eda-schema-inspector-hint">
          Each row can match several related records. Summarize them, or expand
          to one row per record.
        </p>
      )}
      {error && <p className="eda-schema-inspector-error">{error}</p>}
      <Button type="button" size="sm" onClick={apply}>
        <Plus aria-hidden="true" />
        {mode === "expand" ? "Open expanded view" : "Add step"}
      </Button>
    </>
  );
}

function CalculateForm({
  editing,
  query,
  onDone,
}: {
  editing: SchemaProjectEditing;
  query: AnalysisQuery;
  onDone: () => void;
}) {
  const [label, setLabel] = useState("");
  const [expression, setExpression] = useState("");
  const [error, setError] = useState("");
  const fields = useMemo(
    () => queryFields(editing.project, query.id),
    [editing.project, query.id]
  );
  const outputFields = fields.stages.get(query.outputStepId) ?? fields.output;
  const add = () => {
    const problem = expression.trim()
      ? expressionProblem(expression, outputFields)
      : "Write an expression.";
    if (problem) {
      setError(problem);
      return;
    }
    const step = calculateStep(query, outputFields, label, expression);
    editing.onChange(appendSteps(editing.project, query, [step]));
    onDone();
  };
  return (
    <>
      <Field label="Label">
        <CommitInput
          label="New calculation label"
          value={label}
          placeholder="e.g. Net revenue"
          onCommit={setLabel}
        />
      </Field>
      <Field label="Expression">
        <CommitInput
          label="New calculation expression"
          value={expression}
          placeholder={`e.g. ["${outputFields.find((field) => field.type === "number")?.id ?? "field"}"] * 2`}
          multiline
          onCommit={setExpression}
        />
      </Field>
      {error && <p className="eda-schema-inspector-error">{error}</p>}
      <Button type="button" size="sm" onClick={add}>
        <Plus aria-hidden="true" />
        Add calculation
      </Button>
    </>
  );
}

function FilterFields({
  fieldId,
  operator,
  value,
  fields,
  onChange,
}: {
  fieldId: string;
  operator: AnalysisFilterOperator;
  value: string;
  fields: { id: string; name: string }[];
  onChange: (next: {
    fieldId?: string;
    operator?: AnalysisFilterOperator;
    value?: string;
  }) => void;
}) {
  return (
    <>
      <Field label="Field">
        <Select
          value={fieldId}
          onValueChange={(next) => onChange({ fieldId: next })}
        >
          <SelectTrigger aria-label="Field to filter on">
            <SelectValue placeholder="Field" />
          </SelectTrigger>
          <SelectContent>
            {fields.map((field) => (
              <SelectItem key={field.id} value={field.id}>
                {field.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Condition">
        <Select
          value={operator}
          onValueChange={(next) =>
            onChange({ operator: next as AnalysisFilterOperator })
          }
        >
          <SelectTrigger aria-label="Filter condition">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(OPERATOR_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      {!VALUELESS.has(operator) && (
        <Field label="Value">
          <CommitInput
            label="Filter value"
            value={value}
            onCommit={(next) => onChange({ value: next })}
          />
        </Field>
      )}
    </>
  );
}

function FilterForm({
  editing,
  query,
  onDone,
}: {
  editing: SchemaProjectEditing;
  query: AnalysisQuery;
  onDone: () => void;
}) {
  const fields = useMemo(() => {
    const result = queryFields(editing.project, query.id);
    return result.stages.get(query.outputStepId) ?? result.output;
  }, [editing.project, query.id, query.outputStepId]);
  const [draft, setDraft] = useState({
    fieldId: fields[0]?.id ?? "",
    operator: "eq" as AnalysisFilterOperator,
    value: "",
  });
  const add = () => {
    const field = fields.find((item) => item.id === draft.fieldId);
    if (!field) return;
    const step = filterStep(
      query,
      field.id,
      draft.operator,
      filterValue(draft.value, field)
    );
    editing.onChange(appendSteps(editing.project, query, [step]));
    onDone();
  };
  return (
    <>
      <FilterFields
        {...draft}
        fields={fields.map((field) => ({
          id: field.id,
          name: fieldName(editing.project, fields, field.id),
        }))}
        onChange={(next) => setDraft((current) => ({ ...current, ...next }))}
      />
      <Button type="button" size="sm" onClick={add} disabled={!draft.fieldId}>
        <Plus aria-hidden="true" />
        Add filter
      </Button>
    </>
  );
}

/** Start a new query and view that read this table. */
export function NewQueryFromTable({
  editing,
  sourceId,
}: {
  editing: SchemaProjectEditing;
  sourceId: string;
}) {
  if (!editing.onOpenView) return null;
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      tooltip="Start a new query and view that read this table"
      onClick={() => {
        const next = sourceView(editing.project, sourceId);
        editing.onOpenView!(next.view, next.view.name, next.project);
      }}
    >
      <Table2 aria-hidden="true" />
      New query from this table
    </Button>
  );
}

/** Change a step in place, or remove it after naming what it breaks. */
export function StepEditor({
  editing,
  queryId,
  stepId,
  measureId,
}: {
  editing: SchemaProjectEditing;
  queryId: string;
  stepId: string;
  /** A summary's measure, when the selected row is one. */
  measureId?: string;
}) {
  const query = findQuery(editing, queryId);
  const step = query?.steps.find((item) => item.id === stepId);
  if (!query || !step) return null;
  return (
    <>
      <StepSettings
        editing={editing}
        query={query}
        step={step}
        measureId={measureId}
      />
      {!measureId && <RemoveStep editing={editing} query={query} step={step} />}
    </>
  );
}

function StepSettings({
  editing,
  query,
  step,
  measureId,
}: {
  editing: SchemaProjectEditing;
  query: AnalysisQuery;
  step: AnalysisStep;
  measureId?: string;
}) {
  const [error, setError] = useState("");
  const input = useMemo(
    () => stepInputFields(editing.project, query, step),
    [editing.project, query, step]
  );
  const save = (next: AnalysisStep) => {
    setError("");
    editing.onChange(replaceStep(editing.project, query, next));
  };

  switch (step.kind) {
    case "source":
      return (
        <p className="eda-schema-inspector-hint">
          Every later step works on these rows.
        </p>
      );
    case "lookup":
    case "expand": {
      const usable = usableRelationships(editing.project, input);
      return (
        <Field label="Relationship">
          <Select
            value={step.relationshipId}
            onValueChange={(relationshipId) => {
              const relationship = editing.project.relationships.find(
                (item) => item.id === relationshipId
              );
              const direction = relationship
                ? relationshipDirection(relationship, input)
                : undefined;
              if (!direction) return;
              if (step.kind === "lookup" && !direction.single) {
                setError(
                  "Each row can match several records through that link. Summarize or expand instead."
                );
                return;
              }
              save({
                ...step,
                relationshipId,
                inputFieldId: direction.inputField.id,
              });
            }}
          >
            <SelectTrigger aria-label="Relationship this step follows">
              <SelectValue placeholder="A removed relationship" />
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
          {error && <p className="eda-schema-inspector-error">{error}</p>}
        </Field>
      );
    }
    case "calculate":
      return (
        <>
          <Field label="Label">
            <CommitInput
              label={`Label of ${step.label}`}
              value={step.label}
              onCommit={(label) =>
                save({ ...step, label: label.trim() || step.label })
              }
            />
          </Field>
          <Field label="Expression">
            <CommitInput
              label={`Expression of ${step.label}`}
              value={step.expression}
              multiline
              onCommit={(expression) => {
                const problem = expressionProblem(expression, input);
                if (problem) setError(problem);
                else save({ ...step, expression });
              }}
            />
          </Field>
          {error && <p className="eda-schema-inspector-error">{error}</p>}
        </>
      );
    case "filter": {
      const parameter = editing.project.parameters?.find(
        (item) => item.id === step.parameterId
      );
      if (parameter) {
        return (
          <p className="eda-schema-inspector-hint">
            Filters on the input “{parameter.name}”, set from the view.
          </p>
        );
      }
      return (
        <FilterFields
          fieldId={step.fieldId}
          operator={step.operator}
          value={step.value == null ? "" : String(step.value)}
          fields={input.map((field) => ({
            id: field.id,
            name: fieldName(editing.project, input, field.id),
          }))}
          onChange={(next) => {
            const fieldId = next.fieldId ?? step.fieldId;
            const field = input.find((item) => item.id === fieldId);
            const operator = next.operator ?? step.operator;
            const text =
              next.value ?? (step.value == null ? "" : String(step.value));
            const { value: _old, ...rest } = step;
            save({
              ...rest,
              fieldId,
              operator,
              ...(VALUELESS.has(operator)
                ? {}
                : { value: filterValue(text, field) }),
            });
          }}
        />
      );
    }
    case "aggregate": {
      const measure = step.measures.find((item) => item.id === measureId);
      if (!measure) {
        return (
          <p className="eda-schema-inspector-hint">
            Select a summarized field (Σ) to rename it or change how it
            summarizes.
          </p>
        );
      }
      const updateMeasure = (update: Partial<typeof measure>) =>
        save({
          ...step,
          measures: step.measures.map((item) =>
            item.id === measure.id ? { ...item, ...update } : item
          ),
        });
      return (
        <>
          <Field label="Label">
            <CommitInput
              label={`Label of ${measure.label}`}
              value={measure.label}
              onCommit={(label) =>
                updateMeasure({ label: label.trim() || measure.label })
              }
            />
          </Field>
          <Field label="Summary">
            <Select
              value={measure.operation}
              onValueChange={(operation) =>
                updateMeasure({
                  operation: operation as typeof measure.operation,
                })
              }
            >
              <SelectTrigger aria-label={`How ${measure.label} summarizes`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="count">Count</SelectItem>
                <SelectItem value="sum" disabled={!measure.fieldId}>
                  Sum
                </SelectItem>
                <SelectItem value="average" disabled={!measure.fieldId}>
                  Average
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </>
      );
    }
  }
}

function RemoveStep({
  editing,
  query,
  step,
}: {
  editing: SchemaProjectEditing;
  query: AnalysisQuery;
  step: AnalysisStep;
}) {
  const [confirm, setConfirm] = useState(false);
  const removal = useMemo(
    () =>
      confirm
        ? removeStep(editing.project, query, step.id, editing.views)
        : undefined,
    [confirm, editing.project, editing.views, query, step.id]
  );
  if (step.kind === "source") return null;
  if (!confirm || !removal) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setConfirm(true)}
      >
        <Trash2 aria-hidden="true" />
        Remove step
      </Button>
    );
  }
  return (
    <div
      className="eda-schema-inspector-confirm"
      role="group"
      aria-label="Remove step"
    >
      {removal.blocked ? (
        <p>{removal.blocked}</p>
      ) : (
        <>
          <p>
            {removal.lostFields.length
              ? `The query stops producing ${removal.lostFields.join(", ")}.`
              : "The query keeps all of its fields."}
          </p>
          {removal.brokenViews.length > 0 && (
            <ul className="eda-schema-inspector-list">
              {removal.brokenViews.map((view) => (
                <li key={view.id}>
                  {view.name} reads {view.fields.join(", ")}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      <div className="eda-schema-inspector-actions">
        {!removal.blocked && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => editing.onChange(removal.project!)}
          >
            Remove
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setConfirm(false)}
        >
          Keep it
        </Button>
      </div>
    </div>
  );
}
