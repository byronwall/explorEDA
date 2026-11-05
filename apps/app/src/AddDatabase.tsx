/**
 * Adds database sources without editing project text: pick a connection
 * or add one, then check tables or write a query. Each new source is read
 * at once. One table opens in a new analysis, as charting a data file
 * does; several open one analysis on the table the user picks, with the
 * rest added beside it, ready to relate.
 */
import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_ROW_LIMIT,
  sourceIdForTable,
  type ConnectionDefinition,
  type DatabaseSource,
} from "exploreda";
import { ReadProblem, useRead } from "./DatabaseSourceViews";
import type { DatabaseTable, TableColumn } from "./httpFiles";

export interface AddDatabaseActions {
  listTables(connectionId: string): Promise<DatabaseTable[]>;
  /** Database files already in the folder, to suggest for a SQLite path. */
  databaseFiles?(): Promise<string[]>;
  addConnection(
    connection: ConnectionDefinition,
    secret?: string
  ): Promise<void>;
  addSource(sourceId: string, database: DatabaseSource): Promise<void>;
  /** Adds several sources and opens an analysis of `main` only. */
  addSources?(
    sources: { sourceId: string; database: DatabaseSource }[],
    main: string
  ): Promise<void>;
  /** A table's columns, shown before it is read. */
  tableColumns?(connectionId: string, table: string): Promise<TableColumn[]>;
  saveSecret?(connectionId: string, secret: string): Promise<void>;
}

const DRIVERS = [
  { id: "sqlite", label: "SQLite file", port: "" },
  { id: "postgres", label: "PostgreSQL", port: "5432" },
  { id: "mysql", label: "MySQL", port: "3306" },
  { id: "sqlserver", label: "SQL Server", port: "1433" },
  { id: "duckdb", label: "DuckDB file", port: "" },
] as const;

type DriverId = (typeof DRIVERS)[number]["id"];

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
  /** A connection just added, which the panel opens on and confirms. */
  initialConnection?: string;
  actions: AddDatabaseActions;
  onClose: () => void;
}) {
  const [connection, setConnection] = useState(
    initialConnection ?? connections[0]?.id ?? NEW
  );
  return (
    <div
      className="app-panel app-add-database"
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
      {initialConnection && connection === initialConnection && (
        <p className="app-muted app-added" role="status">
          Added the {connection} connection. Check tables or write a query.
        </p>
      )}
      {connection === NEW ? (
        <NewConnectionForm
          taken={connections.map((item) => item.id)}
          onAdd={actions.addConnection}
          canEnterSecret={Boolean(actions.saveSecret)}
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
  canEnterSecret,
}: {
  canEnterSecret: boolean;
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
  const [driver, setDriver] = useState<DriverId>("sqlite");
  const [name, setName] = useState("");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [secret, setSecret] = useState("");
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "saving" }
    | { status: "failed"; message: string }
  >({ status: "idle" });
  const isFile = driver === "sqlite" || driver === "duckdb";
  const id = (name.trim() || (isFile ? "app" : "warehouse"))
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-");
  const clash = taken.includes(id);
  const required = isFile ? ["path"] : ["host", "database"];
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
      <label className="app-field">
        <span>Kind</span>
        <select
          value={driver}
          onChange={(event) => setDriver(event.target.value as DriverId)}
        >
          {DRIVERS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="app-field">
        <span>Name</span>
        <input
          value={name}
          placeholder={isFile ? "app" : "warehouse"}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      {clash && (
        <p className="app-source-error">
          The project already has a connection named {id}.
        </p>
      )}
      {isFile ? (
        <>
          {field(
            "path",
            "File",
            files[0] ??
              (driver === "duckdb" ? "data/lake.duckdb" : "data/app.db"),
            "database-files"
          )}
          <datalist id="database-files">
            {files.map((file) => (
              <option key={file} value={file} />
            ))}
          </datalist>
        </>
      ) : (
        <>
          {field("host", "Host", "db.internal")}
          {field(
            "port",
            "Port",
            DRIVERS.find((item) => item.id === driver)!.port
          )}
          {field("database", "Database", "sales")}
          {field("user", "User", "reader")}
          {canEnterSecret ? (
            <>
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
                The project text keeps the settings above. The password is kept
                on this server, outside the project.
              </p>
            </>
          ) : (
            <p className="app-muted app-secret-note">
              An admin enters the password, once, for everyone on this server.
            </p>
          )}
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
        <button
          type="button"
          className="app-button app-button-ghost"
          onClick={onCancel}
        >
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

const count = (value: number) => value.toLocaleString("en-US");

/** A limit above a table's row count, rounded so it reads easily. */
const roomyLimit = (rows: number) =>
  Math.ceil(rows / DEFAULT_ROW_LIMIT) * DEFAULT_ROW_LIMIT;

/** Checks tables, or takes a query, and names the new sources. */
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
  const [checked, setChecked] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string>();
  const [limits, setLimits] = useState<Record<string, number>>({});
  const [chosenMain, setMain] = useState<string>();
  const [sql, setSql] = useState("");
  const [name, setName] = useState("");
  const load = useRead(async () => {
    setTables(await actions.listTables(connection));
  });
  const byName = new Map((tables ?? []).map((item) => [item.name, item]));
  const several = mode === "table" && checked.length > 1;
  // The table one analysis row is: the user's pick, or the largest.
  const main =
    chosenMain && checked.includes(chosenMain)
      ? chosenMain
      : [...checked].sort(
          (a, b) => (byName.get(b)?.rows ?? 0) - (byName.get(a)?.rows ?? 0)
        )[0];
  const database = (table: string): DatabaseSource => ({
    connection,
    table,
    ...(limits[table] ? { limit: limits[table] } : {}),
  });
  const add = useRead(async () => {
    if (several) {
      const taken = [...sourceIds];
      const sources = checked.map((table) => {
        const sourceId = sourceIdForTable(table, taken);
        taken.push(sourceId);
        return { sourceId, database: database(table) };
      });
      await actions.addSources!(
        sources,
        sources[checked.indexOf(main!)]!.sourceId
      );
      return;
    }
    await actions.addSource(
      sourceId,
      mode === "table" ? database(checked[0]!) : { connection, sql }
    );
  });
  useEffect(() => {
    void load.run();
    // Each connection gets its own picker, so this runs once per connection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const suggested =
    mode === "sql"
      ? sourceIdForTable("query", sourceIds)
      : checked[0]
        ? sourceIdForTable(checked[0], sourceIds)
        : "";
  const sourceId = name.trim()
    ? name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "-")
    : suggested;
  const clash = !several && sourceIds.includes(sourceId);
  const ready =
    !clash && (mode === "table" ? checked.length > 0 : Boolean(sql.trim()));
  const shown = useMemo(
    () =>
      (tables ?? []).filter((item) =>
        item.name.toLowerCase().includes(filter.trim().toLowerCase())
      ),
    [tables, filter]
  );
  const toggle = (table: string) => {
    setChecked((previous) =>
      previous.includes(table)
        ? previous.filter((item) => item !== table)
        : [...previous, table]
    );
    setExpanded(table);
  };
  const overLimit = checked.filter(
    (table) =>
      (byName.get(table)?.rows ?? 0) > (limits[table] ?? DEFAULT_ROW_LIMIT)
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
          Tables
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
                <TableItem
                  key={item.name}
                  connection={connection}
                  table={item}
                  checked={checked.includes(item.name)}
                  expanded={expanded === item.name}
                  limit={limits[item.name]}
                  columns={actions.tableColumns}
                  onToggle={() => toggle(item.name)}
                  onExpand={() =>
                    setExpanded((open) =>
                      open === item.name ? undefined : item.name
                    )
                  }
                />
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
          {overLimit.map((table) => {
            const rows = byName.get(table)!.rows!;
            return (
              <p key={table} className="app-limit-note" role="status">
                {table} has {count(rows)} rows, more than the{" "}
                {count(DEFAULT_ROW_LIMIT)} a read keeps.{" "}
                <button
                  type="button"
                  className="app-button app-button-sm app-button-ghost"
                  onClick={() =>
                    setLimits((previous) => ({
                      ...previous,
                      [table]: roomyLimit(rows),
                    }))
                  }
                >
                  Read up to {count(roomyLimit(rows))} rows (limit=
                  {roomyLimit(rows)})
                </button>{" "}
                or read part of it with A query.
              </p>
            );
          })}
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
      {several ? (
        <>
          <label className="app-field">
            <span>Which table is one row of your analysis?</span>
            <select
              value={main}
              onChange={(event) => setMain(event.target.value)}
            >
              {checked.map((table) => (
                <option key={table} value={table}>
                  {table}
                  {byName.get(table)?.rows !== undefined
                    ? ` · ${count(byName.get(table)!.rows!)} rows`
                    : ""}
                </option>
              ))}
            </select>
          </label>
          <p className="app-muted app-add-note">
            Opens one analysis of {main}. The other{" "}
            {checked.length === 2
              ? "table is"
              : `${checked.length - 1} tables are`}{" "}
            added beside it, ready to relate.
          </p>
        </>
      ) : (
        <label className="app-field">
          <span>Source name</span>
          <input
            value={name}
            placeholder={suggested || "Check a table first"}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
      )}
      {clash && (
        <p className="app-source-error">
          The project already has a source named {sourceId}.
        </p>
      )}
      <div className="app-form-actions">
        <button
          type="submit"
          className="app-button app-button-primary"
          disabled={!ready || add.state.status === "reading"}
        >
          {add.state.status === "reading"
            ? "Reading…"
            : several
              ? `Add ${checked.length} tables and read`
              : "Add and read"}
        </button>
        <button
          type="button"
          className="app-button app-button-ghost"
          onClick={onCancel}
        >
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

/** One table to check, with its size, and its columns when expanded. */
function TableItem({
  connection,
  table,
  checked,
  expanded,
  limit = DEFAULT_ROW_LIMIT,
  columns,
  onToggle,
  onExpand,
}: {
  connection: string;
  table: DatabaseTable;
  checked: boolean;
  expanded: boolean;
  limit?: number;
  columns?: AddDatabaseActions["tableColumns"];
  onToggle: () => void;
  onExpand: () => void;
}) {
  const [list, setList] = useState<TableColumn[]>();
  const [failed, setFailed] = useState<string>();
  useEffect(() => {
    if (!expanded || list || !columns) return;
    columns(connection, table.name).then(setList, (error: unknown) =>
      setFailed(error instanceof Error ? error.message : String(error))
    );
  }, [expanded, list, columns, connection, table.name]);
  const over = table.rows !== undefined && table.rows > limit;
  return (
    <li className="app-table-item" data-checked={checked || undefined}>
      <label className="app-table-pick">
        <input
          type="checkbox"
          checked={checked}
          aria-label={`${table.name}, ${table.kind}${table.rows === undefined ? "" : `, ${count(table.rows)} rows`}${over ? ", over the read limit" : ""}`}
          onChange={onToggle}
        />
        <span className="app-table-name">{table.name}</span>
        {table.kind === "view" && (
          <span className="app-badge app-badge-warning">view</span>
        )}
        {table.rows !== undefined && (
          <span className="app-table-rows" data-over={over || undefined}>
            {count(table.rows)} rows{over ? " · over limit" : ""}
          </span>
        )}
      </label>
      {columns && (
        <button
          type="button"
          className="app-table-expand"
          aria-expanded={expanded}
          aria-label={`Columns of ${table.name}`}
          onClick={onExpand}
        >
          <span aria-hidden="true">{expanded ? "▾" : "▸"}</span>
        </button>
      )}
      {expanded && columns && (
        <div className="app-table-columns">
          {failed ? (
            <p className="app-source-error">{failed}</p>
          ) : list ? (
            <ul aria-label={`${table.name} columns`}>
              {list.map((column) => (
                <li key={column.name}>
                  <span>{column.name}</span>
                  <span className="app-muted">{column.type}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="app-muted">Listing columns…</p>
          )}
        </div>
      )}
    </li>
  );
}
