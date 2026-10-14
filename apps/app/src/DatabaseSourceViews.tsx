/**
 * The project rail's database parts: each source with its last read and
 * Refresh, Read all, the panel shown while an analysis waits for its data,
 * and the password form a connection asks for when it needs one.
 */
import { useEffect, useState } from "react";
import { readAgo, type ProjectFolder } from "exploreda";
import { RefreshError } from "./httpFiles";

/** A list of names in words: "a", "a and b", "a, b, and c". */
export function listWords(items: string[]) {
  if (items.length < 3) {
    return items.join(" and ");
  }
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

type ReadState =
  | { status: "idle" }
  | { status: "reading" }
  | {
      status: "failed";
      message: string;
      suggestion?: string;
      /** Set when the failure is a connection asking for its password. */
      needsSecret?: string;
    };

/** Runs a read and keeps what happened, for a button and its message. */
export function useRead(read: (() => Promise<void>) | undefined) {
  const [state, setState] = useState<ReadState>({ status: "idle" });
  const run = async () => {
    if (!read) {
      return;
    }
    setState({ status: "reading" });
    try {
      await read();
      setState({ status: "idle" });
    } catch (error) {
      const refresh = error instanceof RefreshError ? error : undefined;
      setState({
        status: "failed",
        message: error instanceof Error ? error.message : String(error),
        ...(refresh?.suggestion ? { suggestion: refresh.suggestion } : {}),
        ...(refresh?.code === "secret" && refresh.connection
          ? { needsSecret: refresh.connection }
          : {}),
      });
    }
  };
  return { state, run };
}

/** A failed read's message, and a password form when that's the fix. */
export function ReadProblem({
  state,
  onSaveSecret,
  onRetry,
}: {
  state: ReadState;
  onSaveSecret?: (connectionId: string, secret: string) => Promise<void>;
  onRetry: () => Promise<void>;
}) {
  if (state.status !== "failed") {
    return null;
  }
  return (
    <div className="app-read-problem">
      <p className="app-source-error" role="alert">
        {state.message}
        {state.needsSecret && !onSaveSecret ? (
          <span className="app-muted"> Ask an admin to enter it.</span>
        ) : (
          state.suggestion && (
            <span className="app-muted"> {state.suggestion}</span>
          )
        )}
      </p>
      {state.needsSecret && onSaveSecret && (
        <SecretForm
          connection={state.needsSecret}
          onSave={async (secret) => {
            await onSaveSecret(state.needsSecret!, secret);
            await onRetry();
          }}
        />
      )}
    </div>
  );
}

/** Asks for a connection's password; the server checks it before keeping it. */
function SecretForm({
  connection,
  onSave,
}: {
  connection: string;
  onSave: (secret: string) => Promise<void>;
}) {
  const [secret, setSecret] = useState("");
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "saving" }
    | { status: "failed"; message: string }
  >({ status: "idle" });
  return (
    <form
      className="app-form app-secret-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!secret) {
          return;
        }
        setState({ status: "saving" });
        onSave(secret).then(
          () => setState({ status: "idle" }),
          (error: unknown) =>
            setState({
              status: "failed",
              message: error instanceof Error ? error.message : String(error),
            })
        );
      }}
    >
      <label>
        <span>Password for {connection}</span>
        <input
          type="password"
          autoComplete="off"
          value={secret}
          onChange={(event) => setSecret(event.target.value)}
        />
      </label>
      <p className="app-muted app-secret-note">
        Kept by explorEDA, outside the project, so the folder stays safe to
        commit.
      </p>
      <div className="app-form-actions">
        <button
          type="submit"
          className="app-button app-button-primary"
          disabled={!secret || state.status === "saving"}
        >
          {state.status === "saving" ? "Checking…" : "Save and read"}
        </button>
      </div>
      {state.status === "failed" && (
        <p className="app-source-error" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}

/** Reads every database source again, in one go. */
export function RefreshAll({
  sourceIds,
  unread,
  onRefresh,
  onError,
}: {
  sourceIds: string[];
  unread: number;
  onRefresh: (sourceIds: string[]) => Promise<void>;
  onError: (message: string | undefined) => void;
}) {
  const [reading, setReading] = useState(false);
  const run = async () => {
    setReading(true);
    onError(undefined);
    try {
      await onRefresh(sourceIds);
    } catch (error) {
      onError(
        `${error instanceof Error ? error.message : String(error)}${
          error instanceof RefreshError && error.suggestion
            ? ` ${error.suggestion}`
            : ""
        }`
      );
    } finally {
      setReading(false);
    }
  };
  return (
    <button
      type="button"
      className="app-button app-section-action"
      aria-label={`Read all ${sourceIds.length} database sources again`}
      disabled={reading}
      onClick={() => void run()}
    >
      {reading
        ? "Reading…"
        : unread === sourceIds.length
          ? "Read all"
          : "Refresh all"}
    </button>
  );
}

/** In place of an analysis whose database sources haven't been read. */
export function WaitingForData({
  analysis,
  sourceIds,
  connections,
  onRead,
  onSaveSecret,
}: {
  analysis: string;
  sourceIds: string[];
  connections: string[];
  onRead?: (sourceIds: string[]) => Promise<void>;
  onSaveSecret?: (connectionId: string, secret: string) => Promise<void>;
}) {
  const { state, run } = useRead(onRead ? () => onRead(sourceIds) : undefined);
  const them = sourceIds.length === 1 ? "it" : "them";
  return (
    <div className="app-message">
      <h2>{analysis} needs its data</h2>
      <p>
        It reads {listWords(sourceIds)} from {listWords(connections)}, which{" "}
        {sourceIds.length === 1 ? "hasn't" : "haven't"} been read yet.{" "}
        {onRead
          ? `Read ${them} once; after that the project opens from the copy explorEDA keeps, and Refresh reads ${them} again.`
          : `An author of this project needs to read ${them} first.`}
      </p>
      {onRead && (
        <button
          type="button"
          className="app-button app-button-primary"
          disabled={state.status === "reading"}
          onClick={() => void run()}
        >
          {state.status === "reading"
            ? `Reading from ${listWords(connections)}…`
            : `Read ${listWords(sourceIds)}`}
        </button>
      )}
      <ReadProblem state={state} onSaveSecret={onSaveSecret} onRetry={run} />
    </div>
  );
}

/** The time since a read, kept current while the page stays open. */
function useReadAgo(readAt: string | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!readAt) {
      return;
    }
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, [readAt]);
  return readAt ? readAgo(readAt, now) : undefined;
}

/** A database source: its rows, when they were read, and Refresh. */
export function DatabaseSourceItem({
  name,
  sourceId,
  connection,
  rows,
  snapshot,
  onRefresh,
  onSaveSecret,
}: {
  name: string;
  sourceId: string;
  connection: string;
  rows: number;
  snapshot?: ProjectFolder["snapshots"][string];
  onRefresh?: (sourceId: string) => Promise<void>;
  onSaveSecret?: (connectionId: string, secret: string) => Promise<void>;
}) {
  const { state, run } = useRead(
    onRefresh ? () => onRefresh(sourceId) : undefined
  );
  const ago = useReadAgo(snapshot?.readAt);
  return (
    <li className="app-source">
      <span>{name}</span>
      <span className="app-muted">
        {snapshot ? `${rows.toLocaleString()} rows · ` : ""}from {connection}
      </span>
      {!snapshot && state.status !== "reading" && (
        <span className="app-badge app-badge-warning">Not read</span>
      )}
      <span className="app-fetched">
        {(state.status === "reading" || ago) && (
          <span className="app-muted">
            {state.status === "reading"
              ? `Reading from ${connection}…`
              : `Read ${ago}`}
          </span>
        )}
        {onRefresh && state.status !== "reading" && (
          <button
            type="button"
            className="app-button"
            aria-label={`Read ${sourceId} again from ${connection}`}
            onClick={() => void run()}
          >
            {snapshot ? "Refresh" : "Read now"}
          </button>
        )}
      </span>
      <ReadProblem state={state} onSaveSecret={onSaveSecret} onRetry={run} />
    </li>
  );
}
