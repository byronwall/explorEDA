import { useEffect, useRef, useState } from "react";
import {
  listMembers,
  listPeople,
  removeMember,
  setMember,
  type Person,
  type ProjectMember,
} from "./teamApi";

const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/**
 * Who is in a project, in a popover beside its name. The project's
 * authors add people, change roles, and remove members; anyone in the
 * project sees the list.
 */
export function Members({
  project,
  canManage,
}: {
  project: string;
  canManage: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<ProjectMember[]>();
  const [people, setPeople] = useState<Person[]>([]);
  const [error, setError] = useState<string>();
  const [adding, setAdding] = useState("");
  const [role, setRole] = useState<"author" | "viewer">("viewer");
  const root = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      setMembers(await listMembers(project));
      if (canManage) {
        setPeople(await listPeople());
      }
    } catch (failure) {
      setError(message(failure));
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }
    void load();
    const close = (event: KeyboardEvent | PointerEvent) => {
      if (
        (event instanceof KeyboardEvent && event.key === "Escape") ||
        (event instanceof PointerEvent &&
          !root.current?.contains(event.target as Node))
      ) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", close);
    window.addEventListener("pointerdown", close);
    return () => {
      window.removeEventListener("keydown", close);
      window.removeEventListener("pointerdown", close);
    };
    // load reads only the project, which keys this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const act = async (run: () => Promise<unknown>) => {
    setError(undefined);
    try {
      await run();
      await load();
    } catch (failure) {
      setError(message(failure));
    }
  };

  const inProject = new Set(members?.map((member) => member.accountId));
  const candidates = people.filter((person) => !inProject.has(person.id));
  const chosen = candidates.find((person) => person.id === adding);

  return (
    <div className="team-members" ref={root}>
      <button
        type="button"
        className="app-button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        Members
      </button>
      {open && (
        <div
          className="team-popover"
          role="dialog"
          aria-label="Project members"
        >
          {members ? (
            <ul className="team-member-list">
              {members.map((member) => (
                <li key={member.accountId} className="team-member">
                  <span className="team-person-who">
                    <span>{member.name}</span>
                    <span className="app-muted team-email">{member.email}</span>
                  </span>
                  {canManage ? (
                    <span className="team-member-actions">
                      <select
                        aria-label={`Role for ${member.name}`}
                        value={member.role}
                        onChange={(event) =>
                          void act(() =>
                            setMember(
                              project,
                              member.accountId,
                              event.target.value as "author" | "viewer"
                            )
                          )
                        }
                      >
                        {member.kind === "author" && (
                          <option value="author">Can edit</option>
                        )}
                        <option value="viewer">Can view</option>
                      </select>
                      <button
                        type="button"
                        className="app-button"
                        aria-label={`Remove ${member.name}`}
                        onClick={() =>
                          void act(() =>
                            removeMember(project, member.accountId)
                          )
                        }
                      >
                        Remove
                      </button>
                    </span>
                  ) : (
                    <span className="app-muted">
                      {member.role === "author" ? "Can edit" : "Can view"}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="app-muted">Loading…</p>
          )}
          {canManage && (
            <form
              className="team-member-add"
              onSubmit={(event) => {
                event.preventDefault();
                if (chosen) {
                  void act(() =>
                    setMember(
                      project,
                      chosen.id,
                      chosen.kind === "viewer" ? "viewer" : role
                    )
                  ).then(() => setAdding(""));
                }
              }}
            >
              <select
                aria-label="Person to add"
                value={adding}
                onChange={(event) => setAdding(event.target.value)}
              >
                <option value="">Add a person…</option>
                {candidates.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} ({person.email})
                  </option>
                ))}
              </select>
              <select
                aria-label="Role for the new member"
                value={chosen?.kind === "viewer" ? "viewer" : role}
                disabled={chosen?.kind === "viewer"}
                onChange={(event) =>
                  setRole(event.target.value as "author" | "viewer")
                }
              >
                <option value="author">Can edit</option>
                <option value="viewer">Can view</option>
              </select>
              <button
                type="submit"
                className="app-button app-button-primary"
                disabled={!chosen}
              >
                Add
              </button>
              {chosen?.kind === "viewer" && (
                <p className="app-muted team-hint">
                  {chosen.name} has a viewer account, so they can only view.
                </p>
              )}
            </form>
          )}
          {error && (
            <p className="team-error" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
