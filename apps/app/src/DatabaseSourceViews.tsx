/**
 * The project rail's database parts: each source with its last read and
 * Refresh, Read all, the panel shown while an analysis waits for its data,
 * and the password form a connection asks for when it needs one.
 */
import { useContext, useEffect, useState, type ReactNode } from "react";
import { readAgo, type ProjectFolder } from "exploreda";
import * as Popover from "@radix-ui/react-popover";
import { Database, RefreshCw, X } from "lucide-react";
import { RefreshError } from "./httpFiles";
import { IconButton, RailRow } from "./RailParts";
import { ReadWatchContext, useRunningReads } from "./readProgress";

/** A list of names in words: "a", "a and b", "a, b, and c". */
export function listWords(items: string[]) {
  if (items.length < 3) {
    return items.join(" and ");
  }
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

export interface ReadFailure {
  status: "failed";
  message: string;
  suggestion?: string;
  /** The server's reason, such as `too-large` or `cancelled`. */
  code?: string;
  /** Set when the failure is a connection asking for its password. */
  needsSecret?: string;
}

type ReadState = { status: "idle" } | { status: "reading" } | ReadFailure;

/** A failed read: the server's message, and its fix when it gave one. */
export function readFailure(error: unknown): ReadFailure {
  const refresh = error instanceof RefreshError ? error : undefined;
  return {
    status: "failed",
    message: error instanceof Error ? error.message : String(error),
    ...(refresh?.suggestion ? { suggestion: refresh.suggestion } : {}),
    ...(refresh?.code ? { code: refresh.code } : {}),
    ...(refresh?.code === "secret" && refresh.connection
      ? { needsSecret: refresh.connection }
      : {}),
  };
}

/** A failed read in one sentence or two: what went wrong, then the fix. */
export function readErrorText(error: unknown) {
  const { message, suggestion } = readFailure(error);
  return suggestion ? `${message} ${suggestion}` : message;
}

/** Runs a read and keeps what happened, for a button and its message. */
export function useRead(
  read: (() => Promise<void>) | undefined,
  initial: ReadState = { status: "idle" }
) {
  const [state, setState] = useState<ReadState>(initial);
  // A failure that arrives later, from a read this view didn't start.
  useEffect(() => {
    if (initial.status === "failed") {
      setState((current) => (current.status === "reading" ? current : initial));
    }
  }, [initial]);
  /** Resolves to false when the read failed. */
  const run = async () => {
    if (!read) {
      return true;
    }
    setState({ status: "reading" });
    try {
      await read();
      setState({ status: "idle" });
      return true;
    } catch (error) {
      setState(readFailure(error));
      return false;
    }
  };
  return { state, run };
}

const count = (value: number) => value.toLocaleString("en-US");

/** Asks the server to stop a read; the read then reports it stopped. */
function CancelRead({
  sourceId,
  text,
}: {
  sourceId: string;
  /** Spells the action out, where there is room for words. */
  text?: boolean;
}) {
  const watch = useContext(ReadWatchContext);
  const [asked, setAsked] = useState(false);
  if (!watch) {
    return null;
  }
  const stop = () => {
    setAsked(true);
    watch.cancel(sourceId).catch(() => setAsked(false));
  };
  return text ? (
    <button
      type="button"
      className="app-button app-button-sm app-button-ghost"
      aria-label={`Stop reading ${sourceId}`}
      disabled={asked}
      onClick={stop}
    >
      {asked ? "Stopping…" : "Cancel"}
    </button>
  ) : (
    <IconButton
      label={`Stop reading ${sourceId}`}
      disabled={asked}
      onClick={stop}
    >
      <X />
    </IconButton>
  );
}

/** "Reading plays… 12,000 rows" and Cancel, for each read running now. */
export function RunningReads({ sourceIds }: { sourceIds?: string[] }) {
  const reads = useRunningReads();
  const shown = [...reads].filter(
    ([sourceId]) => !sourceIds || sourceIds.includes(sourceId)
  );
  if (!shown.length) {
    return null;
  }
  return (
    <ul className="app-running-reads" aria-label="Reads running now">
      {shown.map(([sourceId, rows]) => (
        <li key={sourceId} className="app-running-read">
          <span>
            Reading {sourceId}…{rows ? ` ${count(rows)} rows` : ""}
          </span>
          <CancelRead sourceId={sourceId} text />
        </li>
      ))}
    </ul>
  );
}

/** A failed read's message, and a password form when that's the fix. */
export function ReadProblem({
  state,
  onSaveSecret,
  onRetry,
}: {
  state: ReadState;
  onSaveSecret?: (connectionId: string, secret: string) => Promise<void>;
  onRetry: () => Promise<unknown>;
}) {
  if (state.status !== "failed") {
    return null;
  }
  if (state.code === "cancelled") {
    return (
      <p className="app-muted app-read-stopped" role="status">
        {state.message}
      </p>
    );
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
      className="app-form app-panel app-secret-form"
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
      <label className="app-field">
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
      onError(readErrorText(error));
    } finally {
      setReading(false);
    }
  };
  return (
    <button
      type="button"
      className="app-button app-button-sm app-button-ghost app-refresh-all"
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
  lastError,
  onRead,
  onSaveSecret,
}: {
  analysis: string;
  sourceIds: string[];
  connections: string[];
  /** The last failed read of these sources, kept since the page opened. */
  lastError?: ReadFailure;
  onRead?: (sourceIds: string[]) => Promise<void>;
  onSaveSecret?: (connectionId: string, secret: string) => Promise<void>;
}) {
  const { state, run } = useRead(onRead ? () => onRead(sourceIds) : undefined);
  const them = sourceIds.length === 1 ? "it" : "them";
  const shown = state.status === "idle" && lastError ? lastError : state;
  return (
    <div className="app-message">
      <h2>{analysis} needs its data</h2>
      <p>
        {lastError && state.status === "idle"
          ? `The last read of ${listWords(sourceIds)} failed. `
          : null}
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
            : `Read ${listWords(sourceIds)}${lastError ? " again" : ""}`}
        </button>
      )}
      <RunningReads sourceIds={sourceIds} />
      <ReadProblem state={shown} onSaveSecret={onSaveSecret} onRetry={run} />
    </div>
  );
}

/** "5 minutes ago" as "5m ago", to fit a source's meta line. */
export function shortAgo(ago: string) {
  return ago.replace(
    /^(\d+) (minute|hour|day)s? ago$/,
    (_, count: string, unit: string) => `${count}${unit[0]} ago`
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
  return readAt ? shortAgo(readAgo(readAt, now)) : undefined;
}

/** A database source: its rows, or why it has none, on one rail row. */
export function DatabaseSourceItem({
  name,
  sourceId,
  connection,
  rows,
  snapshot,
  lastError,
  onRefresh,
  onRemove,
  onPickColumns,
  onSaveSecret,
  current,
  onOpen,
}: {
  name: string;
  sourceId: string;
  /** Whether this source is open in the explorer. */
  current?: boolean;
  /** Opens the source in the explorer. */
  onOpen?: () => void;
  connection: string;
  rows: number;
  snapshot?: ProjectFolder["snapshots"][string];
  /** The last read's failure, kept by the app across reloads. */
  lastError?: ReadFailure;
  onRefresh?: (sourceId: string) => Promise<void>;
  /** Removes a source that has never been read; offered after a failure. */
  onRemove?: (sourceId: string) => Promise<void>;
  /** Opens the column picker; offered when a table is too large to read. */
  onPickColumns?: () => void;
  onSaveSecret?: (connectionId: string, secret: string) => Promise<void>;
}) {
  const { state, run } = useRead(
    onRefresh ? () => onRefresh(sourceId) : undefined,
    lastError
  );
  const [removing, setRemoving] = useState(false);
  const [open, setOpen] = useState(false);
  const ago = useReadAgo(snapshot?.readAt);
  // The page's own count of a running read outlives this view, so a read
  // still shows after the workspace redraws mid-read.
  const running = useRunningReads().get(sourceId);
  const watched = Boolean(useContext(ReadWatchContext));
  const reading = state.status === "reading" || running !== undefined;
  const failed = !reading && state.status === "failed" ? state : undefined;
  const stopped = failed?.code === "cancelled";
  const label = stopped ? "Stopped" : "Failed";
  const canPick = Boolean(onPickColumns) && failed?.code === "too-large";
  const canRemove = Boolean(onRemove) && !snapshot;
  // A read started here shows why it failed without another click.
  const read = async () => {
    setOpen(false);
    if (!(await run())) setOpen(true);
  };

  let meta: ReactNode;
  if (reading) {
    meta = (
      <span className="app-row-state" role="status">
        {running ? `${count(running)} rows…` : "Reading…"}
      </span>
    );
  } else if (failed) {
    meta = (
      <Popover.Trigger asChild>
        <button
          type="button"
          className="app-row-button app-row-state"
          aria-label={`${label}: show why ${sourceId} wasn't read`}
        >
          {label}
        </button>
      </Popover.Trigger>
    );
  } else if (snapshot) {
    meta = `${count(rows)} ${rows === 1 ? "row" : "rows"}`;
  } else if (onRefresh) {
    meta = (
      <button
        type="button"
        className="app-row-button"
        aria-label={`Read ${sourceId} from ${connection}`}
        onClick={() => void read()}
      >
        Read
      </button>
    );
  } else {
    meta = <span className="app-row-state">Not read</span>;
  }

  let action: ReactNode;
  if (reading) {
    action = watched && <CancelRead sourceId={sourceId} />;
  } else if (snapshot && !failed && onRefresh) {
    action = (
      <IconButton
        className="app-row-reveal"
        label={`Read ${sourceId} again from ${connection}`}
        onClick={() => void read()}
      >
        <RefreshCw />
      </IconButton>
    );
  }

  return (
    <li>
      <Popover.Root
        open={open && Boolean(failed)}
        onOpenChange={(next) => {
          setOpen(next);
          setRemoving(false);
        }}
      >
        <Popover.Anchor>
          <RailRow
            icon={<Database />}
            name={name}
            busy={reading}
            current={current}
            onClick={onOpen}
            tone={
              failed && !stopped
                ? "error"
                : !snapshot && !reading
                  ? "warning"
                  : undefined
            }
            details={
              <>
                <span>
                  {snapshot
                    ? `${connection} · read ${ago}`
                    : `${connection} · not read yet`}
                </span>
                {failed && <span>{failed.message}</span>}
              </>
            }
            meta={meta}
            action={action}
          />
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content
            className="app-popover"
            aria-label={`Reading ${sourceId}`}
            side="bottom"
            align="start"
            sideOffset={4}
            collisionPadding={8}
            // Focus moving on its own, as after a read, keeps it open.
            onFocusOutside={(event) => event.preventDefault()}
            // A password being typed stays until Escape or Close.
            onPointerDownOutside={(event) => {
              if (failed?.needsSecret) event.preventDefault();
            }}
            onKeyDown={(event) => {
              if (event.key !== "Escape") event.stopPropagation();
            }}
          >
            <ReadProblem
              state={state}
              onSaveSecret={onSaveSecret}
              onRetry={read}
            />
            <div className="app-popover-actions">
              {removing ? (
                <>
                  <span className="app-muted">
                    Remove {sourceId} from the project?
                  </span>
                  <button
                    type="button"
                    className="app-button app-button-sm app-button-danger"
                    onClick={() => void onRemove?.(sourceId)}
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    className="app-button app-button-sm app-button-ghost"
                    onClick={() => setRemoving(false)}
                  >
                    Keep
                  </button>
                </>
              ) : (
                <>
                  {onRefresh && !failed?.needsSecret && (
                    <button
                      type="button"
                      className="app-button app-button-sm"
                      aria-label={`Read ${sourceId} again from ${connection}`}
                      onClick={() => void read()}
                    >
                      Read again
                    </button>
                  )}
                  {canPick && (
                    <button
                      type="button"
                      className="app-button app-button-sm"
                      aria-label={`Pick columns and rows of ${sourceId} to read`}
                      onClick={() => {
                        setOpen(false);
                        onPickColumns!();
                      }}
                    >
                      Pick columns
                    </button>
                  )}
                  {canRemove && (
                    <button
                      type="button"
                      className="app-button app-button-sm app-button-ghost"
                      aria-label={`Remove ${sourceId} from the project`}
                      onClick={() => setRemoving(true)}
                    >
                      Remove
                    </button>
                  )}
                  <Popover.Close asChild>
                    <button
                      type="button"
                      className="app-button app-button-sm app-button-ghost app-popover-close"
                    >
                      Close
                    </button>
                  </Popover.Close>
                </>
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </li>
  );
}
