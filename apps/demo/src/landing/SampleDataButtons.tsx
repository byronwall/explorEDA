import { Button } from "@/components/ui/button";
import { useState } from "react";
import { readTableText, type TableFile } from "exploreda/readers";

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
];

/** Loads a bundled file through the same reader as a user's own import. */
export function SampleDataButtons({
  onImport,
}: {
  onImport: (table: TableFile) => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async (sample: (typeof samples)[number]) => {
    setLoading(sample.id);
    setError(null);
    try {
      const response = await fetch(sample.url);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      onImport(readTableText(await response.text(), { name: sample.url }));
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
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
