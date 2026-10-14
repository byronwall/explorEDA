import { useEffect, useState, type FormEvent } from "react";
import {
  createAccount,
  listAccounts,
  newPasswordLink,
  passwordLinkUrl,
  updateAccount,
  type TeamAccount,
} from "./teamApi";

const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/** A set-password link to hand to someone, with a copy button. */
export function LinkToSend({ name, secret }: { name: string; secret: string }) {
  const url = passwordLinkUrl(secret);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="team-link" role="status">
      <p>
        Send this link to {name}. It sets their password, works once, and
        expires in 7 days.
      </p>
      <div className="team-link-row">
        <input
          readOnly
          value={url}
          aria-label={`Password link for ${name}`}
          onFocus={(event) => event.currentTarget.select()}
        />
        <button
          type="button"
          className="app-button"
          onClick={() => void copy()}
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

function AddPerson({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [kind, setKind] = useState<"author" | "viewer">("viewer");
  const [admin, setAdmin] = useState(false);
  const [error, setError] = useState<string>();
  const [link, setLink] = useState<{ name: string; secret: string }>();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    try {
      const created = await createAccount({ name, email, kind, admin });
      setLink({ name: created.account.name, secret: created.secret });
      setName("");
      setEmail("");
      setAdmin(false);
      onAdded();
    } catch (failure) {
      setError(message(failure));
    }
  };
  return (
    <section className="team-panel" aria-labelledby="add-person-heading">
      <h2 id="add-person-heading">Add a person</h2>
      <form className="team-add" onSubmit={(event) => void submit(event)}>
        <label className="team-field">
          <span>Name</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="team-field">
          <span>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="team-field">
          <span>Account</span>
          <select
            value={kind}
            onChange={(event) =>
              setKind(event.target.value as "author" | "viewer")
            }
          >
            <option value="viewer">Viewer: views projects</option>
            <option value="author">Author: creates and edits projects</option>
          </select>
        </label>
        <label className="team-check">
          <input
            type="checkbox"
            checked={admin}
            onChange={(event) => setAdmin(event.target.checked)}
          />
          <span>Admin: adds people and opens every project</span>
        </label>
        <button type="submit" className="app-button app-button-primary">
          Add person
        </button>
      </form>
      {error && (
        <p className="team-error" role="alert">
          {error}
        </p>
      )}
      {link && <LinkToSend name={link.name} secret={link.secret} />}
    </section>
  );
}

function PersonRow({
  account,
  self,
  onChanged,
}: {
  account: TeamAccount;
  self: boolean;
  onChanged: (error?: string) => void;
}) {
  const [link, setLink] = useState<string>();
  const change = async (
    update: Parameters<typeof updateAccount>[1]
  ): Promise<void> => {
    try {
      await updateAccount(account.id, update);
      onChanged();
    } catch (failure) {
      onChanged(message(failure));
    }
  };
  return (
    <li className="team-person" data-disabled={account.disabled || undefined}>
      <div className="team-person-who">
        <span className="team-person-name">
          {account.name}
          {self && <span className="app-muted"> (you)</span>}
        </span>
        <span className="app-muted team-email">{account.email}</span>
      </div>
      <div className="team-person-tags">
        {account.admin && <span className="app-badge team-badge">Admin</span>}
        {account.disabled && (
          <span className="app-badge app-badge-error">Disabled</span>
        )}
      </div>
      <div className="team-person-actions">
        <select
          aria-label={`Account type for ${account.name}`}
          value={account.kind}
          onChange={(event) =>
            void change({ kind: event.target.value as "author" | "viewer" })
          }
        >
          <option value="author">Author</option>
          <option value="viewer">Viewer</option>
        </select>
        <button
          type="button"
          className="app-button"
          onClick={() => void change({ admin: !account.admin })}
        >
          {account.admin ? "Remove admin" : "Make admin"}
        </button>
        <button
          type="button"
          className="app-button"
          onClick={() =>
            void newPasswordLink(account.id).then(
              ({ secret }) => setLink(secret),
              (failure: unknown) => onChanged(message(failure))
            )
          }
        >
          Password link
        </button>
        <button
          type="button"
          className={`app-button${account.disabled ? "" : " app-button-danger"}`}
          disabled={self && !account.disabled}
          onClick={() => void change({ disabled: !account.disabled })}
        >
          {account.disabled ? "Enable" : "Disable"}
        </button>
      </div>
      {link && <LinkToSend name={account.name} secret={link} />}
    </li>
  );
}

/** Admins add people, hand out password links, and turn accounts off. */
export function People({ self }: { self: TeamAccount }) {
  const [accounts, setAccounts] = useState<TeamAccount[]>();
  const [error, setError] = useState<string>();
  const load = () =>
    listAccounts().then(setAccounts, (failure: unknown) =>
      setError(message(failure))
    );
  useEffect(() => {
    void load();
  }, []);
  return (
    <div className="team-stack">
      <h1 className="team-heading">People</h1>
      <p className="app-muted team-lede">
        Authors create projects and edit the ones they're in. Viewers open the
        projects they're added to and explore them, but nothing they change is
        saved.
      </p>
      <AddPerson onAdded={() => void load()} />
      {error && (
        <p className="team-error" role="alert">
          {error}
        </p>
      )}
      <section aria-labelledby="accounts-heading">
        <h2 id="accounts-heading" className="team-subheading">
          Accounts
        </h2>
        {accounts ? (
          <ul className="team-people">
            {accounts.map((account) => (
              <PersonRow
                key={account.id}
                account={account}
                self={account.id === self.id}
                onChanged={(problem) => {
                  setError(problem);
                  void load();
                }}
              />
            ))}
          </ul>
        ) : (
          <p className="app-muted">Loading…</p>
        )}
      </section>
    </div>
  );
}
