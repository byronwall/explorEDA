import { useEffect, useMemo, useState, type FormEvent } from "react";
import { App } from "../App";
import { teamProjectFiles } from "../httpFiles";
import { PasswordLinkPage, SetUp, SignIn } from "./AuthPages";
import { Members } from "./Members";
import { People } from "./People";
import {
  createProject,
  currentAccount,
  listProjects,
  setupNeeded,
  signOut,
  type TeamAccount,
  type TeamProject,
} from "./teamApi";

type State =
  | { status: "loading" }
  | { status: "failed"; message: string }
  | { status: "signed-out"; setup: boolean }
  | { status: "ready"; account: TeamAccount; projects: TeamProject[] };

const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/** Where the page is: a project, the people page, or the project list. */
interface Place {
  project?: string;
  page?: "people";
  link?: string;
}

function placeInAddress(): Place {
  const params = new URL(window.location.href).searchParams;
  return {
    project: params.get("project") ?? undefined,
    page: params.get("page") === "people" ? "people" : undefined,
    link: params.get("link") ?? undefined,
  };
}

function goTo(place: Place) {
  const url = new URL(window.location.href);
  url.search = "";
  if (place.project) {
    url.searchParams.set("project", place.project);
  } else if (place.page) {
    url.searchParams.set("page", place.page);
  }
  window.history.pushState(null, "", url.pathname + url.search);
}

/** Names this page to the server, so its own saves aren't echoed back. */
const pageId = () =>
  globalThis.crypto?.randomUUID?.() ??
  Math.random().toString(36).slice(2) + Date.now().toString(36);

/** explorEDA on a team server: sign in, pick a project, open it. */
export function TeamApp() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [place, setPlace] = useState(placeInAddress);
  const [client] = useState(pageId);
  // One file client per open project; a new one would reload the project.
  const files = useMemo(
    () => (place.project ? teamProjectFiles(place.project, client) : undefined),
    [place.project, client]
  );

  const load = async () => {
    try {
      const account = await currentAccount();
      if (!account) {
        setState({ status: "signed-out", setup: await setupNeeded() });
        return;
      }
      setState({ status: "ready", account, projects: await listProjects() });
    } catch (error) {
      setState({ status: "failed", message: message(error) });
    }
  };

  useEffect(() => {
    if (!place.link) {
      void load();
    }
    const follow = () => setPlace(placeInAddress());
    window.addEventListener("popstate", follow);
    return () => window.removeEventListener("popstate", follow);
    // Loading once is enough; later changes call load themselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (next: Place) => {
    goTo(next);
    setPlace(next);
  };

  if (place.link) {
    return (
      <PasswordLinkPage
        secret={place.link}
        onDone={() => {
          go({});
          void load();
        }}
      />
    );
  }
  if (state.status === "loading") {
    return (
      <main className="app-message" aria-busy="true">
        <p>Loading…</p>
      </main>
    );
  }
  if (state.status === "failed") {
    return (
      <main className="app-message">
        <h1>The server didn't answer</h1>
        <p role="alert">{state.message}</p>
        <p>Reload this page to try again.</p>
      </main>
    );
  }
  if (state.status === "signed-out") {
    return state.setup ? (
      <SetUp onDone={() => void load()} />
    ) : (
      <SignIn onSignedIn={() => void load()} />
    );
  }

  const { account, projects } = state;
  const leave = async () => {
    await signOut().catch(() => {});
    go({});
    setState({ status: "signed-out", setup: false });
  };
  const project = projects.find((item) => item.id === place.project);

  if (project && files) {
    document.title = `${project.name} · explorEDA`;
    return (
      <App
        key={project.id}
        files={files}
        readOnly={project.role === "viewer"}
        team={
          <div className="team-bar">
            <span className="team-account">
              <span className="team-account-name">{account.name}</span>
              <span className="app-muted">{account.email}</span>
            </span>
            <button type="button" className="app-button" onClick={() => go({})}>
              ← Projects
            </button>
            <Members
              key={project.id}
              project={project.id}
              canManage={project.role === "author"}
            />
            <button
              type="button"
              className="app-button"
              onClick={() => void leave()}
            >
              Sign out
            </button>
          </div>
        }
      />
    );
  }

  const people = place.page === "people" && account.admin;
  document.title = `${people ? "People" : "Projects"} · explorEDA`;
  return (
    <div className="team-page">
      <header className="team-bar team-top">
        <span className="team-brand">explorEDA</span>
        <nav className="team-nav" aria-label="Server">
          <button
            type="button"
            className="team-nav-item"
            aria-current={people ? undefined : "page"}
            onClick={() => go({})}
          >
            Projects
          </button>
          {account.admin && (
            <button
              type="button"
              className="team-nav-item"
              aria-current={people ? "page" : undefined}
              onClick={() => go({ page: "people" })}
            >
              People
            </button>
          )}
        </nav>
        <span className="team-account">
          <span className="team-account-name">{account.name}</span>
          <span className="app-muted">{account.email}</span>
        </span>
        <button
          type="button"
          className="app-button"
          onClick={() => void leave()}
        >
          Sign out
        </button>
      </header>
      <main className="team-main">
        {people ? (
          <People self={account} />
        ) : (
          <>
            {place.project && (
              <p className="app-notice" role="status">
                That project doesn't exist, or it isn't shared with you.
              </p>
            )}
            <ProjectList
              projects={projects}
              canCreate={account.kind === "author"}
              onOpen={(id) => go({ project: id })}
              onCreated={(created) => {
                setState({
                  ...state,
                  projects: [...projects, created].sort((a, b) =>
                    a.name.localeCompare(b.name)
                  ),
                });
                go({ project: created.id });
              }}
            />
          </>
        )}
      </main>
    </div>
  );
}

function NewProject({
  onCreated,
}: {
  onCreated: (project: TeamProject) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    try {
      onCreated(await createProject(name));
    } catch (failure) {
      setError(message(failure));
    }
  };
  if (!open) {
    return (
      <button
        type="button"
        className="app-button app-button-primary"
        onClick={() => setOpen(true)}
      >
        New project
      </button>
    );
  }
  return (
    <form className="team-new-project" onSubmit={(event) => void submit(event)}>
      <input
        aria-label="Project name"
        placeholder="Project name"
        required
        autoFocus
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <button type="submit" className="app-button app-button-primary">
        Create
      </button>
      <button
        type="button"
        className="app-button"
        onClick={() => setOpen(false)}
      >
        Cancel
      </button>
      {error && (
        <p className="team-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

function ProjectList({
  projects,
  canCreate,
  onOpen,
  onCreated,
}: {
  projects: TeamProject[];
  canCreate: boolean;
  onOpen: (project: string) => void;
  onCreated: (project: TeamProject) => void;
}) {
  return (
    <section aria-labelledby="projects-heading" className="team-stack">
      <div className="team-heading-row">
        <h1 id="projects-heading" className="team-heading">
          Projects
        </h1>
        {canCreate && <NewProject onCreated={onCreated} />}
      </div>
      {projects.length ? (
        <ul className="team-projects">
          {projects.map((project) => (
            <li key={project.id}>
              <button
                type="button"
                className="team-project"
                onClick={() => onOpen(project.id)}
              >
                <span className="team-project-name">{project.name}</span>
                <span className="app-muted">
                  {project.role === "author" ? "You can edit" : "You can view"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="app-muted">
          {canCreate
            ? "No projects yet. Create one, then add the people who should see it."
            : "No projects are shared with you yet. Ask an author to add you."}
        </p>
      )}
    </section>
  );
}
