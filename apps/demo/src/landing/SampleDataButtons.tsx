import { useState } from "react";
import {
  readTableFile,
  readTableText,
  TABLE_FORMATS,
  tableFormatOf,
  type TableFile,
} from "exploreda/readers";
import { useImportChoice } from "../ImportChoice";

const samples = [
  {
    id: "penguins",
    label: "Palmer penguins",
    detail: "344 rows",
    url: "/datasets/palmer-penguins.csv",
  },
  {
    id: "wine",
    label: "Red wine quality",
    detail: "1,599 rows",
    url: "/datasets/wine-quality-red.csv",
  },
  {
    id: "orders",
    label: "Shop orders",
    detail: "500 rows",
    url: "/datasets/shop-operations.csv",
  },
  {
    id: "inventory",
    label: "Store inventory",
    detail: "240 rows, TSV",
    url: "/datasets/store-inventory.tsv",
  },
  {
    id: "events",
    label: "App events",
    detail: "300 rows, JSON Lines",
    url: "/datasets/app-events.ndjson",
  },
  {
    id: "sales",
    label: "Regional sales",
    detail: "3 sheets, Excel",
    url: "/datasets/regional-sales.xlsx",
  },
  {
    id: "trips",
    label: "Bike trips",
    detail: "5,000 rows, Parquet",
    url: "/datasets/bike-trips.parquet",
  },
  {
    id: "weather",
    label: "Weather stations",
    detail: "2,016 rows, Feather",
    url: "/datasets/weather-stations.feather",
  },
];

/** Loads a bundled file through the same reader as a user's own import. */
export function SampleDataButtons({
  onImport,
}: {
  onImport: (table: TableFile) => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sheets = useImportChoice(onImport, setError);

  const load = async (sample: (typeof samples)[number]) => {
    setLoading(sample.id);
    setError(null);
    try {
      const response = await fetch(sample.url);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const name = sample.url.split("/").pop()!;
      const format = TABLE_FORMATS.find(
        (info) => info.format === tableFormatOf(name)
      );
      if (format?.binary) {
        const file = new File([await response.blob()], name);
        sheets.offer(file, await readTableFile(file));
      } else {
        onImport(readTableText(await response.text(), { name }));
      }
    } catch {
      setError(`Could not load ${sample.label}. Try again.`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mt-5">
      <p className="text-sm text-muted-foreground">
        No file handy? Open one of these:
      </p>
      <ul className="mt-1.5 grid gap-x-6 sm:grid-cols-2">
        {samples.map((sample) => (
          <li key={sample.id}>
            <button
              type="button"
              disabled={loading !== null}
              onClick={() => void load(sample)}
              className="flex w-full items-baseline justify-between gap-3 rounded-sm py-1 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 [&:hover>span:first-child]:text-brand-navy"
            >
              <span className="font-medium text-site-accent transition-colors">
                {loading === sample.id ? "Loading…" : sample.label}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {sample.detail}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {sheets.prompt && <div className="mt-3">{sheets.prompt}</div>}
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
