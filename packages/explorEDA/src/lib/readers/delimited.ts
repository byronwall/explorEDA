import Papa from "papaparse";
import { fieldNamesFromHeader, typeTextColumns } from "./columns";
import { TableReadError } from "./types";
import type {
  AnalysisSourceRow,
  FieldDefinition,
} from "@/types/AnalysisProject";

const QUOTE_ERRORS = new Set(["MissingQuotes", "InvalidQuotes"]);

/**
 * Reads delimited text with a header row. TSV splits on tabs; CSV detects
 * its delimiter (comma, semicolon, tab, or pipe). Quoted cells may hold
 * delimiters and line breaks. Every cell is read as text first, then typed
 * by column, so "0012" and long IDs keep their digits.
 *
 * A short row's missing cells are blank. A row with extra non-blank cells is
 * an error, since its values can't be matched to fields.
 */
export function readDelimited(
  text: string,
  delimiter: "\t" | "auto"
): { rows: AnalysisSourceRow[]; fields: FieldDefinition[]; notes: string[] } {
  const parsed = Papa.parse<string[]>(text.replace(/^﻿/, ""), {
    header: false,
    dynamicTyping: false,
    skipEmptyLines: "greedy",
    delimiter: delimiter === "auto" ? "" : delimiter,
  });
  const quoteError = parsed.errors.find((error) =>
    QUOTE_ERRORS.has(error.code)
  );
  if (quoteError) {
    const row = quoteError.row ?? 0;
    throw new TableReadError(
      row > 0
        ? `Row ${row} has an unclosed or stray quote.`
        : "The header row has an unclosed or stray quote.",
      { row: row > 0 ? row : undefined }
    );
  }
  const [header, ...body] = parsed.data;
  if (!header) throw new TableReadError("The file has no header row.");
  const notes: string[] = [];
  const names = fieldNamesFromHeader(header, notes);
  const cells = body.map((row, index) => {
    if (row.length > names.length) {
      const extra = row.slice(names.length);
      if (extra.some((cell) => cell.trim() !== "")) {
        throw new TableReadError(
          `Row ${index + 1} has ${row.length} values, but the header names ${names.length} fields.`,
          { row: index + 1 }
        );
      }
    }
    return names.map((_, column) => row[column] ?? null);
  });
  return { ...typeTextColumns(names, cells), notes };
}
