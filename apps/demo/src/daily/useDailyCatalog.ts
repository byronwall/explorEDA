import { useEffect, useState } from "react";
import type catalog from "../../public/daily-viz/catalog.json";
import type datasets from "../../public/daily-viz/datasets.json";
import { assetPath } from "./corpus";

type Catalog = { entries: typeof catalog; datasets: typeof datasets };
let pending: Promise<Catalog> | undefined;

async function load() {
  const responses = await Promise.all([
    fetch(assetPath("catalog.json")),
    fetch(assetPath("datasets.json")),
  ]);
  if (responses.some((response) => !response.ok))
    throw new Error(
      "Could not load the collection. Reload this page to try again."
    );
  const [entries, sources] = await Promise.all(
    responses.map((response) => response.json())
  );
  return { entries, datasets: sources } as Catalog;
}

/** Public metadata loads once, through the same asset URLs as the source files. */
export function useDailyCatalog() {
  const [data, setData] = useState<Catalog | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    pending ??= load().catch((reason: unknown) => {
      pending = undefined;
      throw reason;
    });
    pending
      .then((result) => {
        if (active) setData(result);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not load the collection."
          );
      });
    return () => {
      active = false;
    };
  }, []);
  return { data, error };
}
