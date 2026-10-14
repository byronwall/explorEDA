/**
 * Adds a database source without editing project text: pick a connection
 * or add one, then pick a table or write a query. The new source is read
 * at once and opens in a new analysis, as charting a data file does.
 */
import { useEffect, useMemo, useState } from "react";
import {
  sourceIdForTable,
  type ConnectionDefinition,
  type DatabaseSource,
} from "exploreda";
import { ReadProblem, useRead } from "./DatabaseSourceViews";
import type { DatabaseTable } from "./httpFiles";

export interface AddDatabaseActions {
  listTables(connectionId: string): Promise<DatabaseTable[]>;
  /** Database files already in the folder, to suggest for a SQLite path. */
  databaseFiles?(): Promise<string[]>;
  addConnection(
    connection: ConnectionDefinition,
    secret?: string
  ): Promise<void>;
  addSource(sourceId: string, database: DatabaseSource): Promise<void>;
  saveSecret?(connectionId: string, secret: string): Promise<void>;
}

const DRIVERS = [
  { id: "sqlite", label: "SQLite file" },
  { id: "postgres", label: "PostgreSQL" },
] as const;

const NEW = "";

export function AddDatabase({
  connections,
  sourceIds,
  initialConnection,
  actions,
  onClose,
}: {
  connections: ConnectionDefinition[];
  /** Source IDs the project already has, so a new one doesn't clash. */
  sourceIds: string[];
  initialConnection?: string;
  actions: AddDatabaseActions;
  onClose: () => void;
}) {
  const [connection, setConnection] = useState(
    initialConnection ?? connections[0]?.id ?? NEW
  );
  return (
    <div
      className="app-add-database"
      role="group"
      aria-label="Add from a database"
    >
      <label className="app-field">
        <span>Connection</span>
        <select
          value={connection}
          onChange={(event) => setConnection(event.target.value)}
        >
          {connections.map((item) => (
            <option key={item.id} value={item.id}>
              {item.id} ·{" "}
              {DRIVERS.find((driver) => driver.id === item.driver)?.label ??
                item.driver}
            </option>
          ))}
          <option value={NEW}>New connection…</option>
        </select>
      </label>
      {connection === NEW ? (
        <NewConnectionForm
          taken={connections.map((item) => item.id)}
          onAdd={actions.addConnection}
          databaseFiles={actions.databaseFiles}
          onCancel={
            connections.length
              ? () => setConnection(connections[0]!.id)
              : onClose
          }
        />
      ) : (
        <SourcePicker
          key={connection}
          connection={connection}
          sourceIds={sourceIds}
          actions={actions}
          onCancel={onClose}
        />
      )}
    </div>
  );
}

/** A connection's driver and settings, and its password when it has one. */
function NewConnectionForm({
  taken,
  onAdd,
  onCancel,
  databaseFiles,
}: {
  taken: string[];
  onAdd: AddDatabaseActions["addConnection"];
  onCancel: () => void;
  databaseFiles?: AddDatabaseActions["databaseFiles"];
}) {
  const [files, setFiles] = useState<string[]>([]);
  useEffect(() => {
    databaseFiles?.().then(setFiles, () => {});
    // Listed once when the form opens; the app's actions change every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [driver, setDriver] = useState<"sqlite" | "postgres">("sqlite");
  const [name, setName] = useState("");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [secret, setSecret] = useState("");
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "saving" }
    | { status: "failed"; message: string }
  >({ status: "idle" });
  const id = (name.trim() || (driver === "sqlite" ? "app" : "warehouse"))
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-");
  const clash = taken.includes(id);
  const required = driver === "sqlite" ? ["path"] : ["host", "database"];
  const ready = !clash && required.every((key) => settings[key]?.trim());
  const field = (
    key: string,
    label: string,
    placeholder: string,
    list?: string
  ) => (
    <label className="app-field">
      <span>{label}</span>
      <input
        value={settings[key] ?? ""}
        placeholder={placeholder}
        list={list}
        onChange={(event) =>
          setSettings((previous) => ({
            ...previous,
            [key]: event.target.value,
          }))
        }
      />
    </label>
  );
  return (
    <form
      className="app-form app-database-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!ready) {
          return;
        }
        setState({ status: "saving" });
        const kept = Object.fromEntries(
          Object.entries(settings)
            .map(([key, value]) => [key, value.trim()])
            .filter(([, value]) => value)
        );
        onAdd({ id, driver, settings: kept }, secret || undefined).catch(
          (error: unknown) =>
            setState({
              status: "failed",
              message: error instanceof Error ? error.message : String(error),
            })
        );
      }}
    >
      <div
        className="app-segmented"
        role="radiogroup"
        aria-label="Kind of database"
      >
        {DRIVERS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            className="app-segment"
            aria-checked={driver === item.id}
            onClick={() => setDriver(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <label className="app-field">
        <span>Name</span>
        <input
          value={name}
          placeholder={driver === "sqlite" ? "app" : "warehouse"}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      {clash && (
        <p className="app-source-error">The project already has a {id}.</p>
      )}
      {driver === "sqlite" ? (
        <>
          {field("path", "File", files[0] ?? "data/app.db", "database-files")}
          <datalist id="database-files">
            {files.map((file) => (
              <option key={file} value={file} />
            ))}
          </datalist>
        </>
      ) : (
        <>
          {field("host", "Host", "db.internal")}
          {field("port", "Port", "5432")}
          {field("database", "Database", "sales")}
          {field("user", "User", "reader")}
          <label className="app-field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="off"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
            />
          </label>
          <p className="app-muted app-secret-note">
            The project text keeps the settings above. The password is kept on
            this computer, outside the project.
          </p>
        </>
      )}
      <div className="app-form-actions">
        <button
          type="submit"
          className="app-button app-button-primary"
          disabled={!ready || state.status === "saving"}
        >
          {state.status === "saving" ? "Connecting…" : "Add connection"}
        </button>
        <button type="button" className="app-button" onClick={onCancel}>
          Cancel
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

/** Picks a table, or takes a query, and names the new source. */
function SourcePicker({
  connection,
  sourceIds,
  actions,
  onCancel,
}: {
  connection: string;
  sourceIds: string[];
  actions: AddDatabaseActions;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<"table" | "sql">("table");
  const [tables, setTables] = useState<DatabaseTable[]>();
  const [filter, setFilter] = useState("");
  const [table, setTable] = useState<string>();
  const [sql, setSql] = useState("");
  const [name, setName] = useState("");
  const load = useRead(async () => {
    setTables(await actions.listTables(connection));
  });
  const add = useRead(async () => {
    const database: DatabaseSource =
      mode === "table" ? { connection, table: table! } : { connection, sql };
    await actions.addSource(sourceId, database);
  });
  useEffect(() => {
    void load.run();
    // Each connection gets its own picker, so this runs once per connection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const suggested =
    mode === "sql"
      ? sourceIdForTable("query", sourceIds)
      : table
        ? sourceIdForTable(table, sourceIds)
        : "";
  const sourceId = name.trim()
    ? name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "-")
    : suggested;
  const clash = sourceIds.includes(sourceId);
  const ready =
    !clash && (mode === "table" ? Boolean(table) : Boolean(sql.trim()));
  const shown = useMemo(
    () =>
      (tables ?? []).filter((item) =>
        item.name.toLowerCase().includes(filter.trim().toLowerCase())
      ),
    [tables, filter]
  );

  return (
    <form
      className="app-form app-database-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (ready) {
          void add.run();
        }
      }}
    >
      <div
        className="app-segmented"
        role="radiogroup"
        aria-label="What to read"
      >
        <button
          type="button"
          role="radio"
          className="app-segment"
          aria-checked={mode === "table"}
          onClick={() => setMode("table")}
        >
          A table
        </button>
        <button
          type="button"
          role="radio"
          className="app-segment"
          aria-checked={mode === "sql"}
          onClick={() => setMode("sql")}
        >
          A query
        </button>
      </div>
      {mode === "table" ? (
        <>
          <input
            aria-label={`Find a table in ${connection}`}
            placeholder="Find a table"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
          {load.state.status === "reading" && (
            <p className="app-muted">Listing {connection}'s tables…</p>
          )}
          <ReadProblem
            state={load.state}
            onSaveSecret={actions.saveSecret}
            onRetry={load.run}
          />
          {tables && (
            <ul
              className="app-table-list"
              aria-label={`Tables in ${connection}`}
            >
              {shown.map((item) => (
                <li key={item.name}>
                  <button
                    type="button"
                    aria-pressed={table === item.name}
                    onClick={() => setTable(item.name)}
                  >
                    <span>{item.name}</span>
                    {item.kind === "view" && (
                      <span className="app-badge app-badge-warning">view</span>
                    )}
                  </button>
                </li>
              ))}
              {!shown.length && (
                <li className="app-muted">
                  {tables.length
                    ? "No table matches."
                    : `${connection} has no tables.`}
                </li>
              )}
            </ul>
          )}
        </>
      ) : (
        <label className="app-field">
          <span>SQL</span>
          <textarea
            rows={5}
            spellCheck={false}
            value={sql}
            placeholder="select id, region, total from orders where total > 0"
            onChange={(event) => setSql(event.target.value)}
          />
        </label>
      )}
      <label className="app-field">
        <span>Source name</span>
        <input
          value={name}
          placeholder={suggested || "Pick a table first"}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      {clash && (
        <p className="app-source-error">
          The project already has a {sourceId}.
        </p>
      )}
      <div className="app-form-actions">
        <button
          type="submit"
          className="app-button app-button-primary"
          disabled={!ready || add.state.status === "reading"}
        >
          {add.state.status === "reading" ? "Reading…" : "Add and read"}
        </button>
        <button type="button" className="app-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <ReadProblem
        state={add.state}
        onSaveSecret={actions.saveSecret}
        onRetry={add.run}
      />
    </form>
  );
}
