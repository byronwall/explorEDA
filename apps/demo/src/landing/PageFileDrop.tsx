import type { AnalysisProjectFile } from "exploreda/analysis";
import {
  tableFormatList,
  tableFormatOf,
  type TableFile,
} from "exploreda/readers";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSheetChoice } from "../SheetPicker";
import { readImportFile } from "../tableImport";

const carriesFiles = (event: DragEvent) =>
  Array.from(event.dataTransfer?.types ?? []).includes("Files");

/**
 * Accepts a data file dropped anywhere on the page and opens it
 * through the same import path as the upload box.
 */
export function PageFileDrop({
  onImport,
  onProjectImport,
}: {
  onImport: (table: TableFile) => void;
  onProjectImport?: (file: AnalysisProjectFile) => void;
}) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const depth = useRef(0);
  const onProjectImportRef = useRef(onProjectImport);
  onProjectImportRef.current = onProjectImport;
  const sheets = useSheetChoice(
    (table) => onImport(table),
    (message) => setError(message),
    true
  );
  const offerRef = useRef(sheets.offer);
  offerRef.current = sheets.offer;

  useEffect(() => {
    const reset = () => {
      depth.current = 0;
      setActive(false);
    };
    const handleEnter = (event: DragEvent) => {
      if (!carriesFiles(event)) {
        return;
      }
      event.preventDefault();
      depth.current += 1;
      setActive(true);
    };
    const handleOver = (event: DragEvent) => {
      if (!carriesFiles(event)) {
        return;
      }
      // Required for the browser to allow a drop instead of opening the file.
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "copy";
      }
    };
    const handleLeave = (event: DragEvent) => {
      if (!carriesFiles(event)) {
        return;
      }
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) {
        setActive(false);
      }
    };
    const handleDrop = (event: DragEvent) => {
      if (!carriesFiles(event)) {
        return;
      }
      reset();
      // Upload boxes handle their own drops; only take the rest of the page.
      if (
        event.target instanceof Element &&
        event.target.closest("[data-file-dropzone]")
      ) {
        return;
      }
      event.preventDefault();
      const file = event.dataTransfer?.files[0];
      if (!file) {
        return;
      }
      if (!tableFormatOf(file.name)) {
        setError(`${file.name} is not a ${tableFormatList()} file.`);
        return;
      }
      setError(null);
      (async () => {
        const imported = await readImportFile(file);
        if (imported.kind === "project") {
          if (!onProjectImportRef.current) {
            throw new Error("Open this project from the project workspace");
          }
          onProjectImportRef.current(imported.project);
          return;
        }
        offerRef.current(file, imported.table);
      })().catch((reason: unknown) => {
        const message =
          reason instanceof Error ? reason.message : "Unknown error";
        setError(`Could not read ${file.name}: ${message}.`);
      });
    };

    window.addEventListener("dragenter", handleEnter);
    window.addEventListener("dragover", handleOver);
    window.addEventListener("dragleave", handleLeave);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("dragend", reset);
    return () => {
      window.removeEventListener("dragenter", handleEnter);
      window.removeEventListener("dragover", handleOver);
      window.removeEventListener("dragleave", handleLeave);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("dragend", reset);
    };
  }, []);

  return (
    <>
      {active && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center landing-drop-overlay p-4 sm:p-6"
        >
          <div className="flex h-full w-full max-w-6xl flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-site-accent px-6 text-center">
            <FileUp className="h-10 w-10 text-site-accent" aria-hidden="true" />
            <p className="text-2xl font-semibold tracking-tight text-balance">
              Drop to explore your data
            </p>
            <p className="text-sm text-muted-foreground">
              {tableFormatList()}. It opens in the workspace right away.
            </p>
          </div>
        </div>
      )}
      {sheets.picker}
      {error && (
        <div
          role="alert"
          className="fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-3 rounded-lg border border-destructive/50 bg-background px-4 py-2 text-sm shadow-lg"
        >
          <span className="text-destructive">{error}</span>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}
    </>
  );
}
