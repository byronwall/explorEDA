// Prepares the sparkline-table composition example: opening prices of 14
// technology stocks, 2010–2023, from the TidyTuesday 2023-02-07 dataset.
//
//   node --experimental-strip-types prepare/big-tech.ts [--cache <dir>]
//
// Every fifth trading day is kept, plus each company's first and last day,
// so first-to-last changes match the full series while the file stays small.
// Observation numbers each kept row within its company in date order; the
// composition spaces points by that number, as the source sparklines do.

import { readFileSync } from "node:fs";
import path from "node:path";
import { cachedDownload, readCsv, writeCsv, type Row } from "./lib.ts";

const BASE =
  "https://raw.githubusercontent.com/rfordatascience/tidytuesday/master/data/2023/2023-02-07";
const EVERY = 5;

const root = path.resolve(import.meta.dirname, "../../..");
const outFile = path.join(
  root,
  "apps/demo/public/datasets/big-tech-prices.csv"
);
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

const prices = readCsv(
  readFileSync(
    await cachedDownload(`${BASE}/big_tech_stock_prices.csv`, cacheDir),
    "utf8"
  )
);
const companies = new Map(
  readCsv(
    readFileSync(
      await cachedDownload(`${BASE}/big_tech_companies.csv`, cacheDir),
      "utf8"
    )
  ).map((row) => [row.stock_symbol, row.company])
);

const bySymbol = new Map<string, { date: string; open: number }[]>();
for (const row of prices) {
  const open = Number(row.open);
  if (!Number.isFinite(open) || !row.stock_symbol || !row.date) continue;
  let list = bySymbol.get(row.stock_symbol);
  if (!list) {
    list = [];
    bySymbol.set(row.stock_symbol, list);
  }
  list.push({ date: row.date!, open });
}

const rows: Row[] = [];
for (const [symbol, list] of [...bySymbol].sort()) {
  list.sort((a, b) => a.date.localeCompare(b.date));
  const company = companies.get(symbol);
  if (!company) throw new Error(`No company name for ${symbol}`);
  let observation = 0;
  list.forEach((item, index) => {
    const keep = index % EVERY === 0 || index === list.length - 1;
    if (!keep) return;
    observation += 1;
    rows.push({
      Symbol: symbol,
      Company: company.replace(/,? Inc\.$|,? Corporation$| Corp\.$/, ""),
      Date: item.date,
      Observation: observation,
      Open: Math.round(item.open * 100) / 100,
    });
  });
}

const written = writeCsv(
  outFile,
  ["Symbol", "Company", "Date", "Observation", "Open"],
  rows
);
console.log(
  `${written.rows} rows for ${bySymbol.size} companies written to ${path.relative(root, outFile)} (${written.sha256.slice(0, 12)})`
);
