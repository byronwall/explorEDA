/** A default as short text; settings with structure name their kind. */
export function formatDefault(value: unknown): string {
  if (value === undefined || value === "") {
    return "—";
  }
  if (Array.isArray(value)) {
    return value.length === 0 ? "none" : `${value.length} items`;
  }
  if (typeof value === "object" && value !== null) {
    return "object";
  }
  return String(value);
}

/** The kind of value a setting holds, judged from its default. */
export function kindOf(
  value: unknown
): "number" | "boolean" | "text" | "list" | "object" | "unset" {
  // Names that start with "__" are the library's own placeholders.
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    (typeof value === "string" && value.startsWith("__"))
  ) {
    return "unset";
  }
  if (Array.isArray(value)) {
    return "list";
  }
  switch (typeof value) {
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "string":
      return "text";
    default:
      return "object";
  }
}
