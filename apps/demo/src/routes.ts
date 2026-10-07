/** Reopens the last analysis saved in this browser. */
export const VIEWER_PATH = "/viewer";

/** Opens an example, or the session saved from it. */
export function examplePath(exampleId: string) {
  return `/examples/${encodeURIComponent(exampleId)}`;
}
