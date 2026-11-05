/**
 * Adds database sources without editing project text: pick a connection
 * or add one, then check tables or write a query. Each new source is read
 * at once. One table opens in a new analysis, as charting a data file
 * does; several open one analysis on the table the user picks, with the
 * rest added beside it, ready to relate.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_BYTE_LIMIT,
  DEFAULT_ROW_LIMIT,
  sourceIdForTable,
  type ConnectionDefinition,
  type DatabaseSource,
} from "exploreda";
import { ReadProblem, RunningReads, useRead } from "./DatabaseSourceViews";
import type { DatabaseTable, TableColumn } from "./httpFiles";
import {
  LONG_SQL,
  WIDE_TABLE,
  likelyTooLarge,
  pickSql,
  sqlFileFor,
} from "./pickSql";

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
  /** Replaces a source with one of the same ID, and reads it. */
  replaceSource?(sourceId: string, database: DatabaseSource): Promise<void>;
  /** A table's columns, shown before it is read. */
  tableColumns?(connectionId: string, table: string): Promise<TableColumn[]>;
  saveSecret?(connectionId: string, secret: string): Promise<void>;
}

/** A source too large to read, opened in the column picker to replace it. */
export interface PickTarget {
  sourceId: string;
  connection: string;
  table: string;
  /** Its own row limit, which the new source keeps. */
  limit?: number;
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
  pick,
  actions,
  onClose,
}: {
  connections: ConnectionDefinition[];
  /** Source IDs the project already has, so a new one doesn't clash. */
  sourceIds: string[];
  /** A connection just added, which the panel opens on and confirms. */
  initialConnection?: string;
  /** A source to replace with some of its table's columns. */
  pick?: PickTarget;
  actions: AddDatabaseActions;
  onClose: () => void;
}) {
  const [connection, setConnection] = useState(
    pick?.connection ?? initialConnection ?? connections[0]?.id ?? NEW
  );
  const driver =
    connections.find((item) => item.id === connection)?.driver ?? "";
  // Opened from a source lower in the rail, the panel scrolls into view.
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (pick) {
      panel.current?.scrollIntoView?.({ block: "start" });
    }
    // Once, when the panel opens on a source to replace.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      ref={panel}
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
          driver={driver}
          pick={pick?.connection === connection ? pick : undefined}
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

/** A column that holds another table's key, such as `ss_item_sk`. */
const KEY_NAME = /(_sk|_id|_key|Id)$/;

/** A limit above a table's row count, rounded so it reads easily. */
const roomyLimit = (rows: number) =>
  Math.ceil(rows / DEFAULT_ROW_LIMIT) * DEFAULT_ROW_LIMIT;

/** Checks tables, or takes a query, and names the new sources. */
function SourcePicker({
  connection,
  driver,
  pick,
  sourceIds,
  actions,
  onCancel,
}: {
  connection: string;
  /** The connection's driver, which says how the query quotes names. */
  driver: string;
  pick?: PickTarget;
  sourceIds: string[];
  actions: AddDatabaseActions;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<"table" | "sql">("table");
  const [tables, setTables] = useState<DatabaseTable[]>();
  const [filter, setFilter] = useState("");
  const [checked, setChecked] = useState<string[]>(pick ? [pick.table] : []);
  const [expanded, setExpanded] = useState<string>();
  // The table whose columns are being picked, and what's picked so far.
  const [picking, setPicking] = useState(pick?.table);
  const [picked, setPicked] = useState<string[]>([]);
  const [where, setWhere] = useState("");
  const replacing = pick && picking === pick.table ? pick.sourceId : undefined;
  const [limits, setLimits] = useState<Record<string, number>>(
    pick?.limit ? { [pick.table]: pick.limit } : {}
  );
  const [chosenMain, setMain] = useState<string>();
  const [columns, setColumns] = useState<
    Record<string, TableColumn[] | string>
  >({});
  const loadColumns = (table: string) => {
    if (!actions.tableColumns || columns[table]) return;
    actions.tableColumns(connection, table).then(
      (list) => setColumns((previous) => ({ ...previous, [table]: list })),
      (error: unknown) =>
        setColumns((previous) => ({
          ...previous,
          [table]: error instanceof Error ? error.message : String(error),
        }))
    );
  };
  const [sql, setSql] = useState("");
  const [name, setName] = useState("");
  const load = useRead(async () => {
    setTables(await actions.listTables(connection));
  });
  const byName = new Map((tables ?? []).map((item) => [item.name, item]));
  const pickingNow = mode === "table" ? picking : undefined;
  const several = mode === "table" && !pickingNow && checked.length > 1;
  // The table one analysis row is: the user's pick, or the one that
  // reads, the table with the most keys that point at other tables, then
  // the largest. Tables over the read limit come last.
  const keyCount = (table: string) => {
    const list = columns[table];
    return Array.isArray(list)
      ? list.filter((column) => KEY_NAME.test(column.name)).length
      : 0;
  };
  const fits = (table: string) =>
    (byName.get(table)?.rows ?? 0) <= (limits[table] ?? DEFAULT_ROW_LIMIT);
  const main =
    chosenMain && checked.includes(chosenMain)
      ? chosenMain
      : [...checked].sort(
          (a, b) =>
            Number(fits(b)) - Number(fits(a)) ||
            keyCount(b) - keyCount(a) ||
            (byName.get(b)?.rows ?? 0) - (byName.get(a)?.rows ?? 0)
        )[0];
  const database = (table: string): DatabaseSource => ({
    connection,
    table,
    ...(limits[table] ? { limit: limits[table] } : {}),
  });
  const pickedSql = pickingNow
    ? pickSql(driver, pickingNow, picked, where)
    : "";
  const add = useRead(async () => {
    if (pickingNow) {
      const id = replacing ?? sourceId;
      const database: DatabaseSource = {
        connection,
        sql: pickedSql,
        ...(pickedSql.length > LONG_SQL ? { sqlFile: sqlFileFor(id) } : {}),
        ...(limits[pickingNow] ? { limit: limits[pickingNow] } : {}),
      };
      await (replacing && actions.replaceSource
        ? actions.replaceSource(replacing, database)
        : actions.addSource(id, database));
      return;
    }
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
    if (pick) {
      loadColumns(pick.table);
    }
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
  const clash = !several && !replacing && sourceIds.includes(sourceId);
  const ready =
    !clash &&
    (pickingNow
      ? picked.length > 0
      : mode === "table"
        ? checked.length > 0
        : Boolean(sql.trim()));
  const startPicking = (table: string) => {
    setChecked([table]);
    setPicking(table);
    setPicked([]);
    setWhere("");
    loadColumns(table);
  };
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
    loadColumns(table);
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
      {pickingNow ? (
        <ColumnPicker
          table={pickingNow}
          rows={byName.get(pickingNow)?.rows}
          columns={columns[pickingNow]}
          picked={picked}
          onPick={setPicked}
          where={where}
          onWhere={setWhere}
          sql={picked.length ? pickedSql : ""}
          onBack={() => setPicking(undefined)}
        />
      ) : mode === "table" ? (
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
                  table={item}
                  checked={checked.includes(item.name)}
                  expanded={expanded === item.name}
                  limit={limits[item.name]}
                  columns={
                    actions.tableColumns ? columns[item.name] : undefined
                  }
                  canExpand={Boolean(actions.tableColumns)}
                  onToggle={() => toggle(item.name)}
                  onExpand={() => {
                    loadColumns(item.name);
                    setExpanded((open) =>
                      open === item.name ? undefined : item.name
                    );
                  }}
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
                {table} has {count(rows)} rows, over the{" "}
                {count(DEFAULT_ROW_LIMIT)} a read takes.{" "}
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
                  Raise its limit to {count(roomyLimit(rows))}
                </button>{" "}
                or read part of it with A query.
              </p>
            );
          })}
          {checked.map((table) => {
            const list = columns[table];
            const rows = byName.get(table)?.rows;
            if (!Array.isArray(list)) {
              return null;
            }
            const large =
              rows !== undefined && likelyTooLarge(rows, list.length);
            if (list.length <= WIDE_TABLE && !large) {
              return null;
            }
            return (
              <p key={table} className="app-limit-note" role="status">
                {table} has {count(list.length)} columns
                {large
                  ? `, likely more than the ${Math.round(DEFAULT_BYTE_LIMIT / 1024 / 1024)} MB a read keeps across ${count(rows)} rows`
                  : ""}
                .{" "}
                <button
                  type="button"
                  className="app-button app-button-sm app-button-ghost"
                  onClick={() => startPicking(table)}
                >
                  Pick columns
                </button>{" "}
                to read only the ones you need.
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
            added beside it, ready to relate. To compare tables of the same
            shape, such as web and catalog sales, stack them later with Append
            rows from another table.
          </p>
        </>
      ) : replacing ? (
        <p className="app-muted app-add-note">
          Replaces {replacing}, which reads every column of {pickingNow}.
        </p>
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
              : replacing
                ? `Replace ${replacing} and read`
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
      {add.state.status === "reading" && <RunningReads />}
      <ReadProblem
        state={add.state}
        onSaveSecret={actions.saveSecret}
        onRetry={add.run}
      />
    </form>
  );
}

/**
 * Some of a wide table's columns, and which rows: written as a query, so
 * a table too large to read whole can still be charted.
 */
function ColumnPicker({
  table,
  rows,
  columns,
  picked,
  onPick,
  where,
  onWhere,
  sql,
  onBack,
}: {
  table: string;
  rows?: number;
  /** Its columns once listed, or why they couldn't be. */
  columns?: TableColumn[] | string;
  picked: string[];
  onPick: (picked: string[]) => void;
  where: string;
  onWhere: (where: string) => void;
  /** The query the picks make, once a column is picked. */
  sql: string;
  onBack: () => void;
}) {
  const [filter, setFilter] = useState("");
  const list = Array.isArray(columns) ? columns : [];
  const needle = filter.trim().toLowerCase();
  const shown = needle
    ? list.filter((column) => column.name.toLowerCase().includes(needle))
    : list;
  const chosen = new Set(picked);
  // Picks stay in the table's column order, so the query reads like it.
  const pick = (names: Set<string>) =>
    onPick(list.map((column) => column.name).filter((name) => names.has(name)));
  return (
    <div
      className="app-column-picker"
      role="group"
      aria-label={`Columns of ${table}`}
    >
      <div className="app-picker-head">
        <button
          type="button"
          className="app-button app-button-sm app-button-ghost"
          onClick={onBack}
        >
          ‹ Tables
        </button>
        <span className="app-picker-title">{table}</span>
        <span className="app-muted app-picker-count">
          {count(picked.length)} of {count(list.length)} columns
          {rows === undefined ? "" : ` · ${count(rows)} rows`}
        </span>
      </div>
      {typeof columns === "string" ? (
        <p className="app-source-error">{columns}</p>
      ) : !columns ? (
        <p className="app-muted">Listing columns…</p>
      ) : (
        <>
          <div className="app-picker-find">
            <input
              aria-label={`Find a column in ${table}`}
              placeholder="Find a column"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
            <button
              type="button"
              className="app-button app-button-sm app-button-ghost"
              disabled={shown.every((column) => chosen.has(column.name))}
              onClick={() =>
                pick(
                  new Set([...picked, ...shown.map((column) => column.name)])
                )
              }
            >
              {needle ? `Select ${count(shown.length)} shown` : "Select all"}
            </button>
            <button
              type="button"
              className="app-button app-button-sm app-button-ghost"
              disabled={!picked.length}
              onClick={() => onPick([])}
            >
              Clear
            </button>
          </div>
          <ul
            className="app-table-list app-column-list"
            aria-label={`${table} columns to read`}
          >
            {shown.map((column) => (
              <li
                key={column.name}
                className="app-table-item"
                data-checked={chosen.has(column.name) || undefined}
              >
                <label className="app-table-pick">
                  <input
                    type="checkbox"
                    checked={chosen.has(column.name)}
                    aria-label={`${column.name}, ${column.type}`}
                    onChange={() => {
                      const next = new Set(picked);
                      if (!next.delete(column.name)) {
                        next.add(column.name);
                      }
                      pick(next);
                    }}
                  />
                  <span className="app-table-name">{column.name}</span>
                  <span className="app-table-rows">{column.type}</span>
                </label>
              </li>
            ))}
            {!shown.length && <li className="app-muted">No column matches.</li>}
          </ul>
        </>
      )}
      <label className="app-field">
        <span>Only rows where (optional)</span>
        <input
          value={where}
          spellCheck={false}
          placeholder={`${picked[0] ?? list[0]?.name ?? "id"} > 0`}
          onChange={(event) => onWhere(event.target.value)}
        />
      </label>
      {sql && (
        <p className="app-muted app-pick-sql">
          Reads <code>{sql}</code>
        </p>
      )}
    </div>
  );
}

/** One table to check, with its size, and its columns when expanded. */
function TableItem({
  table,
  checked,
  expanded,
  limit = DEFAULT_ROW_LIMIT,
  columns,
  canExpand,
  onToggle,
  onExpand,
}: {
  table: DatabaseTable;
  checked: boolean;
  expanded: boolean;
  limit?: number;
  /** Its columns once listed, or why they couldn't be. */
  columns?: TableColumn[] | string;
  canExpand: boolean;
  onToggle: () => void;
  onExpand: () => void;
}) {
  const failed = typeof columns === "string" ? columns : undefined;
  const list = Array.isArray(columns) ? columns : undefined;
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
        <span className="app-table-text">
          <span className="app-table-name">{table.name}</span>
          {(table.rows !== undefined || table.kind === "view") && (
            <span className="app-table-rows" data-over={over || undefined}>
              {[
                table.kind === "view" ? "view" : "",
                table.rows === undefined ? "" : `${count(table.rows)} rows`,
                over ? `over the ${count(limit)} limit` : "",
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          )}
        </span>
      </label>
      {canExpand && (
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
      {expanded && canExpand && (
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
