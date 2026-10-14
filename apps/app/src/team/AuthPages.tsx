import {
  useEffect,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import {
  passwordLinkOwner,
  redeemPasswordLink,
  setUpAdmin,
  signIn,
} from "./teamApi";

const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/** The shortest password the server accepts; it checks again. */
const MIN_PASSWORD = 10;

function useSubmit(run: () => Promise<void>) {
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      await run();
    } catch (failure) {
      setError(message(failure));
      setBusy(false);
    }
  };
  return { error, busy, submit };
}

function Card({
  title,
  children,
  onSubmit,
}: {
  title: string;
  children: ReactNode;
  onSubmit?: (event: FormEvent) => void;
}) {
  document.title = `${title} · explorEDA`;
  return (
    <main className="team-auth">
      <form className="team-card" onSubmit={onSubmit}>
        <h1>{title}</h1>
        {children}
      </form>
    </main>
  );
}

function Field({
  label,
  hint,
  ...input
}: {
  label: string;
  hint?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="team-field">
      <span>{label}</span>
      <input {...input} />
      {hint && <span className="team-hint">{hint}</span>}
    </label>
  );
}

function Problem({ error }: { error?: string }) {
  return error ? (
    <p className="team-error" role="alert">
      {error}
    </p>
  ) : null;
}

export function SignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { error, busy, submit } = useSubmit(async () => {
    await signIn(email, password);
    onSignedIn();
  });
  return (
    <Card title="Sign in to explorEDA" onSubmit={(event) => void submit(event)}>
      <Field
        label="Email"
        type="email"
        autoComplete="username"
        required
        autoFocus
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Field
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Problem error={error} />
      <button
        type="submit"
        className="app-button app-button-primary"
        disabled={busy}
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <p className="app-muted">
        No account, or forgot your password? Ask an admin of this server for a
        link.
      </p>
    </Card>
  );
}

/** The first page of a new server: create the admin account. */
export function SetUp({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { error, busy, submit } = useSubmit(async () => {
    await setUpAdmin({ name, email, password });
    onDone();
  });
  return (
    <Card title="Set up explorEDA" onSubmit={(event) => void submit(event)}>
      <p className="app-muted">
        Create the first account. It's an admin: it adds people and can open
        every project.
      </p>
      <Field
        label="Your name"
        autoComplete="name"
        required
        autoFocus
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <Field
        label="Email"
        type="email"
        autoComplete="username"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Field
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD}
        hint={`At least ${MIN_PASSWORD} characters.`}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Problem error={error} />
      <button
        type="submit"
        className="app-button app-button-primary"
        disabled={busy}
      >
        {busy ? "Creating…" : "Create admin account"}
      </button>
    </Card>
  );
}

/** Opened from a set-password link an admin handed over. */
export function PasswordLinkPage({
  secret,
  onDone,
}: {
  secret: string;
  onDone: () => void;
}) {
  const [owner, setOwner] = useState<
    { email: string; name: string } | { error: string }
  >();
  const [password, setPassword] = useState("");
  useEffect(() => {
    passwordLinkOwner(secret)
      .then(setOwner)
      .catch((error: unknown) => setOwner({ error: message(error) }));
  }, [secret]);
  const { error, busy, submit } = useSubmit(async () => {
    await redeemPasswordLink(secret, password);
    onDone();
  });
  if (!owner) {
    return (
      <main className="team-auth" aria-busy="true">
        <p>Checking the link…</p>
      </main>
    );
  }
  if ("error" in owner) {
    return (
      <Card title="This link doesn't work">
        <p role="alert">{owner.error}</p>
        <a className="app-button team-link-button" href="/">
          Go to sign-in
        </a>
      </Card>
    );
  }
  return (
    <Card title="Set your password" onSubmit={(event) => void submit(event)}>
      <p className="app-muted">
        For {owner.name}, <span className="team-email">{owner.email}</span>
      </p>
      <input
        type="email"
        autoComplete="username"
        value={owner.email}
        readOnly
        hidden
      />
      <Field
        label="New password"
        type="password"
        autoComplete="new-password"
        required
        autoFocus
        minLength={MIN_PASSWORD}
        hint={`At least ${MIN_PASSWORD} characters.`}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Problem error={error} />
      <button
        type="submit"
        className="app-button app-button-primary"
        disabled={busy}
      >
        {busy ? "Saving…" : "Set password and sign in"}
      </button>
    </Card>
  );
}
