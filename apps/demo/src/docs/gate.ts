import type { DocsPage } from "./catalogue";

/** Everything the docs gate checks, passed in so tests can break each part. */
export type DocsGateInput = {
  pages: readonly Pick<
    DocsPage,
    "topic" | "covers" | "chartType" | "examples" | "related"
  >[];
  /** Page source by topic, read from `pages/<topic>.mdx`. */
  sources: Readonly<Record<string, string>>;
  /** Asset file names in `assets/`. */
  assets: readonly string[];
  targets: readonly string[];
  pending: readonly string[];
  pendingLimit: number;
  exampleIds: readonly string[];
  /** The coverage features each example shows or has reviewed. */
  exampleFeatures: Readonly<Record<string, readonly string[]>>;
};

/**
 * Every way the docs can be wrong or incomplete, as messages that name the
 * page or target. An empty list means the docs may ship.
 */
export function findDocsErrors(input: DocsGateInput): string[] {
  const errors: string[] = [];
  const topics = new Set<string>();
  const targets = new Set(input.targets);
  const examples = new Set(input.exampleIds);
  const assets = new Set(input.assets);
  const covered = new Set<string>();

  for (const page of input.pages) {
    if (topics.has(page.topic)) {
      errors.push(`Two pages use the topic "${page.topic}"`);
    }
    topics.add(page.topic);
  }

  for (const page of input.pages) {
    const where = `Page "${page.topic}"`;
    if (!(page.topic in input.sources)) {
      errors.push(`${where} has no pages/${page.topic}.mdx`);
    }
    for (const target of page.covers) {
      if (!targets.has(target)) {
        errors.push(`${where} covers unknown target "${target}"`);
      }
      covered.add(target);
    }
    for (const topic of page.related) {
      if (!topics.has(topic)) {
        errors.push(`${where} links to missing page "${topic}"`);
      }
    }
    for (const { id } of page.examples) {
      if (!examples.has(id)) {
        errors.push(`${where} uses unknown example "${id}"`);
      } else if (
        page.chartType &&
        !input.exampleFeatures[id]?.includes(`chart:${page.chartType}`)
      ) {
        errors.push(
          `${where} uses example "${id}", which does not show a ${page.chartType} chart`
        );
      }
    }
  }

  for (const [topic, source] of Object.entries(input.sources)) {
    const where = `pages/${topic}.mdx`;
    if (!topics.has(topic)) {
      errors.push(`${where} has no catalogue entry`);
    }
    for (const [, linked] of source.matchAll(/<DocsLink\s+topic="([^"]+)"/g)) {
      if (linked && !topics.has(linked)) {
        errors.push(`${where} links to missing page "${linked}"`);
      }
    }
    for (const [, linked] of source.matchAll(/\]\(\/docs\/([^)#/]+)/g)) {
      if (linked && !topics.has(linked)) {
        errors.push(`${where} links to missing page "${linked}"`);
      }
    }
    for (const [, id] of source.matchAll(/\]\(\/examples\/([^)?#/]+)/g)) {
      if (id && !examples.has(id)) {
        errors.push(`${where} links to unknown example "${id}"`);
      }
    }
    for (const [, file] of source.matchAll(/from\s+"\.\.\/assets\/([^"]+)"/g)) {
      if (file && !assets.has(file)) {
        errors.push(`${where} imports missing image "${file}"`);
      }
    }
  }

  const pending = new Set(input.pending);
  for (const target of input.targets) {
    if (!covered.has(target) && !pending.has(target)) {
      errors.push(`No page covers "${target}"`);
    }
  }
  for (const target of input.pending) {
    if (!targets.has(target)) {
      errors.push(`Pending target "${target}" is not a docs target`);
    } else if (covered.has(target)) {
      errors.push(`"${target}" has a page; remove it from pendingTargets`);
    }
  }
  if (input.pending.length > input.pendingLimit) {
    errors.push(
      `pendingTargets has ${input.pending.length} entries, over its limit of ${input.pendingLimit}; document the new target instead`
    );
  } else if (input.pending.length < input.pendingLimit) {
    errors.push(
      `pendingTargets has ${input.pending.length} entries; lower PENDING_LIMIT to ${input.pending.length}`
    );
  }
  return errors;
}
