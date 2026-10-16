import { fieldNamesFromHeader, typeTextColumns, type Cell } from "./columns";
import { TableReadError, type WorkbookSheet } from "./types";
import type {
  AnalysisSourceRow,
  FieldDefinition,
} from "@/types/AnalysisProject";

type SheetCell = string | number | boolean | Date | null;

const isEmpty = (cell: SheetCell | undefined) =>
  cell === null ||
  cell === undefined ||
  (typeof cell === "string" && cell.trim() === "");

/**
 * Excel stores times as fractions of a day, so they read back a millisecond
 * off (11:29:59.999). Dates round to the second. A whole day reads as a date,
 * and any other time as a date-time without a zone, as the sheet shows it.
 */
export function workbookDateText(date: Date): string {
  const iso = new Date(Math.round(date.getTime() / 1000) * 1000).toISOString();
  return iso.endsWith("T00:00:00.000Z") ? iso.slice(0, 10) : iso.slice(0, 19);
}

const toCell = (cell: SheetCell | undefined): Cell =>
  cell instanceof Date ? workbookDateText(cell) : (cell ?? null);

function filled(row: readonly SheetCell[]) {
  let count = 0;
  for (const cell of row) if (!isEmpty(cell)) count += 1;
  return count;
}

/**
 * Where a sheet's table starts. Title and note rows above a table fill one
 * cell; the header is the first row that fills at least half of the widest
 * row, and at least two cells when the table has more than one column.
 */
function headerIndex(data: readonly (readonly SheetCell[])[]) {
  const widest = Math.max(0, ...data.map(filled));
  if (widest === 0) return -1;
  const needed = widest === 1 ? 1 : Math.max(2, Math.ceil(widest / 2));
  return data.findIndex((row) => filled(row) >= needed);
}

function summarize(name: string, data: readonly (readonly SheetCell[])[]) {
  const header = headerIndex(data);
  const body = header === -1 ? [] : data.slice(header + 1);
  const rows = body.filter((row) => filled(row) > 0).length;
  const columns = Math.max(0, ...data.map(filled));
  return { name, rows, columns, header };
}

/** The sheet with the most cells, so a cover or notes sheet isn't chosen. */
function largest(summaries: readonly { rows: number; columns: number }[]) {
  let best = -1;
  let cells = 0;
  summaries.forEach((summary, index) => {
    if (summary.rows * summary.columns > cells) {
      best = index;
      cells = summary.rows * summary.columns;
    }
  });
  return best;
}

/**
 * Reads one sheet of an Excel workbook (.xlsx) as a table: the largest
 * table, or the sheet `sheet` names. Cells keep the type the workbook
 * gives them; formulas read as their stored results and are never
 * calculated. Error cells, such as #DIV/0!, and formulas with no stored
 * result read as missing values.
 */
export async function readXlsx(
  bytes: ArrayBuffer,
  sheet: string | undefined
): Promise<{
  rows: AnalysisSourceRow[];
  fields: FieldDefinition[];
  notes: string[];
  sheet: string;
  sheets: WorkbookSheet[];
}> {
  const { default: readXlsxFile } = await import("read-excel-file/universal");
  let workbook: { sheet: string; data: SheetCell[][] }[];
  try {
    workbook = (await readXlsxFile(bytes)) as unknown as typeof workbook;
  } catch (error) {
    throw new TableReadError(
      `The file is not a readable Excel workbook (${error instanceof Error ? error.message : String(error)}).`
    );
  }
  const summaries = workbook.map((item) => summarize(item.sheet, item.data));
  const sheets = summaries
    .filter((summary) => summary.header !== -1)
    .map(({ name, rows, columns }) => ({ name, rows, columns }));
  const index = sheet
    ? workbook.findIndex((item) => item.sheet === sheet)
    : largest(summaries);
  if (index === -1) {
    throw new TableReadError(
      sheet
        ? `The workbook has no sheet named "${sheet}".`
        : "The workbook has no sheet with data."
    );
  }
  const { data, sheet: name } = workbook[index]!;
  const header = summaries[index]!.header;
  if (header === -1) {
    throw new TableReadError(`Sheet "${name}" is empty.`);
  }
  const width = Math.max(
    ...data.map((row) => {
      let last = row.length - 1;
      while (last >= 0 && isEmpty(row[last])) last -= 1;
      return last + 1;
    })
  );
  const notes: string[] = [];
  const headerCells = Array.from({ length: width }, (_, column) => {
    const cell = toCell(data[header]![column]);
    return cell === null ? "" : String(cell);
  });
  const names = fieldNamesFromHeader(headerCells, notes);
  if (header > 0) {
    notes.unshift(
      `Started "${name}" at row ${header + 1}, below ${header === 1 ? "1 title row" : `${header} title rows`}.`
    );
  }
  const body = data.slice(header + 1);
  const kept = body.filter((row) => filled(row) > 0);
  if (kept.length < body.length) {
    const skipped = body.length - kept.length;
    notes.push(
      `Skipped ${skipped} empty ${skipped === 1 ? "row" : "rows"} in "${name}".`
    );
  }
  const cells = kept.map((row) =>
    names.map((_, column) => toCell(row[column]))
  );
  return {
    ...typeTextColumns(names, cells),
    notes,
    sheet: name,
    sheets,
  };
}
