// Prepares the timeline composition example: every justice of the Supreme
// Court of the United States, with the seat they held, their term, and the
// president who appointed them, parsed from the Wikipedia list's wikitext.
//
//   node --experimental-strip-types prepare/scotus.ts [--cache <dir>]
//
// One row per justice (a justice who served in two seats has two rows),
// so a composition can repeat by seat and draw each term as a span.

import { readFileSync } from "node:fs";
import path from "node:path";
import { cachedDownload, writeCsv, type Row } from "./lib.ts";

const SOURCE_URL =
  "https://en.wikipedia.org/w/api.php?action=parse&page=List_of_justices_of_the_Supreme_Court_of_the_United_States&prop=wikitext&format=json&formatversion=2";
// The party each appointing president was elected with.
const PARTIES: Record<string, string> = {
  "George Washington": "Federalist",
  "John Adams": "Federalist",
  "Thomas Jefferson": "Democratic-Republican",
  "James Madison": "Democratic-Republican",
  "James Monroe": "Democratic-Republican",
  "John Quincy Adams": "Democratic-Republican",
  "Andrew Jackson": "Democratic",
  "Martin Van Buren": "Democratic",
  "John Tyler": "Whig",
  "James K. Polk": "Democratic",
  "Millard Fillmore": "Whig",
  "Franklin Pierce": "Democratic",
  "James Buchanan": "Democratic",
  "Abraham Lincoln": "Republican",
  "Ulysses S. Grant": "Republican",
  "Rutherford B. Hayes": "Republican",
  "James A. Garfield": "Republican",
  "Chester A. Arthur": "Republican",
  "Grover Cleveland": "Democratic",
  "Benjamin Harrison": "Republican",
  "William McKinley": "Republican",
  "Theodore Roosevelt": "Republican",
  "William Howard Taft": "Republican",
  "Woodrow Wilson": "Democratic",
  "Warren G. Harding": "Republican",
  "Calvin Coolidge": "Republican",
  "Herbert Hoover": "Republican",
  "Franklin D. Roosevelt": "Democratic",
  "Harry S. Truman": "Democratic",
  "Dwight D. Eisenhower": "Republican",
  "John F. Kennedy": "Democratic",
  "Lyndon B. Johnson": "Democratic",
  "Richard Nixon": "Republican",
  "Gerald Ford": "Republican",
  "Jimmy Carter": "Democratic",
  "Ronald Reagan": "Republican",
  "George H. W. Bush": "Republican",
  "George H.W. Bush": "Republican",
  "Bill Clinton": "Democratic",
  "George W. Bush": "Republican",
  "Barack Obama": "Democratic",
  "Donald Trump": "Republican",
  "Joe Biden": "Democratic",
};
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const root = path.resolve(import.meta.dirname, "../../..");
const outFile = path.join(root, "apps/demo/public/datasets/scotus.csv");
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

const { parse } = JSON.parse(
  readFileSync(
    await cachedDownload(SOURCE_URL, cacheDir, "scotus.json"),
    "utf8"
  )
) as { parse: { wikitext: string } };

/** Strips templates, links, and markup down to the visible text. */
function plain(cell: string) {
  return cell
    .replace(/\{\{efn[^}]*\}\}/g, "")
    .replace(/\{\{small\|([^}]*)\}\}/g, "$1")
    .replace(/\{\{sortname\|([^|}]*)\|([^|}]*)(?:\|[^}]*)?\}\}/g, "$1 $2")
    .replace(/\{\{sort\|[^|]*\|([^}]*)\}\}/g, "$1")
    .replace(/\{\{dts\|([^}]*)\}\}/g, "$1")
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/''/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
function isoDate(text: string) {
  const match = /([A-Z][a-z]+) (\d{1,2}), (\d{4})/.exec(text);
  if (!match) return undefined;
  const month = MONTHS.indexOf(match[1]!) + 1;
  if (!month) return undefined;
  return `${match[3]}-${String(month).padStart(2, "0")}-${match[2]!.padStart(2, "0")}`;
}

const rows: Row[] = [];
let appointer = "";
// Rows start with a |- separator; the table styles some rows differently
// and bolds the sitting justices.
const table = parse.wikitext.slice(parse.wikitext.indexOf("{|"));
const sections = table.replace(/'''/g, "").split(/\n\|-[^\n]*\n/);
for (const section of sections.slice(1)) {
  const cells = ("\n" + section.trim())
    .split(/\n\|/)
    .map((cell) => cell.trim())
    .filter((cell) => cell !== "");
  if (cells.length < 9) continue;
  const [
    index,
    ,
    nameCell,
    stateCell,
    positionCell,
    succeededCell,
    ,
    termCell,
  ] = cells;
  // The appointer cell spans several rows; it appears on the first only.
  if (cells.length >= 10) {
    // The cell may carry a style and rowspan before a pipe; the name's
    // own template holds pipes too, so only the attribute prefix goes.
    const raw = cells[9]!;
    appointer = plain(raw.replace(/^[^{|]*\|/, "")).trim();
  }
  const name = plain(nameCell!.split("<br>")[0]!);
  // The successor sort key is the seat and the seat's occupant number:
  // 001 is the Chief Justice's seat, 101 seat 1, 1003 seat 10.
  const seatCode = /\{\{sort\|(\d+)\|/.exec(succeededCell!)?.[1] ?? "";
  const seat = seatCode.length >= 3 ? Number(seatCode.slice(0, -2)) : NaN;
  const term = termCell!.split(/<br>\s*–\s*<br>/);
  const start = isoDate(plain(term[0] ?? ""));
  const endText = plain(term[1] ?? "");
  const end = isoDate(endText);
  const reason = /\(([^)]*)\)/.exec(endText)?.[1] ?? (end ? "" : "Sitting");
  if (!start || Number.isNaN(seat)) continue;
  const endMs = end ? Date.parse(end) : Date.now();
  rows.push({
    Justice: name,
    Surname: name
      .split(" ")
      .filter((part) => !/^(Jr\.|II|III)$/.test(part))
      .pop()!,
    Number: Number(index),
    Position: /Chief/.test(positionCell!)
      ? "Chief Justice"
      : "Associate Justice",
    State: plain(stateCell!),
    Seat: seat,
    "Seat name": seat === 0 ? "Chief Justice" : `Seat ${seat}`,
    Start: start,
    End: end ?? null,
    "Years served":
      Math.round(((endMs - Date.parse(start)) / 31_557_600_000) * 10) / 10,
    "Left by": reason,
    Appointer: appointer,
    Party: PARTIES[appointer] ?? "Unknown",
  });
}

const written = writeCsv(
  outFile,
  [
    "Justice",
    "Surname",
    "Number",
    "Position",
    "State",
    "Seat",
    "Seat name",
    "Start",
    "End",
    "Years served",
    "Left by",
    "Appointer",
    "Party",
  ],
  rows
);
console.log(
  `${written.rows} terms written to ${path.relative(root, outFile)} (${written.sha256.slice(0, 12)})`
);
