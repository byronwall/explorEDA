import type { DocsPage } from "./catalogue";

/** Everything the docs gate checks, passed in so tests can break each part. */
export type DocsGateInput = {
  pages: readonly Pick<
    DocsPage,
    "topic" | "covers" | "chartType" | "examples" | "related" | "thumbnail"
  >[];
  /** Page source by topic, read from `pages/<topic>.mdx`. */
  sources: Readonly<Record<string, string>>;
  /** Asset file names in `assets/`. */
  assets: readonly string[];
  targets: readonly string[];
  exampleIds: readonly string[];
  /** The coverage features each example shows or has reviewed. */
  exampleFeatures: Readonly<Record<string, readonly string[]>>;
  /** Live examples by id: their example, data file, charts, and step charts. */
  liveExamples: Readonly<
    Record<
      string,
      {
        /** Absent for a notebook example, which links elsewhere. */
        exampleId?: string;
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
  /** Chart types with an "At a glance" entry. */
  glanceTypes: readonly string[];
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
    for (const id of page.examples) {
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
    if (source.includes("<SettingsReference")) {
      errors.push(
        `${where} renders a settings reference; chart pages get theirs from the page template`
      );
    }
  }
  // Every chart page ends with its settings, and opens with its glance.
  for (const page of input.pages) {
    if (!page.chartType) {
      continue;
    }
    referenced.add(page.chartType);
    if (!input.glanceTypes.includes(page.chartType)) {
      errors.push(
        `Page "${page.topic}" has no entry in glance.ts for "${page.chartType}"`
      );
    }
  }
  for (const page of input.pages) {
    if (page.thumbnail && !live.has(page.thumbnail)) {
      errors.push(
        `Page "${page.topic}" uses missing live example "${page.thumbnail}" as its thumbnail`
      );
    }
  }
  // Dashboard text paths quoted on a chart page must be settings it saves.
  for (const page of input.pages) {
    const source = input.sources[page.topic];
    const keys = page.chartType ? input.settingKeys[page.chartType] : undefined;
    if (!source || !keys) continue;
    for (const [, path] of source.matchAll(/`([A-Za-z][\w.]*)=[^`]*`/g)) {
      const key = path?.split(".")[0];
      if (key && !keys.includes(key)) {
        errors.push(
          `pages/${page.topic}.mdx quotes "${path}=", but ${page.chartType} charts have no setting "${key}"`
        );
      }
    }
  }
  for (const [id, spec] of Object.entries(input.liveExamples)) {
    const where = `Live example "${id}"`;
    if (spec.exampleId !== undefined && !examples.has(spec.exampleId)) {
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

  for (const target of input.targets) {
    if (!covered.has(target)) {
      errors.push(`No page covers "${target}"`);
    }
  }
  return errors;
}
