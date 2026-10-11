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
  /** Live examples by id: their example, data file, charts, and step charts. */
  liveExamples: Readonly<
    Record<
      string,
      {
        exampleId: string;
        data: string;
        charts: readonly string[];
        stepCharts: readonly string[];
      }
    >
  >;
  /** Files under `public/`, as URL paths such as `/datasets/x.csv`. */
  publicFiles: readonly string[];
  /** Every saved setting of each chart type, from the library. */
  settingKeys: Readonly<Record<string, readonly string[]>>;
  /** Setting lines shared by every chart type. */
  commonDescriptions: Readonly<Record<string, string>>;
  /** Setting lines for one chart type. */
  chartDescriptions: Readonly<Record<string, Readonly<Record<string, string>>>>;
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

  const live = new Set(Object.keys(input.liveExamples));
  const publicFiles = new Set(input.publicFiles);
  const referenced = new Set<string>();
  for (const [topic, source] of Object.entries(input.sources)) {
    const where = `pages/${topic}.mdx`;
    for (const [, id] of source.matchAll(/<LiveExample\s+id="([^"]+)"/g)) {
      if (id && !live.has(id)) {
        errors.push(`${where} uses missing live example "${id}"`);
      }
    }
    for (const [, type] of source.matchAll(
      /<SettingsReference\s+type="([^"]+)"/g
    )) {
      if (type) referenced.add(type);
    }
  }
  for (const page of input.pages) {
    const source = input.sources[page.topic];
    if (
      page.chartType &&
      source !== undefined &&
      !source.includes(`<SettingsReference type="${page.chartType}"`)
    ) {
      errors.push(
        `Page "${page.topic}" has no <SettingsReference type="${page.chartType}" />`
      );
    }
  }
  for (const [id, spec] of Object.entries(input.liveExamples)) {
    const where = `Live example "${id}"`;
    if (!examples.has(spec.exampleId)) {
      errors.push(`${where} opens unknown example "${spec.exampleId}"`);
    }
    if (!publicFiles.has(spec.data)) {
      errors.push(`${where} loads missing data "${spec.data}"`);
    }
    for (const chart of spec.stepCharts) {
      if (!spec.charts.includes(chart)) {
        errors.push(`${where} has a step on missing chart "${chart}"`);
      }
    }
  }
  for (const type of referenced) {
    const keys = input.settingKeys[type];
    if (!keys) {
      errors.push(`Settings reference for unknown chart type "${type}"`);
      continue;
    }
    for (const key of keys) {
      if (
        !input.chartDescriptions[type]?.[key] &&
        !input.commonDescriptions[key]
      ) {
        errors.push(`Setting "${type}.${key}" has no description`);
      }
    }
  }
  for (const [type, lines] of Object.entries(input.chartDescriptions)) {
    const keys = new Set(input.settingKeys[type] ?? []);
    for (const key of Object.keys(lines)) {
      if (!keys.has(key)) {
        errors.push(`Description for "${type}.${key}", which is not a setting`);
      }
    }
  }
  const everyKey = new Set(Object.values(input.settingKeys).flat());
  for (const key of Object.keys(input.commonDescriptions)) {
    if (!everyKey.has(key)) {
      errors.push(`Shared description for "${key}", which no chart saves`);
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
