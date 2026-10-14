import type { AggregateContributor } from "@/lib/aggregates";
import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import { isMissingValue, timestampOf } from "@/lib/valueParsing";
import type { datum } from "@/types/ChartTypes";

const DAY = 86_400_000;

export interface FunnelInput {
  /** The event rows to count. */
  ids: readonly number[];
  entity: Record<number, datum>;
  event: Record<number, datum>;
  time: Record<number, datum>;
  /** Event values in funnel order. */
  steps: readonly datum[];
  /** Later steps count only within this many days of the first step. */
  windowDays?: number;
}

export interface FunnelStep {
  index: number;
  value: datum;
  key: string;
  label: string;
  /** Entities that reached this step. */
  count: number;
  /** Share of the entities that reached the first step. */
  ofFirst: number;
  /** Share of the entities that reached the step before; 1 for the first. */
  ofPrevious: number;
  /** Reached the step before, but not this one. */
  dropped: number;
  /**
   * Of those dropped, how many have this step's event, but only before the
   * step before or outside the window.
   */
  droppedOutOfOrder: number;
  /** The event row that counted, one per entity that reached this step. */
  contributors: AggregateContributor[];
}

export interface FunnelPlan {
  steps: FunnelStep[];
  /** Entities with at least one counted event. */
  entities: number;
  /** Rows left out, by reason. */
  excluded: { reason: string; count: number }[];
}

interface Journey {
  /** How many steps the entity reached, in order. */
  reached: number;
  /** The row that counted for each step reached. */
  rows: number[];
  /** Every event key the entity has. */
  events: Set<string>;
}

interface Journeys {
  byEntity: Map<string, Journey>;
  excluded: { reason: string; count: number }[];
}

/**
 * Follows each entity through the steps in time order. A step counts at its
 * first occurrence after the step before it was reached, so a step done
 * early never counts. Rows at the same time keep their row order. With a
 * window, later steps must fall within that many days of the first step.
 */
function followJourneys(input: FunnelInput): Journeys {
  const stepKeys = input.steps.map((step) => categoryKey(categoryValue(step)));
  const window =
    input.windowDays !== undefined && input.windowDays > 0
      ? input.windowDays * DAY
      : undefined;
  const rowsByEntity = new Map<string, { id: number; time: number }[]>();
  let missingEntity = 0;
  let missingTime = 0;
  for (const id of input.ids) {
    const entity = input.entity[id];
    if (isMissingValue(entity)) {
      missingEntity += 1;
      continue;
    }
    const time = timestampOf(input.time[id]);
    if (time === undefined) {
      missingTime += 1;
      continue;
    }
    const key = categoryKey(categoryValue(entity));
    const list = rowsByEntity.get(key);
    if (list) list.push({ id, time });
    else rowsByEntity.set(key, [{ id, time }]);
  }
  const byEntity = new Map<string, Journey>();
  for (const [entity, rows] of rowsByEntity) {
    rows.sort((a, b) => a.time - b.time || a.id - b.id);
    const journey: Journey = { reached: 0, rows: [], events: new Set() };
    let entry = 0;
    for (const row of rows) {
      const key = categoryKey(categoryValue(input.event[row.id]));
      journey.events.add(key);
      if (journey.reached >= stepKeys.length) continue;
      if (key !== stepKeys[journey.reached]) continue;
      if (journey.reached === 0) entry = row.time;
      else if (window !== undefined && row.time - entry > window) continue;
      journey.rows.push(row.id);
      journey.reached += 1;
    }
    byEntity.set(entity, journey);
  }
  const excluded = [
    { reason: `Missing entity`, count: missingEntity },
    { reason: `Missing or unreadable time`, count: missingTime },
  ].filter((item) => item.count > 0);
  return { byEntity, excluded };
}

export function planFunnel(input: FunnelInput): FunnelPlan {
  const { byEntity, excluded } = followJourneys(input);
  const journeys = [...byEntity.values()];
  const counts = input.steps.map(
    (_, index) => journeys.filter((journey) => journey.reached > index).length
  );
  const first = counts[0] ?? 0;
  const steps = input.steps.map((value, index): FunnelStep => {
    const key = categoryKey(categoryValue(value));
    const count = counts[index]!;
    const previous = index === 0 ? count : counts[index - 1]!;
    const stopped =
      index === 0
        ? []
        : journeys.filter((journey) => journey.reached === index);
    return {
      index,
      value,
      key,
      label: categoryLabel(categoryValue(value)),
      count,
      ofFirst: first > 0 ? count / first : 0,
      ofPrevious: index === 0 ? 1 : previous > 0 ? count / previous : 0,
      dropped: previous - count,
      droppedOutOfOrder: stopped.filter((journey) => journey.events.has(key))
        .length,
      contributors: journeys
        .filter((journey) => journey.reached > index)
        .map((journey) => ({
          sourceId: journey.rows[index]!,
          input: 1,
          included: true,
        })),
    };
  });
  return { steps, entities: byEntity.size, excluded };
}

/**
 * Entity keys a selection names. A step value selects the entities that
 * reached that step; any other event value selects the entities that have
 * that event at all.
 */
export function funnelSelection(
  input: FunnelInput,
  values: readonly datum[]
): Set<string> {
  const { byEntity } = followJourneys(input);
  const stepKeys = input.steps.map((step) => categoryKey(categoryValue(step)));
  const selected = new Set<string>();
  for (const value of values) {
    const key = categoryKey(categoryValue(value));
    const step = stepKeys.indexOf(key);
    for (const [entity, journey] of byEntity) {
      if (step >= 0 ? journey.reached > step : journey.events.has(key)) {
        selected.add(entity);
      }
    }
  }
  return selected;
}
