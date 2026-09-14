import { Button } from "@/components/ui/button";

import { parseCsvData } from "./csvParser";
import { parseJsonData } from "./jsonParser";
import { Plus, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { DatumObject } from "./LandingPage";

interface CsvUploadProps {
  compact?: boolean;
  onImport?: (data: DatumObject[], fileName: string) => void;
}

export function CsvUpload({ compact = false, onImport }: CsvUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) {
        setError("Choose a CSV or JSON file.");
        toast.error("No file selected");
        return;
      }

      try {
        setError(null);
        let data: DatumObject[];
        if (file.name.toLowerCase().endsWith(".csv")) {
          data = await parseCsvData(file);
        } else if (file.name.toLowerCase().endsWith(".json")) {
          data = await parseJsonData(file);
        } else {
          throw new Error("Unsupported file type");
        }
        onImport?.(data, file.name);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        setError(
          `Could not read ${file.name}: ${message}. Choose another CSV or JSON file.`
        );
        toast.error(
          `Failed to parse ${file.name.toLowerCase().endsWith(".csv") ? "CSV" : "JSON"} file`
        );
      }
    },
    [onImport]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/json": [".json"],
    },
    multiple: false,
  });

  if (compact) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onImport?.([], "")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Import
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      {isDragActive ? (
        <p>Drop the CSV or JSON file here…</p>
      ) : (
        <p>Drag and drop a CSV or JSON file here, or click to select one</p>
      )}
      <p className="mt-2 text-sm text-muted-foreground">
        Use a header row for CSV, or an object or array of objects for JSON.
      </p>
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
