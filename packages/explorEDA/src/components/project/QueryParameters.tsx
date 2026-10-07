import { useEffect, useState } from "react";
import type {
  AnalysisParameter,
  AnalysisProject,
  AnalysisQuery,
  AnalysisScalar,
  AnalysisSourceRow,
} from "@/types/AnalysisProject";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bindingProblem } from "./parameterBindings";

const token = (value: AnalysisScalar) => `${typeof value}:${String(value)}`;

/**
 * Inputs for a parameter query. Drafts stay local; each valid set applies at
 * once, and an invalid one keeps the last applied result on screen.
 */
export function QueryParameters({
  project,
  query,
  parameters,
  tables,
  bindings,
  readOnly,
  onApply,
}: {
  project: AnalysisProject;
  query: AnalysisQuery;
  parameters: AnalysisParameter[];
  tables: Record<string, readonly AnalysisSourceRow[]>;
  bindings: Record<string, AnalysisScalar>;
  readOnly: boolean;
  onApply: (bindings: Record<string, AnalysisScalar>) => void;
}) {
  const [draft, setDraft] = useState(bindings);
  useEffect(() => setDraft(bindings), [bindings]);
  const problem = bindingProblem(parameters, query, draft);

  function update(id: string, value: AnalysisScalar) {
    const next = { ...draft, [id]: value };
    setDraft(next);
    if (!bindingProblem(parameters, query, next)) onApply(next);
  }

  return (
    <section className="space-y-2 border-t border-border pt-4">
      <h3 className="font-medium">Inputs</h3>
      {parameters.map((parameter) => {
        const value = draft[parameter.id];
        const options = parameter.options;
        const source = options
          ? project.sources.find((item) => item.id === options.sourceId)
          : undefined;
        if (source) {
          const rows = tables[source.id] ?? [];
          const seen = new Set<string>();
          const choices = rows.flatMap((row) => {
            const key = row[source.entityKey] as AnalysisScalar;
            if (key == null || seen.has(token(key))) return [];
            seen.add(token(key));
            const label = options?.labelFieldId
              ? row[options.labelFieldId]
              : undefined;
            return [
              {
                key,
                text:
                  label == null
                    ? String(key)
                    : `${String(label)} · ${String(key)}`,
              },
            ];
          });
          return (
            <label className="block space-y-1 text-xs" key={parameter.id}>
              <span>{parameter.name}</span>
              <Select
                value={value == null ? "" : token(value)}
                disabled={readOnly}
                onValueChange={(next) =>
                  update(
                    parameter.id,
                    choices.find((choice) => token(choice.key) === next)?.key
                  )
                }
              >
                <SelectTrigger aria-label={parameter.name}>
                  <SelectValue placeholder={`Choose ${source.name}`} />
                </SelectTrigger>
                <SelectContent>
                  {choices.map((choice) => (
                    <SelectItem
                      key={token(choice.key)}
                      value={token(choice.key)}
                    >
                      {choice.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          );
        }
        return (
          <label className="block space-y-1 text-xs" key={parameter.id}>
            <span>{parameter.name}</span>
            <Input
              type={
                parameter.type === "date"
                  ? "date"
                  : parameter.type === "number"
                    ? "number"
                    : "text"
              }
              value={value == null ? "" : String(value)}
              disabled={readOnly}
              aria-label={parameter.name}
              onChange={(event) => {
                const text = event.target.value;
                update(
                  parameter.id,
                  text === ""
                    ? undefined
                    : parameter.type === "number"
                      ? Number(text)
                      : text
                );
              }}
            />
          </label>
        );
      })}
      {problem && (
        <p role="status" className="text-xs text-muted-foreground">
          {problem} The results still show the last valid inputs.
        </p>
      )}
    </section>
  );
}
