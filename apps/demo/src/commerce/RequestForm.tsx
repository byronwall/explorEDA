import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { postToLicenseService } from "./api";
import { TURNSTILE_SITE_KEY } from "./config";

declare global {
  interface Window {
    turnstile?: {
      render(
        element: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void }
      ): string;
      reset(id?: string): void;
    };
  }
}

let turnstileScript: Promise<void> | undefined;

function loadTurnstile(): Promise<void> {
  turnstileScript ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile did not load"));
    document.head.appendChild(script);
  });
  return turnstileScript;
}

/** Cloudflare's bot check, when the site has a key; renders nothing otherwise. */
function useTurnstile() {
  const ref = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState<string>();
  const widget = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !ref.current) return;
    let cancelled = false;
    void loadTurnstile().then(() => {
      if (cancelled || !ref.current || !window.turnstile) return;
      widget.current = window.turnstile.render(ref.current, {
        sitekey: TURNSTILE_SITE_KEY!,
        callback: setToken,
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return {
    element: TURNSTILE_SITE_KEY ? <div ref={ref} /> : null,
    token,
    reset: () => window.turnstile?.reset(widget.current),
  };
}

export interface Field {
  name: string;
  label: string;
  type?: "email" | "text" | "number" | "checkbox" | "textarea";
  required?: boolean;
  /** Help under the field, for anything the label can't say. */
  hint?: string;
  defaultValue?: string;
}

/**
 * A small form that posts to the license service and shows a plain result.
 * The page stays put; success replaces the button with the next step.
 */
export function RequestForm({
  path,
  fields,
  submitLabel,
  success,
  extra,
}: {
  path: Parameters<typeof postToLicenseService>[0];
  fields: Field[];
  submitLabel: string;
  success: ReactNode;
  extra?: Record<string, unknown>;
}) {
  const id = useId();
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const turnstile = useTurnstile();

  if (state === "sent") {
    return (
      <p
        role="status"
        className="rounded-md border border-border bg-muted/40 p-3 text-sm"
      >
        {success}
      </p>
    );
  }

  return (
    <form
      className="grid gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const body: Record<string, unknown> = { ...extra };
        for (const field of fields) {
          body[field.name] =
            field.type === "checkbox"
              ? data.get(field.name) === "on"
              : field.type === "number"
                ? Number(data.get(field.name))
                : String(data.get(field.name) ?? "");
        }
        if (turnstile.token) body.turnstileToken = turnstile.token;
        setState("sending");
        const problem = await postToLicenseService(path, body);
        if (problem) {
          setError(problem);
          setState("idle");
          turnstile.reset();
        } else {
          setState("sent");
        }
      }}
    >
      {fields.map((field) => {
        const inputId = `${id}-${field.name}`;
        const hintId = field.hint ? `${inputId}-hint` : undefined;
        if (field.type === "checkbox") {
          return (
            <div key={field.name} className="flex items-start gap-2 text-sm">
              <input
                id={inputId}
                name={field.name}
                type="checkbox"
                required={field.required}
                aria-describedby={hintId}
                className="mt-1"
              />
              <label htmlFor={inputId}>
                {field.label}
                {field.hint && (
                  <span id={hintId} className="block text-muted-foreground">
                    {field.hint}
                  </span>
                )}
              </label>
            </div>
          );
        }
        const inputClass =
          "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
        return (
          <div key={field.name} className="grid gap-1 text-sm">
            <label htmlFor={inputId} className="font-medium">
              {field.label}
              {!field.required && (
                <span className="font-normal text-muted-foreground">
                  {" "}
                  (optional)
                </span>
              )}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={inputId}
                name={field.name}
                rows={3}
                aria-describedby={hintId}
                className={inputClass}
              />
            ) : (
              <input
                id={inputId}
                name={field.name}
                type={field.type ?? "text"}
                required={field.required}
                defaultValue={field.defaultValue}
                min={field.type === "number" ? 1 : undefined}
                aria-describedby={hintId}
                className={inputClass}
              />
            )}
            {field.hint && (
              <span id={hintId} className="text-muted-foreground">
                {field.hint}
              </span>
            )}
          </div>
        );
      })}
      {turnstile.element}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div>
        <Button type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
