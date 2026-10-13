import {
  parseAnalysisProject,
  type AnalysisProjectFile,
  type FieldDefinition,
} from "exploreda/analysis";
import {
  readTableFile,
  readTableText,
  tableFormatOf,
  type DeclaredFieldType,
  type TableFile,
} from "exploreda/readers";

/** A dropped or chosen file: a saved project, or a table of rows. */
export type ImportedFile =
  | { kind: "project"; project: AnalysisProjectFile }
  | { kind: "table"; table: TableFile };

function isProjectJson(text: string) {
  if (!text.includes("exploreda-project")) return false;
  try {
    return JSON.parse(text).format === "exploreda-project";
  } catch {
    return false;
  }
}

/**
 * Reads a file chosen for import. A JSON project file opens as a project;
 * every other readable file is one table.
 */
export async function readImportFile(file: File): Promise<ImportedFile> {
  if (tableFormatOf(file.name) === "json") {
    const text = await file.text();
    if (isProjectJson(text)) {
      return { kind: "project", project: parseAnalysisProject(text) };
    }
    return { kind: "table", table: readTableText(text, { name: file.name }) };
  }
  return { kind: "table", table: await readTableFile(file) };
}

/** Field definitions for saved field types, as project sources take them. */
export function fieldsFromTypes(
  types: Record<string, DeclaredFieldType> | undefined
): FieldDefinition[] | undefined {
  return types
    ? Object.entries(types).map(([id, type]) => ({ id, name: id, type }))
    : undefined;
}
