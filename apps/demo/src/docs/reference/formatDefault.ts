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
