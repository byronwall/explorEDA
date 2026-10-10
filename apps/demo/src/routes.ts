/** Reopens the last analysis saved in this browser. */
export const VIEWER_PATH = "/viewer";

/** Reopens the last multi-table project, which is saved separately. */
export const PROJECT_VIEWER_PATH = `${VIEWER_PATH}?project=1`;

/** Opens an example, or the session saved from it, optionally at a tab. */
export function examplePath(exampleId: string, tab?: string) {
  const path = `/examples/${encodeURIComponent(exampleId)}`;
  return tab ? `${path}?${new URLSearchParams({ tab })}` : path;
}
