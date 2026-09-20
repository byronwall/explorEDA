// ISO dates and timestamps without an offset use UTC. Explicit offsets are preserved.
export function dateTimestamp(value: string): number {
  return Date.parse(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(value)
      ? `${value}Z`
      : value
  );
}
