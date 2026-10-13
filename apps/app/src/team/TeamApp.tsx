import { useEffect, useMemo, useState, type FormEvent } from "react";
import { App } from "../App";
import { teamProjectFiles } from "../httpFiles";
import {
  currentAccount,
  listProjects,
  signIn,
  signOut,
  type TeamAccount,
  type TeamProject,
} from "./teamApi";

type State =
  | { status: "loading" }
  | { status: "failed"; message: string }
  | { status: "signed-out" }
  | { status: "ready"; account: TeamAccount; projects: TeamProject[] };

const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/** The open project, kept in the address so a link or reload returns to it. */
function projectInAddress() {
  return new URL(window.location.href).searchParams.get("project") ?? undefined;
}

function goTo(project: string | undefined) {
  const url = new URL(window.location.href);
  if (project) {
    url.searchParams.set("project", project);
  } else {
    url.searchParams.delete("project");
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
  const [open, setOpen] = useState(projectInAddress);
  const [client] = useState(pageId);
  // One file client per open project; a new one would reload the project.
  const files = useMemo(
    () => (open ? teamProjectFiles(open, client) : undefined),
    [open, client]
  );

  const load = async () => {
    try {
      const account = await currentAccount();
      if (!account) {
        setState({ status: "signed-out" });
        return;
      }
      setState({ status: "ready", account, projects: await listProjects() });
    } catch (error) {
      setState({ status: "failed", message: message(error) });
    }
  };

  useEffect(() => {
    void load();
    const follow = () => setOpen(projectInAddress());
    window.addEventListener("popstate", follow);
    return () => window.removeEventListener("popstate", follow);
  }, []);

  const choose = (project: string | undefined) => {
    goTo(project);
    setOpen(project);
  };

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
    return <SignIn onSignedIn={() => void load()} />;
  }

  const leave = async () => {
    await signOut().catch(() => {});
    choose(undefined);
    setState({ status: "signed-out" });
  };
  const project = state.projects.find((item) => item.id === open);
  const bar = (
    <TeamBar
      account={state.account}
      onProjects={open ? () => choose(undefined) : undefined}
      onSignOut={() => void leave()}
    />
  );

  if (project && files) {
    document.title = `${project.name} · explorEDA`;
    return (
      <App
        key={project.id}
        files={files}
        readOnly={project.role === "viewer"}
        team={bar}
      />
    );
  }
  document.title = "Projects · explorEDA";
  return (
    <div className="team-page">
      {bar}
      <main className="team-main">
        {open && (
          <p className="app-notice" role="status">
            That project doesn't exist, or it isn't shared with you.
          </p>
        )}
        <ProjectList projects={state.projects} onOpen={choose} />
      </main>
    </div>
  );
}

function TeamBar({
  account,
  onProjects,
  onSignOut,
}: {
  account: TeamAccount;
  onProjects?: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="team-bar">
      {onProjects && (
        <button type="button" className="app-button" onClick={onProjects}>
          ← Projects
        </button>
      )}
      <span className="team-account">
        <span className="team-account-name">{account.name}</span>
        <span className="app-muted">{account.email}</span>
      </span>
      <button type="button" className="app-button" onClick={onSignOut}>
        Sign out
      </button>
    </div>
  );
}

function ProjectList({
  projects,
  onOpen,
}: {
  projects: TeamProject[];
  onOpen: (project: string) => void;
}) {
  return (
    <section aria-labelledby="projects-heading">
      <h1 id="projects-heading" className="team-heading">
        Projects
      </h1>
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
          No projects are shared with you yet. Ask an author to add you.
        </p>
      )}
    </section>
  );
}

function SignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      await signIn(email, password);
      onSignedIn();
    } catch (failure) {
      setError(message(failure));
      setBusy(false);
    }
  };
  document.title = "Sign in · explorEDA";
  return (
    <main className="team-auth">
      <form className="team-card" onSubmit={(event) => void submit(event)}>
        <h1>Sign in to explorEDA</h1>
        <label className="team-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="username"
            required
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="team-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && (
          <p className="team-error" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="app-button app-button-primary"
          disabled={busy}
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="app-muted">
          No account? Ask the person who runs this server to add you.
        </p>
      </form>
    </main>
  );
}
