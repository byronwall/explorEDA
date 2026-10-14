import { useState, type FormEvent } from "react";
import type { FetchedRecord } from "./httpFiles";

/** A data file's place in the project: `data/<name>`. */
export const uploadPath = (name: string) =>
  `data/${name.replace(/[^\w.-]+/g, "-").replace(/^-+/, "") || "upload.csv"}`;

/**
 * Adds a CSV or JSON file to a team server project, from this computer or
 * from an address the server downloads. A file with the same name is
 * replaced only after the author says so.
 */
export function AddData({
  existing,
  onUpload,
  onFetch,
  onDone,
}: {
  existing: string[];
  onUpload: (file: File, path: string) => Promise<void>;
  onFetch: (url: string) => Promise<void>;
  onDone?: () => void;
}) {
  const [pending, setPending] = useState<{ file: File; path: string }>();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const upload = async (file: File, path: string) => {
    setBusy(true);
    setPending(undefined);
    await onUpload(file, path);
    setBusy(false);
    onDone?.();
  };
  const choose = (file: File | undefined) => {
    if (!file) {
      return;
    }
    const path = uploadPath(file.name);
    if (existing.includes(path)) {
      setPending({ file, path });
    } else {
      void upload(file, path);
    }
  };
  const download = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    await onFetch(url.trim());
    setBusy(false);
    setUrl("");
    onDone?.();
  };

  return (
    <div className="app-add-data" aria-busy={busy || undefined}>
      <label className="app-file">
        <span>Upload a CSV or JSON file</span>
        <input
          type="file"
          accept=".csv,.json,text/csv,application/json"
          disabled={busy}
          onChange={(event) => {
            choose(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>
      {pending && (
        <div className="app-form-inline" role="group" aria-label="Replace">
          <span className="app-muted">
            {pending.path} is already here. Replace it?
          </span>
          <button
            type="button"
            className="app-button app-button-danger"
            onClick={() => void upload(pending.file, pending.path)}
          >
            Replace
          </button>
          <button
            type="button"
            className="app-button"
            onClick={() => setPending(undefined)}
          >
            Keep
          </button>
        </div>
      )}
      <form className="app-url" onSubmit={(event) => void download(event)}>
        <label>
          <span>Or download from an address</span>
          <input
            type="url"
            required
            placeholder="https://reports.example.com/orders.csv"
            value={url}
            disabled={busy}
            onChange={(event) => setUrl(event.target.value)}
          />
        </label>
        <button type="submit" className="app-button" disabled={busy}>
          {busy ? "Adding…" : "Download"}
        </button>
      </form>
      <p className="app-muted app-hint">
        The server downloads the file now and keeps a copy. Refetch gets a fresh
        one later.
      </p>
    </div>
  );
}

/** "fetched 9:05 AM", or a date when it wasn't today. */
export function fetchedLabel(record: FetchedRecord, now = new Date()) {
  const when = new Date(record.fetchedAt);
  const today = when.toDateString() === now.toDateString();
  return `fetched ${
    today
      ? when.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      : when.toLocaleDateString([], { month: "short", day: "numeric" })
  }`;
}
