/** The docs index, or one docs page. */
export function docsPath(topic?: string) {
  return topic ? `/docs/${encodeURIComponent(topic)}` : "/docs";
}

/** The docs topic in a pathname, "" for the index, or null outside the docs. */
export function docsTopic(pathname: string): string | null {
  if (pathname === "/docs" || pathname === "/docs/") {
    return "";
  }
  const match = /^\/docs\/([^/]+)\/?$/.exec(pathname);
  const topic = match?.[1];
  return topic ? decodeURIComponent(topic) : null;
}

/** True for any docs URL, including screenshot capture routes. */
export function isDocsPath(pathname: string) {
  return pathname === "/docs" || pathname.startsWith("/docs/");
}

/** The live example a capture route shows, or null. */
export function captureId(pathname: string): string | null {
  const id = /^\/docs\/_capture\/([^/]+)\/?$/.exec(pathname)?.[1];
  return id ? decodeURIComponent(id) : null;
}

/** Below this viewport width a live example shows its screenshot. */
export const LIVE_MIN_WIDTH = 1024;

/** Where the docs check saves each example's screenshot. */
export function liveShotPath(id: string) {
  return `/docs-shots/example-${id}.png`;
}

/** A heading's anchor id, from its visible text. */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
