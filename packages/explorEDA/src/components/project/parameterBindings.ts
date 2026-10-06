import type {
  AnalysisParameter,
  AnalysisProject,
  AnalysisScalar,
} from "@/types/AnalysisProject";

function nameTokens(parameter: AnalysisParameter) {
  return `${parameter.name} ${parameter.id}`
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export function validParameterValues(
  project: AnalysisProject,
  bindings: Record<string, AnalysisScalar>,
  parameterIds?: Set<string>
) {
  const parameters = (project.parameters ?? []).filter(
    (parameter) => !parameterIds || parameterIds.has(parameter.id)
  );
  for (const parameter of parameters) {
    const value = bindings[parameter.id];
    if (parameter.required && (value == null || value === "")) return false;
    if (
      value != null &&
      parameter.type === "number" &&
      (typeof value !== "number" || !Number.isFinite(value))
    )
      return false;
    if (
      value != null &&
      parameter.type === "date" &&
      (typeof value !== "string" || !Number.isFinite(Date.parse(value)))
    )
      return false;
  }

  const dateParameters = parameters.filter(
    (parameter) => parameter.type === "date"
  );
  const starts = dateParameters.filter((parameter) =>
    nameTokens(parameter).some((token) =>
      ["start", "from", "begin"].includes(token)
    )
  );
  const ends = dateParameters.filter((parameter) =>
    nameTokens(parameter).some((token) =>
      ["end", "through", "to"].includes(token)
    )
  );
  const start = starts[0] ? bindings[starts[0].id] : undefined;
  const end = ends[0] ? bindings[ends[0].id] : undefined;
  return !(
    typeof start === "string" &&
    typeof end === "string" &&
    start &&
    end &&
    start > end
  );
}
