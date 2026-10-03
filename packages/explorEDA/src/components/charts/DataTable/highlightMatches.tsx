import type { ReactNode } from "react";

/**
 * Marks every place a table search matches in a cell. The search runs on the
 * raw value, so a match that display formatting hides marks the whole cell.
 */
export function highlightMatches(
  text: string,
  search: string,
  raw: string = text
): ReactNode {
  const needle = search.toLowerCase();
  if (!needle) return text;
  const lower = text.toLowerCase();
  let at = lower.length === text.length ? lower.indexOf(needle) : -1;
  if (at < 0) {
    return raw.toLowerCase().includes(needle) ? (
      <mark className="eda-search-hit">{text}</mark>
    ) : (
      text
    );
  }
  const parts: ReactNode[] = [];
  let from = 0;
  while (at >= 0) {
    if (at > from) parts.push(text.slice(from, at));
    parts.push(
      <mark key={at} className="eda-search-hit">
        {text.slice(at, at + needle.length)}
      </mark>
    );
    from = at + needle.length;
    at = lower.indexOf(needle, from);
  }
  if (from < text.length) parts.push(text.slice(from));
  return parts;
}
