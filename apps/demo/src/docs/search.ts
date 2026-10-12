import { slugify } from "./paths";

/** One thing the docs search can find: a page, a section, or a setting. */
export type SearchEntry = {
  kind: "page" | "section" | "setting";
  topic: string;
  /** The heading or setting id on the page, without "#". */
  anchor?: string;
  title: string;
  /** Where it sits, such as the page title for a section. */
  context: string;
  /** Words that match but aren't shown as the title. */
  text: string;
};

export type SearchHit = {
  entry: SearchEntry;
  score: number;
  /** A short piece of `text` around the first match, when it matched there. */
  snippet?: string;
};

/** The quoted strings in a JSX tag that a reader sees, such as captions. */
function visibleStrings(tag: string) {
  return [...tag.matchAll(/"([^"]{12,})"/g)].map(([, text]) => text).join(". ");
}

/** Markdown and JSX reduced to the words a reader sees. */
export function plainText(source: string) {
  return (
    source
      .replace(/^import .*$/gm, " ")
      .replace(/```[\s\S]*?```/g, " ")
      // Self-closing blocks, such as <LiveExample /> or <Terms items={...} />.
      // `[^<]` keeps a match inside one tag.
      .replace(/<[A-Z]\w*\b[^<]*?\/>/g, (tag) => ` ${visibleStrings(tag)} `)
      // Opening tags keep their title; their children stay as text.
      .replace(/<[A-Z]\w*\b[^<>]*>/g, (tag) => ` ${visibleStrings(tag)} `)
      .replace(/<\/?[A-Za-z][^<>]*>/g, " ")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/^\s*(?:[-*]|\d+\.)\s+/gm, " ")
      .replace(/[*_`#>|{}]/g, " ")
      .replace(/-{3,}/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Each `#` to `###` section of a page's MDX, with its text. The page renders
 * `#` as a section heading too, for imported Markdown.
 */
export function sectionsOf(
  topic: string,
  pageTitle: string,
  source: string
): SearchEntry[] {
  const entries: SearchEntry[] = [];
  // Code fences can hold lines that start with "#".
  const parts = source
    .replace(/```[\s\S]*?```/g, " ")
    .split(/^(#{1,3}) (.+)$/m);
  // split() gives [before, hashes, heading, body, hashes, heading, body, ...]
  for (let index = 1; index + 1 < parts.length; index += 3) {
    const heading = plainText(parts[index + 1] ?? "");
    if (!heading) {
      continue;
    }
    entries.push({
      kind: "section",
      topic,
      anchor: slugify(heading),
      title: heading,
      context: pageTitle,
      text: plainText(parts[index + 2] ?? ""),
    });
  }
  return entries;
}

function words(query: string) {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

/** A whole page beats a section of one, which beats a single setting. */
const KIND_WEIGHT: Record<SearchEntry["kind"], number> = {
  page: 8,
  section: 3,
  setting: 1,
};

/** A piece of `text` around `at`, cut at word boundaries. */
function snippetAround(text: string, at: number) {
  const start = Math.max(0, text.lastIndexOf(" ", Math.max(0, at - 50)) + 1);
  const end = Math.min(
    text.length,
    text.indexOf(" ", at + 90) === -1 ? text.length : text.indexOf(" ", at + 90)
  );
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}

/**
 * Entries that contain every word of the query, best first. A word that
 * starts a title word beats one inside the title, which beats one in the
 * context, which beats one in the text; a title that starts with the whole
 * query beats all of them.
 */
export function searchDocs(
  entries: readonly SearchEntry[],
  query: string,
  limit = 40
): SearchHit[] {
  const terms = words(query);
  if (terms.length === 0) {
    return [];
  }
  const phrase = terms.join(" ");
  const hits: SearchHit[] = [];
  for (const entry of entries) {
    const title = entry.title.toLowerCase();
    const context = entry.context.toLowerCase();
    const text = entry.text.toLowerCase();
    let score = 0;
    let firstTextMatch = -1;
    let matchedAll = true;
    for (const term of terms) {
      if (title.includes(term)) {
        const titleWords = title.split(/[^a-z0-9]+/);
        score += titleWords.some((word) => word.startsWith(term)) ? 12 : 8;
      } else if (context.includes(term)) {
        score += 4;
      } else {
        const at = text.indexOf(term);
        if (at === -1) {
          matchedAll = false;
          break;
        }
        score += 1;
        if (firstTextMatch === -1) {
          firstTextMatch = at;
        }
      }
    }
    if (!matchedAll) {
      continue;
    }
    if (title === phrase) {
      score += 40;
    } else if (title.startsWith(phrase)) {
      score += 20;
    }
    score += KIND_WEIGHT[entry.kind];
    hits.push({
      entry,
      score,
      snippet:
        firstTextMatch >= 0
          ? snippetAround(entry.text, firstTextMatch)
          : undefined,
    });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
