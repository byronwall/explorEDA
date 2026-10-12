import { catalogue, GROUP_LABELS } from "./catalogue";
import { GLANCES } from "./glance";
import {
  COMMON_SETTINGS,
  describeSetting,
} from "./reference/settingDescriptions";
import { sectionsOf, type SearchEntry } from "./search";

/** Each page's MDX as text, loaded only when someone searches. */
const pageSources = import.meta.glob<string>("./pages/*.mdx", {
  query: "?raw",
  import: "default",
});

/** The package README, which the Developers page renders under its own text. */
const readme = () =>
  import("../../../../packages/explorEDA/README.md?raw").then(
    (module: { default: string }) => module.default
  );

/** The page that renders the README. */
const README_TOPIC = "developers";

let cached: Promise<SearchEntry[]> | null = null;

/** Every page, section, and chart setting, built once per visit. */
export function loadSearchEntries(): Promise<SearchEntry[]> {
  cached ??= build();
  return cached;
}

async function build(): Promise<SearchEntry[]> {
  const { chartSettingsReference } = await import("exploreda/docs-kit");
  const perPage = await Promise.all(
    catalogue.map(async (page) => {
      const entries: SearchEntry[] = [];
      const glance = page.chartType ? GLANCES[page.chartType] : undefined;
      entries.push({
        kind: "page",
        topic: page.topic,
        title: page.title,
        context: GROUP_LABELS[page.group],
        text: [
          page.lede,
          page.summary,
          page.highlights.join(", "),
          glance?.useFor,
          glance?.needs,
          ...(glance?.gestures.map(
            ([gesture, effect]) => `${gesture}: ${effect.toLowerCase()}.`
          ) ?? []),
        ]
          .filter(Boolean)
          .map((part) => (/[.!?]$/.test(part!) ? part : `${part}.`))
          .join(" "),
      });
      const load = pageSources[`./pages/${page.topic}.mdx`];
      if (load) {
        entries.push(...sectionsOf(page.topic, page.title, await load()));
      }
      if (page.topic === README_TOPIC) {
        entries.push(...sectionsOf(page.topic, page.title, await readme()));
      }
      if (!page.chartType) {
        return entries;
      }
      // The page template adds this section.
      entries.push({
        kind: "section",
        topic: page.topic,
        anchor: "saved-settings",
        title: "Saved settings",
        context: page.title,
        text: "Every saved setting, its Dashboard text path, and its value in a new chart.",
      });
      return entries;
    })
  );
  return [...perPage.flat(), ...settingEntries(chartSettingsReference)];
}

/**
 * Each chart's own settings, and each shared setting once: on the first
 * chart page, in catalogue order, that describes it the shared way.
 */
function settingEntries(
  reference: (type: string) => readonly { key: string }[]
): SearchEntry[] {
  const entries: SearchEntry[] = [];
  const sharedSeen = new Set<string>();
  for (const page of catalogue) {
    if (!page.chartType) {
      continue;
    }
    for (const { key } of reference(page.chartType)) {
      const description = describeSetting(page.chartType, key) ?? "";
      const shared = description === COMMON_SETTINGS[key];
      if (/^Not read by/.test(description) || (shared && sharedSeen.has(key))) {
        continue;
      }
      if (shared) {
        sharedSeen.add(key);
      }
      entries.push({
        kind: "setting",
        topic: page.topic,
        anchor: `setting-${key}`,
        title: key,
        context: shared ? "Every chart" : page.title,
        text: description,
      });
    }
  }
  return entries;
}
