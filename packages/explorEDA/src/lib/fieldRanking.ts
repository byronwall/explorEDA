import type { FieldProfile } from "@/lib/fieldProfiles";

/*
 * Default field choices for new charts. Warehouse tables lead with surrogate
 * keys (ss_ticket_number, ss_customer_sk, game_id), so taking the first field
 * of a type sums ticket numbers or groups by customer key. These rankings
 * move likely keys last and likely measures and groups first.
 */

const KEY_NAME =
  /(^|[_\s-])(sk|id|key|uuid|guid|pk|fk)$|^(sk|id|key)$|[a-z](Id|ID|Key|SK)$/;
const NUMBER_NAME = /(^|[_\s-])(number|num|no|nbr)$|[a-z]Number$/;
const MEASURE_WORD =
  /amount|price|sales|paid|cost|quantity|total|revenue|profit|discount|spend|income|yards|score|points|weight|duration/i;
const MEASURE_TOKEN =
  /(^|[_\s-])(amt|qty|fee|tax|epa|wpa|sale|value|count|margin)($|[_\s-])/i;

/** The column part of a qualified id: "store_sales.ss_item_sk" -> "ss_item_sk". */
export function shortFieldName(field: string) {
  return field.slice(field.lastIndexOf(".") + 1);
}

function nearlyUnique(profile: FieldProfile) {
  const present = profile.totalCount - profile.nullCount;
  return present >= 20 && profile.uniqueCount >= present * 0.9;
}

function integral(profile: FieldProfile) {
  const stats = profile.statistics;
  return Boolean(
    stats && Number.isInteger(stats.min) && Number.isInteger(stats.max)
  );
}

/** True for a field that most likely identifies rows rather than measures them. */
export function isLikelyKey(profile: FieldProfile) {
  const name = shortFieldName(profile.name);
  if (KEY_NAME.test(name)) return true;
  if (profile.dataType !== "numeric") return false;
  if (NUMBER_NAME.test(name))
    return integral(profile) && profile.uniqueCount > 20;
  return integral(profile) && nearlyUnique(profile);
}

function rank<T>(items: T[], score: (item: T) => number) {
  return items
    .map((item, index) => ({ item, index, score: score(item) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ item }) => item);
}

/** Numeric fields, best measure first: money and quantity names, keys last. */
export function rankMeasureFields(names: string[], profiles: FieldProfile[]) {
  const byName = new Map(profiles.map((profile) => [profile.name, profile]));
  return rank(names, (name) => {
    const profile = byName.get(name);
    if (profile && isLikelyKey(profile)) return -1;
    const short = shortFieldName(name);
    return MEASURE_WORD.test(short) || MEASURE_TOKEN.test(short) ? 1 : 0;
  });
}

/**
 * Fields that read as dates, best first: date-typed fields, then text that
 * parses as dates. A number field, such as ss_sold_date_sk or a quantity,
 * would read as milliseconds since 1970, so it is left out.
 */
export function rankDateFields(names: string[], profiles: FieldProfile[]) {
  const byName = new Map(profiles.map((profile) => [profile.name, profile]));
  return rank(
    names.filter((name) => byName.get(name)?.dataType !== "numeric"),
    (name) => (byName.get(name)?.dataType === "datetime" ? 1 : 0)
  );
}

/** Non-numeric fields, best group first: few-valued text, keys last. */
export function rankGroupFields(names: string[], profiles: FieldProfile[]) {
  const byName = new Map(profiles.map((profile) => [profile.name, profile]));
  return rank(names, (name) => {
    const profile = byName.get(name);
    if (!profile) return 0;
    if (isLikelyKey(profile) || nearlyUnique(profile)) return -1;
    if (profile.dataType === "datetime") return 0;
    return profile.uniqueCount >= 2 && profile.uniqueCount <= 50 ? 2 : 1;
  });
}
