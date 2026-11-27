/**
 * The project rail: what the folder holds, one line each. Choosing a row
 * opens it; its forms open in popovers, so rows never move under the
 * pointer. Below 960 px the lists fold into a bar above the workspace.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AnalysisProject, ProjectFolder } from "exploreda";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Popover from "@radix-ui/react-popover";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  Check,
  ChevronDown,
  Ellipsis,
  FilePlus2,
  LayoutDashboard,
  Network,
  NotebookText,
  Pencil,
  RefreshCw,
  Table2,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { AddData, fetchedLabel } from "./AddData";
import { AddDatabase, type PickTarget } from "./AddDatabase";
import { unreadSources } from "./databaseSources";
import {
  DatabaseSourceItem,
  RefreshAll,
  type ReadFailure,
} from "./DatabaseSourceViews";
import type { FetchedRecord, ServerInfo, ThemePreference } from "./httpFiles";
import type { ProjectActions, Selection } from "./ProjectWorkspace";
import { FormPopover, IconButton, RailRow } from "./RailParts";
import { SourceCard } from "./SourceCard";
import type { SaveState } from "./saver";

const NARROW = "(max-width: 959px)";

function useNarrow() {
  const [narrow, setNarrow] = useState(
    () => window.matchMedia?.(NARROW).matches ?? false
  );
  useEffect(() => {
    const media = window.matchMedia?.(NARROW);
    const follow = () => setNarrow(Boolean(media?.matches));
    media?.addEventListener("change", follow);
    return () => media?.removeEventListener("change", follow);
  }, []);
  return narrow;
}

const plural = (count: number, word: string) =>
  `${count.toLocaleString()} ${word}${count === 1 ? "" : "s"}`;

export function ProjectRail({
  folder,
  project,
  info,
  team,
  readOnly,
  saveState,
  notice,
  readErrors,
  fetched,
  actions,
  theme,
  onThemeChange,
  selected,
  onSelect,
  addingDatabase,
  onAddingDatabase,
  initialConnection,
  problems,
  suggestedLinks,
  onOpenSchema,
  usedBy,
}: {
  folder: ProjectFolder;
  project: AnalysisProject;
  info: ServerInfo;
  team?: ReactNode;
  readOnly: boolean;
  saveState: SaveState;
  notice?: string;
  readErrors: Record<string, ReadFailure>;
  fetched: Record<string, FetchedRecord>;
  actions: ProjectActions;
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  selected: Selection;
  onSelect: (selection: Selection) => void;
  addingDatabase: boolean;
  onAddingDatabase: (open: boolean) => void;
  /** A connection just added, which the database popover opens on. */
  initialConnection?: string;
  problems: ProjectFolder["problems"];
  suggestedLinks: number;
  /** Opens the schema diagram; missing where the view has none. */
  onOpenSchema?: () => void;
  /** The analyses and notebooks that read each source, by source ID. */
  usedBy: Record<string, string[]>;
}) {
  const narrow = useNarrow();
  const [shown, setShown] = useState(false);
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState(false);
  // A too-large source the database popover is picking columns for.
  const [pick, setPick] = useState<PickTarget>();
  const [refreshAllError, setRefreshAllError] = useState<string>();
  // The database popover hangs from its button, so the lists show with it.
  const open = narrow && (shown || addingDatabase);
  const closeDatabase = () => {
    setPick(undefined);
    onAddingDatabase(false);
  };
  const choose = (next: Selection) => {
    setShown(false);
    onSelect(next);
  };

  const databaseIds = Object.keys(folder.databases);
  const usedFiles = new Set(Object.values(folder.paths));
  const looseFiles = folder.dataFiles.filter((path) => !usedFiles.has(path));
  const canAddDatabase = !readOnly && Boolean(actions.database);
  const canAddData = Boolean(actions.upload && actions.fetchUrl);
  const current =
    folder.analyses.find((item) => item.path === selected.path)?.result.name ??
    folder.notebooks.find((item) => item.path === selected.path)?.result
      .settings.metadata.name ??
    project.sources.find((item) => item.id === selected.source)?.name;
  const explore = (sourceId: string) => choose({ source: sourceId, index: 0 });
  // Pointing at a source shows its fields; a narrow rail has no room beside.
  const card = (sourceId: string) => {
    const rows = folder.tables[sourceId]?.length ?? 0;
    return narrow || !rows ? undefined : (
      <SourceCard
        project={project}
        tables={folder.tables}
        sourceId={sourceId}
        usedBy={usedBy[sourceId]}
      />
    );
  };

  return (
    <Tooltip.Provider delayDuration={450} skipDelayDuration={150}>
      <aside
        className="app-rail"
        aria-label="Project"
        data-open={open || undefined}
        onKeyDown={(event) => {
          // A menu or popover that Escape just closed keeps the lists open.
          if (event.key === "Escape" && !event.defaultPrevented) {
            setShown(false);
          }
        }}
      >
        {team}
        <header className="app-rail-head">
          <div className="app-rail-title">
            <button
              type="button"
              className="app-rail-toggle"
              aria-expanded={open}
              onClick={() => {
                closeDatabase();
                setShown(!open);
              }}
            >
              <span className="app-rail-current">
                {current ?? "Project files"}
              </span>
              <ChevronDown aria-hidden="true" />
            </button>
            <h1>{info.name}</h1>
            <ProjectMenu
              root={info.root}
              theme={theme}
              onThemeChange={onThemeChange}
            />
          </div>
          {readOnly ? (
            <p className="app-save app-muted">
              Viewing · your changes aren't saved
            </p>
          ) : (
            <SaveStatus state={saveState} onDisk={!team} />
          )}
        </header>

        <div className="app-rail-body">
          <nav aria-labelledby="analyses-heading">
            <SectionHead
              id="analyses-heading"
              title="Analyses"
              count={folder.analyses.length}
            >
              {!readOnly && project.queries.length > 0 && (
                <FormPopover
                  title="New analysis"
                  open={creating}
                  onOpenChange={setCreating}
                  narrow={narrow}
                  trigger={
                    <button
                      type="button"
                      className="app-button app-button-sm app-button-ghost"
                    >
                      New analysis
                    </button>
                  }
                >
                  <NewAnalysisForm
                    queries={project.queries}
                    onCancel={() => setCreating(false)}
                    onCreate={(name, queryId) =>
                      void actions.createAnalysis(name, queryId)
                    }
                  />
                </FormPopover>
              )}
            </SectionHead>
            {folder.analyses.length ? (
              <ul className="app-list">
                {folder.analyses.map((analysis) => (
                  <li key={analysis.path}>
                    <AnalysisRow
                      path={analysis.path}
                      name={analysis.result.name}
                      current={analysis.path === selected.path}
                      onSelect={() => choose({ path: analysis.path, index: 0 })}
                      actions={readOnly ? undefined : actions}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="app-muted app-empty">No analyses yet.</p>
            )}
          </nav>

          {folder.notebooks.length > 0 && (
            <nav aria-labelledby="notebooks-heading">
              <SectionHead
                id="notebooks-heading"
                title="Notebooks"
                count={folder.notebooks.length}
              />
              <ul className="app-list">
                {folder.notebooks.map((item) => (
                  <li key={item.path}>
                    <RailRow
                      icon={<NotebookText />}
                      name={item.result.settings.metadata.name || item.path}
                      details={<span>{item.path}</span>}
                      current={item.path === selected.path}
                      onClick={() => choose({ path: item.path, index: 0 })}
                    />
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <section aria-labelledby="data-heading">
            <SectionHead
              id="data-heading"
              title="Data"
              count={project.sources.length + looseFiles.length}
            >
              {databaseIds.length > 1 &&
                !readOnly &&
                actions.refreshSources && (
                  <RefreshAll
                    sourceIds={databaseIds}
                    unread={unreadSources(folder).length}
                    onRefresh={actions.refreshSources}
                    onError={setRefreshAllError}
                  />
                )}
              {canAddDatabase && (
                <FormPopover
                  title={pick ? "Pick columns" : "Add from a database"}
                  open={addingDatabase}
                  onOpenChange={(next) => {
                    setPick(undefined);
                    onAddingDatabase(next);
                  }}
                  narrow={narrow}
                  trigger={
                    <button
                      type="button"
                      className="app-button app-button-sm app-button-ghost"
                      aria-label="Add a table or query from a database"
                    >
                      Add database
                    </button>
                  }
                >
                  <AddDatabase
                    key={pick?.sourceId}
                    connections={folder.connections}
                    sourceIds={project.sources.map((source) => source.id)}
                    initialConnection={initialConnection}
                    pick={pick}
                    actions={{
                      ...actions.database!,
                      saveSecret: actions.saveSecret,
                    }}
                    onClose={closeDatabase}
                  />
                </FormPopover>
              )}
              {canAddData && (
                <FormPopover
                  title="Add data"
                  open={adding}
                  onOpenChange={setAdding}
                  narrow={narrow}
                  trigger={
                    <button
                      type="button"
                      className="app-button app-button-sm app-button-ghost"
                    >
                      Add data
                    </button>
                  }
                >
                  <AddData
                    existing={folder.dataFiles}
                    onUpload={actions.upload!}
                    onFetch={actions.fetchUrl!}
                    onDone={() => setAdding(false)}
                  />
                </FormPopover>
              )}
            </SectionHead>
            <ul className="app-list">
              {project.sources.map((source) => {
                const database = folder.databases[source.id];
                if (database) {
                  return (
                    <DatabaseSourceItem
                      key={source.id}
                      name={source.name}
                      sourceId={source.id}
                      connection={database.connection}
                      rows={folder.tables[source.id]?.length ?? 0}
                      snapshot={folder.snapshots[source.id]}
                      current={source.id === selected.source}
                      onOpen={() => explore(source.id)}
                      card={card(source.id)}
                      lastError={readErrors[source.id]}
                      onRemove={readOnly ? undefined : actions.removeSource}
                      onPickColumns={
                        canAddDatabase && database.table !== undefined
                          ? () => {
                              setPick({
                                sourceId: source.id,
                                connection: database.connection,
                                table: database.table!,
                                ...(database.limit
                                  ? { limit: database.limit }
                                  : {}),
                              });
                              onAddingDatabase(true);
                            }
                          : undefined
                      }
                      onRefresh={
                        readOnly || !actions.refreshSources
                          ? undefined
                          : (id) => actions.refreshSources!([id])
                      }
                      onSaveSecret={readOnly ? undefined : actions.saveSecret}
                    />
                  );
                }
                const missing = folder.missingSources.includes(source.id);
                const outside = folder.outsideSources.includes(source.id);
                const path = folder.paths[source.id];
                const record = path ? fetched[path] : undefined;
                const rows = folder.tables[source.id]?.length ?? 0;
                return (
                  <li key={source.id}>
                    <RailRow
                      icon={<Table2 />}
                      name={source.name}
                      tone={missing ? "error" : undefined}
                      current={source.id === selected.source}
                      onClick={missing ? undefined : () => explore(source.id)}
                      card={missing ? undefined : card(source.id)}
                      details={
                        <>
                          {path && <span>{path}</span>}
                          {outside && <span>Outside the folder</span>}
                          {record && <span>{fetchedLabel(record)}</span>}
                        </>
                      }
                      meta={
                        missing ? (
                          <span className="app-row-state">File missing</span>
                        ) : (
                          plural(rows, "row")
                        )
                      }
                      action={
                        path && record && !readOnly && actions.refetch ? (
                          <IconButton
                            className="app-row-reveal"
                            label={`Refetch ${path} from ${record.url}`}
                            onClick={() => void actions.refetch!(path)}
                          >
                            <RefreshCw />
                          </IconButton>
                        ) : undefined
                      }
                    />
                  </li>
                );
              })}
              {looseFiles.map((path) => (
                <li key={path}>
                  <RailRow
                    icon={<FilePlus2 />}
                    name={path.slice(path.lastIndexOf("/") + 1)}
                    details={
                      <>
                        <span>{path}</span>
                        <span>
                          Not charted yet
                          {fetched[path]
                            ? ` · ${fetchedLabel(fetched[path]!)}`
                            : ""}
                        </span>
                      </>
                    }
                    meta={
                      !readOnly && (
                        <button
                          type="button"
                          className="app-row-button"
                          aria-label={`Chart ${path}`}
                          onClick={() => void actions.chartFile(path)}
                        >
                          Chart
                        </button>
                      )
                    }
                  />
                </li>
              ))}
            </ul>
            {onOpenSchema && (
              <div className="app-links">
                <RailRow
                  icon={<Network />}
                  name="Tables and links"
                  details={
                    <span>
                      {project.relationships.length
                        ? `${plural(project.relationships.length, "link")} between ${project.sources.length} tables`
                        : `Relate ${project.sources.length} tables to chart their fields together`}
                    </span>
                  }
                  meta={
                    suggestedLinks ? (
                      <span className="app-suggested">
                        {suggestedLinks} to review
                      </span>
                    ) : project.relationships.length ? (
                      plural(project.relationships.length, "link")
                    ) : null
                  }
                  onClick={() => {
                    setShown(false);
                    onOpenSchema();
                  }}
                />
              </div>
            )}
          </section>

          {problems.length > 0 && <Problems problems={problems} />}
        </div>
        {open && (
          <div
            className="app-rail-backdrop"
            aria-hidden="true"
            onClick={() => setShown(false)}
          />
        )}
        {/* In a corner, so a message never pushes the rows down. */}
        <div className="app-toasts">
          {notice && (
            <p className="app-notice" role="status">
              {notice}
            </p>
          )}
          {refreshAllError && (
            <div className="app-notice app-notice-error" role="alert">
              <span>{refreshAllError}</span>
              <IconButton
                label="Dismiss"
                onClick={() => setRefreshAllError(undefined)}
              >
                <X />
              </IconButton>
            </div>
          )}
        </div>
      </aside>
    </Tooltip.Provider>
  );
}

function SectionHead({
  id,
  title,
  count,
  children,
}: {
  id: string;
  title: string;
  count: number;
  children?: ReactNode;
}) {
  return (
    <div className="app-section-head">
      <h2 id={id}>{title}</h2>
      {count > 1 && (
        <span className="app-section-count" aria-hidden="true">
          {count}
        </span>
      )}
      <div className="app-section-actions">{children}</div>
    </div>
  );
}

const THEMES: Array<{ id: ThemePreference; label: string }> = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

/** Where the project lives, and the settings that are rarely changed. */
function ProjectMenu({
  root,
  theme,
  onThemeChange,
}: {
  root?: string;
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <DropdownMenu.Root modal={false} onOpenChange={() => setCopied(false)}>
      <DropdownMenu.Trigger asChild>
        <IconButton label="Project menu">
          <Ellipsis />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="app-menu"
          align="start"
          sideOffset={4}
          collisionPadding={8}
          onKeyDown={(event) => event.stopPropagation()}
        >
          {root && (
            <>
              <DropdownMenu.Label className="app-menu-path">
                {root}
              </DropdownMenu.Label>
              <DropdownMenu.Item
                className="app-menu-item"
                onSelect={(event) => {
                  // The menu stays open to show that the copy happened.
                  event.preventDefault();
                  void navigator.clipboard
                    ?.writeText(root)
                    .then(() => setCopied(true));
                }}
              >
                {copied ? "Copied" : "Copy folder path"}
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="app-menu-separator" />
            </>
          )}
          <DropdownMenu.Label className="app-menu-label">
            Appearance
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup
            value={theme}
            onValueChange={(next) => onThemeChange(next as ThemePreference)}
          >
            {THEMES.map((item) => (
              <DropdownMenu.RadioItem
                key={item.id}
                value={item.id}
                className="app-menu-item app-menu-radio"
              >
                <DropdownMenu.ItemIndicator className="app-menu-check">
                  <Check />
                </DropdownMenu.ItemIndicator>
                {item.label}
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/**
 * An analysis, with Rename and Delete behind its menu. Renaming edits the
 * name where it is; deleting asks beside the row. Neither moves a row.
 */
function AnalysisRow({
  path,
  name,
  current,
  onSelect,
  actions,
}: {
  path: string;
  name: string;
  current: boolean;
  onSelect: () => void;
  /** Absent when viewing only. */
  actions?: ProjectActions;
}) {
  const [mode, setMode] = useState<"idle" | "rename" | "delete">("idle");
  const [draft, setDraft] = useState(name);
  // The menu's choice, so closing it leaves focus for what opens next.
  const next = useRef(false);

  if (mode === "rename") {
    return (
      <form
        className="app-row app-row-rename"
        onSubmit={(event) => {
          event.preventDefault();
          if (draft.trim() && draft.trim() !== name) {
            void actions!.renameAnalysis(path, draft.trim());
          } else {
            setMode("idle");
          }
        }}
      >
        <input
          autoFocus
          aria-label={`New name for ${name}`}
          value={draft}
          onFocus={(event) => event.currentTarget.select()}
          // Select-all and Enter belong to the box, not the workspace keys.
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === "Escape") setMode("idle");
          }}
          onChange={(event) => setDraft(event.target.value)}
        />
        <IconButton type="submit" label="Save name">
          <Check />
        </IconButton>
        <IconButton label="Cancel rename" onClick={() => setMode("idle")}>
          <X />
        </IconButton>
      </form>
    );
  }

  return (
    <Popover.Root
      open={mode === "delete"}
      onOpenChange={(open) => setMode(open ? "delete" : "idle")}
    >
      <Popover.Anchor>
        <RailRow
          icon={<LayoutDashboard />}
          name={name}
          details={<span>{path}</span>}
          current={current}
          onClick={onSelect}
          action={
            actions && (
              <DropdownMenu.Root modal={false}>
                <DropdownMenu.Trigger asChild>
                  <IconButton
                    className="app-row-reveal"
                    label={`Rename or delete ${name}`}
                  >
                    <Ellipsis />
                  </IconButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="app-menu"
                    align="start"
                    sideOffset={4}
                    collisionPadding={8}
                    onKeyDown={(event) => event.stopPropagation()}
                    onCloseAutoFocus={(event) => {
                      if (next.current) event.preventDefault();
                      next.current = false;
                    }}
                  >
                    <DropdownMenu.Item
                      className="app-menu-item"
                      onSelect={() => {
                        next.current = true;
                        setDraft(name);
                        setMode("rename");
                      }}
                    >
                      <Pencil /> Rename
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="app-menu-item app-menu-danger"
                      onSelect={() => {
                        next.current = true;
                        setMode("delete");
                      }}
                    >
                      <Trash2 /> Delete…
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )
          }
        />
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          className="app-popover app-confirm"
          aria-label={`Delete ${name}`}
          align="start"
          sideOffset={4}
          collisionPadding={8}
          onKeyDown={(event) => {
            if (event.key !== "Escape") event.stopPropagation();
          }}
        >
          <p>
            Delete <strong>{path}</strong>?
          </p>
          <div className="app-confirm-actions">
            <button
              type="button"
              className="app-button app-button-ghost"
              onClick={() => setMode("idle")}
            >
              Keep
            </button>
            <button
              type="button"
              className="app-button app-button-danger"
              onClick={() => void actions!.deleteAnalysis(path)}
            >
              Delete
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function SaveStatus({
  state,
  onDisk,
}: {
  state: SaveState;
  /** A folder the person can see; a team server keeps files out of sight. */
  onDisk: boolean;
}) {
  if (state.status === "failed") {
    return (
      <p className="app-save app-save-failed" role="alert">
        Couldn't save {state.path}: {state.message}
      </p>
    );
  }
  return (
    <p className="app-save app-muted" aria-live="polite">
      {state.status === "saving"
        ? "Saving…"
        : onDisk
          ? "Saved to the folder"
          : "Saved"}
    </p>
  );
}

function NewAnalysisForm({
  queries,
  onCreate,
  onCancel,
}: {
  queries: AnalysisProject["queries"];
  onCreate: (name: string, queryId: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [queryId, setQueryId] = useState(queries[0]?.id ?? "");
  return (
    <form
      className="app-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (name.trim() && queryId) {
          onCreate(name.trim(), queryId);
        }
      }}
    >
      <label className="app-field">
        <span>Name</span>
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Revenue by region"
        />
      </label>
      <label className="app-field">
        <span>Charts</span>
        <select
          value={queryId}
          onChange={(event) => setQueryId(event.target.value)}
        >
          {queries.map((query) => (
            <option key={query.id} value={query.id}>
              {query.name}
            </option>
          ))}
        </select>
      </label>
      <div className="app-form-actions">
        <button type="submit" className="app-button app-button-primary">
          Create
        </button>
        <button
          type="button"
          className="app-button app-button-ghost"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Problems({ problems }: { problems: ProjectFolder["problems"] }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button type="button" className="app-problems">
          <TriangleAlert aria-hidden="true" />
          {plural(problems.length, "problem")}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="app-popover"
          aria-label="Project problems"
          side="top"
          align="start"
          sideOffset={4}
          collisionPadding={8}
        >
          <ul className="app-problem-list">
            {problems.map((problem, index) => (
              <li key={index}>
                <span className="app-muted">
                  {problem.path}:{problem.line}
                </span>{" "}
                {problem.message}
                {problem.suggestion && (
                  <span className="app-muted"> {problem.suggestion}</span>
                )}
              </li>
            ))}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
