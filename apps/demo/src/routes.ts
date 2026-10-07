/** Reopens the last analysis saved in this browser. */
export const VIEWER_PATH = "/viewer";

/** Reopens the last multi-table project, which is saved separately. */
export const PROJECT_VIEWER_PATH = `${VIEWER_PATH}?project=1`;

/** Opens an example, or the session saved from it. */
export function examplePath(exampleId: string) {
  return `/examples/${encodeURIComponent(exampleId)}`;
}
