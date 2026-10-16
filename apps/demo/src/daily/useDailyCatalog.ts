import { useEffect, useState } from "react";
import { assetPath, type DailyIndex } from "./corpus";

let pending: Promise<DailyIndex> | undefined;

/** The index `dailyCorpus.mjs` derives from the catalogue and its files. */
async function load() {
  const response = await fetch(assetPath("index.json"));
  if (!response.ok)
    throw new Error(
      "Could not load the collection. Reload this page to try again."
    );
  return (await response.json()) as DailyIndex;
}

/** Public metadata loads once, through the same asset URLs as the source files. */
export function useDailyCatalog() {
  const [data, setData] = useState<DailyIndex | null>(null);
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
