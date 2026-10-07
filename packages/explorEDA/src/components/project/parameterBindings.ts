import type {
  AnalysisParameter,
  AnalysisQuery,
  AnalysisScalar,
} from "@/types/AnalysisProject";

/** Parameters a query reads, in the project's order. */
export function queryParameters(
  parameters: readonly AnalysisParameter[] | undefined,
  query: AnalysisQuery | undefined
) {
  const used = new Set(
    query?.steps.flatMap((step) =>
      step.kind === "filter" && step.parameterId ? [step.parameterId] : []
    ) ?? []
  );
  return (parameters ?? []).filter((parameter) => used.has(parameter.id));
}

/**
 * Why these inputs cannot run yet, or undefined when they can. A lower bound
 * above an upper bound on the same field is invalid, since it can only ever
 * return no rows.
 */
export function bindingProblem(
  parameters: readonly AnalysisParameter[],
  query: AnalysisQuery,
  bindings: Record<string, AnalysisScalar>
): string | undefined {
  for (const parameter of parameters) {
    const value = bindings[parameter.id];
    if (value == null || value === "") {
      if (parameter.required) return `Choose ${parameter.name}.`;
      continue;
    }
    const valid =
      parameter.type === "number"
        ? typeof value === "number" && Number.isFinite(value)
        : parameter.type === "date"
          ? typeof value === "string" && Number.isFinite(Date.parse(value))
          : typeof value === parameter.type;
    if (!valid) return `${parameter.name} is not a valid ${parameter.type}.`;
  }

  const bounds = new Map<string, { lower?: string; upper?: string }>();
  for (const step of query.steps) {
    if (step.kind !== "filter" || !step.parameterId) continue;
    const side =
      step.operator === "gt" || step.operator === "gte"
        ? "lower"
        : step.operator === "lt" || step.operator === "lte"
          ? "upper"
          : undefined;
    if (!side) continue;
    const entry = bounds.get(step.fieldId) ?? {};
    entry[side] = step.parameterId;
    bounds.set(step.fieldId, entry);
  }
  for (const { lower, upper } of bounds.values()) {
    if (!lower || !upper) continue;
    const low = bindings[lower];
    const high = bindings[upper];
    if (low == null || high == null || typeof low !== typeof high) continue;
    if ((low as string | number) > (high as string | number)) {
      const name = (id: string) =>
        parameters.find((parameter) => parameter.id === id)?.name ?? id;
      return `${name(lower)} is after ${name(upper)}.`;
    }
  }
  return undefined;
}
