import type { AnalysisProjectFile } from "exploreda/analysis";
import {
  tableFileTypes,
  tableFormatList,
  type TableFile,
} from "exploreda/readers";
import { Button } from "@/components/ui/button";

import { useImportChoice } from "./ImportChoice";
import { readImportFile } from "./tableImport";
import { Plus, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface CsvUploadProps {
  compact?: boolean;
  onProjectImport?: (file: AnalysisProjectFile) => void;
  onImport?: (table: TableFile) => void;
}

export function CsvUpload({
  compact = false,
  onImport,
  onProjectImport,
}: CsvUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [failedFile, setFailedFile] = useState<File | null>(null);
  const sheets = useImportChoice(
    (table) => onImport?.(table),
    (message) => setError(message)
  );
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) {
        setError(`Choose a ${tableFormatList()} file.`);
        toast.error("No file selected");
        return;
      }

      try {
        setError(null);
        setFailedFile(null);
        const imported = await readImportFile(file);
        if (imported.kind === "project") {
          if (!onProjectImport) {
            throw new Error("Open this project from the project workspace");
          }
          onProjectImport(imported.project);
          return;
        }
        sheets.offer(file, imported.table);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        setFailedFile(file);
        setError(`Could not read ${file.name}: ${message}`);
        toast.error(`Could not read ${file.name}`);
      }
    },
    [onProjectImport, sheets.offer]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: tableFileTypes(),
    multiple: false,
  });

  if (compact) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onImport?.({
              name: "",
              format: "csv",
              rows: [],
              fields: [],
              fieldTypes: {},
              notes: [],
            })
          }
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Import
        </Button>
      </div>
    );
  }

  return (
    <>
      <div
        {...getRootProps({
          role: "button",
          tabIndex: 0,
          "aria-label": `Import ${tableFormatList()} data`,
          "aria-describedby": "file-upload-help",
        })}
        data-file-dropzone=""
        className="cursor-pointer rounded-lg border-2 border-dashed border-input p-5 text-center outline-none transition-colors hover:border-ring focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <input
          {...getInputProps({
            "aria-label": `Choose a ${tableFormatList()} file`,
          })}
        />
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        {isDragActive ? (
          <p>Drop the file here…</p>
        ) : (
          <p>
            Drag and drop a {tableFormatList()} file here, or click to select
            one
          </p>
        )}
        <p id="file-upload-help" className="mt-2 text-sm text-muted-foreground">
          Use a header row for delimited text and Excel sheets, and objects for
          JSON. Values keep the form the file gives them.
        </p>
        {error && (
          <div role="alert" className="mt-3 text-sm text-destructive">
            <p>{error}</p>
            {failedFile && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={(event) => {
                  event.stopPropagation();
                  void onDrop([failedFile]);
                }}
              >
                Try again
              </Button>
            )}
          </div>
        )}
      </div>
      {sheets.prompt && <div className="mt-3">{sheets.prompt}</div>}
    </>
  );
}
