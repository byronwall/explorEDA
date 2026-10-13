import { Button } from "@/components/ui/button";
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
        No file handy? Start with one of these:
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {samples.map((sample) => (
          <Button
            key={sample.id}
            variant="outline"
            size="sm"
            disabled={loading !== null}
            onClick={() => void load(sample)}
          >
            {loading === sample.id ? "Loading…" : sample.label}
            <span className="text-xs font-normal text-muted-foreground">
              {sample.detail}
            </span>
          </Button>
        ))}
      </div>
      {sheets.prompt && <div className="mt-3">{sheets.prompt}</div>}
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
