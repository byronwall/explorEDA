import { useEffect, useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";

/** Text that applies on Enter or when focus leaves; Escape restores it. */
export function CommitInput({
  value,
  label,
  placeholder,
  disabled,
  multiline,
  onCommit,
}: {
  value: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  /** Wrap long text, such as an expression. Enter still applies it. */
  multiline?: boolean;
  onCommit: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const commit = () => {
    if (draft !== value) onCommit(draft);
  };
  const props = {
    "aria-label": label,
    value: draft,
    placeholder,
    disabled,
    "data-inplace-editor": "",
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setDraft(event.target.value),
    onBlur: commit,
    onKeyDown: (
      event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        commit();
      } else if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setDraft(value);
        // Leave the field but stay in the details, so a second Escape
        // clears the selection rather than closing the drawer.
        event.currentTarget
          .closest<HTMLElement>(".eda-schema-inspector")
          ?.focus({ preventScroll: true });
      }
    },
  };
  return multiline ? (
    <textarea {...props} rows={3} className="eda-schema-inspector-textarea" />
  ) : (
    <Input {...props} />
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="eda-schema-inspector-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
