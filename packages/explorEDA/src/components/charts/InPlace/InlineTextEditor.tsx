import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface InlineTextEditorProps {
  /** The text the editor opens with, selected so typing replaces it. */
  initialValue: string;
  /** Shown while the field is empty, such as the field label a title inherits. */
  placeholder?: string;
  ariaLabel: string;
  /** Receives every keystroke. The chart updates as the user types. */
  onChange: (value: string) => void;
  /** Enter, Tab, or leaving the field keeps the text. */
  onCommit: () => void;
  /** Escape restores the text the editor opened with. */
  onCancel: () => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * A one-line text field drawn where the text it edits was. It grows with its
 * text and never starts a chart drag, brush, or shortcut.
 */
export function InlineTextEditor({
  initialValue,
  placeholder,
  ariaLabel,
  onChange,
  onCommit,
  onCancel,
  className,
  style,
}: InlineTextEditorProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  // Escape and Enter end the edit before blur, which must not end it twice.
  const ended = useRef(false);
  const end = (keep: boolean) => {
    if (ended.current) return;
    ended.current = true;
    if (keep) onCommit();
    else onCancel();
  };

  useEffect(() => {
    const input = inputRef.current;
    input?.focus({ preventScroll: true });
    input?.select();
  }, []);

  const size = Math.max(value.length, placeholder?.length ?? 0, 4) + 2;
  return (
    <input
      ref={inputRef}
      data-inplace-editor=""
      className={cn("eda-inplace-input", className)}
      style={{ width: `${size}ch`, ...style }}
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      spellCheck={false}
      autoComplete="off"
      onChange={(event) => {
        setValue(event.target.value);
        onChange(event.target.value);
      }}
      onKeyDown={(event) => {
        // Keep chart shortcuts, the details view, and the grid out of the edit.
        event.stopPropagation();
        if (event.key === "Enter") {
          event.preventDefault();
          end(true);
        } else if (event.key === "Escape") {
          event.preventDefault();
          end(false);
        }
      }}
      onBlur={() => end(true)}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
    />
  );
}
