/** A whole-day date range a date filter can apply in one click. */
export interface DatePreset {
  label: string;
  /** Inclusive bounds as UTC dates, `YYYY-MM-DD`. */
  min: string;
  max: string;
}

export interface DatePresetGroup {
  label: string;
  presets: DatePreset[];
}

const DAY = 86_400_000;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const isoDate = (time: number) => new Date(time).toISOString().slice(0, 10);

/** The first day of a UTC month, allowing month counts past December. */
const monthStart = (year: number, month: number) => Date.UTC(year, month, 1);

/**
 * Quick ranges that fit the span of a date field: recent periods counted
 * back from its latest date, then whole years, quarters, or months, whichever
 * gives a short list. All periods use UTC calendar days.
 */
export function datePresets(
  firstTime: number,
  lastTime: number
): DatePresetGroup[] {
  if (!Number.isFinite(firstTime) || !Number.isFinite(lastTime)) return [];
  if (lastTime <= firstTime) return [];
  const first = new Date(firstTime);
  const last = new Date(lastTime);
  const lastDay = Date.UTC(
    last.getUTCFullYear(),
    last.getUTCMonth(),
    last.getUTCDate()
  );
  const spanDays = (lastDay - firstTime) / DAY;
  const groups: DatePresetGroup[] = [];

  const recent = (
    [
      ["Last 7 days", 7],
      ["Last 30 days", 30],
      ["Last 90 days", 90],
      ["Last 365 days", 365],
    ] as const
  )
    .filter(([, days]) => days < spanDays)
    .map(([label, days]) => ({
      label,
      min: isoDate(lastDay - (days - 1) * DAY),
      max: isoDate(lastDay),
    }));
  if (recent.length) groups.push({ label: "Latest", presets: recent });

  const firstYear = first.getUTCFullYear();
  const lastYear = last.getUTCFullYear();
  const years = lastYear - firstYear + 1;
  const firstMonth = firstYear * 12 + first.getUTCMonth();
  const months = lastYear * 12 + last.getUTCMonth() - firstMonth + 1;
  const firstQuarter = Math.floor(firstMonth / 3);
  const quarters =
    Math.floor((lastYear * 12 + last.getUTCMonth()) / 3) - firstQuarter + 1;
  const showYear = years > 1;

  if (years >= 2 && years <= 10) {
    groups.push({
      label: "Year",
      presets: Array.from({ length: years }, (_, index) => {
        const year = firstYear + index;
        return {
          label: String(year),
          min: `${year}-01-01`,
          max: `${year}-12-31`,
        };
      }),
    });
  }
  if (quarters >= 2 && quarters <= 8) {
    groups.push({
      label: "Quarter",
      presets: Array.from({ length: quarters }, (_, index) => {
        const quarter = firstQuarter + index;
        const year = Math.floor(quarter / 4);
        const month = (quarter % 4) * 3;
        return {
          label: `Q${(quarter % 4) + 1}${showYear ? ` ${year}` : ""}`,
          min: isoDate(monthStart(year, month)),
          max: isoDate(monthStart(year, month + 3) - DAY),
        };
      }),
    });
  }
  if (months >= 2 && months <= 12) {
    groups.push({
      label: "Month",
      presets: Array.from({ length: months }, (_, index) => {
        const month = firstMonth + index;
        const year = Math.floor(month / 12);
        return {
          label: `${MONTHS[month % 12]}${showYear ? ` ${year}` : ""}`,
          min: isoDate(monthStart(year, month % 12)),
          max: isoDate(monthStart(year, (month % 12) + 1) - DAY),
        };
      }),
    });
  }
  return groups;
}
