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
