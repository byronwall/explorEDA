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
