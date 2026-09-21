/*
 * THESIS: edit a formula beside its inputs, result, and dependency chain.
 * OWN-WORLD: inherit the workspace's neutral surfaces, blue actions, and compact controls.
 * STORY: inspect a value, change one step, compare results, then apply deliberately.
 * FIRST VIEWPORT: formula and row preview on the left; chain or insertion library on the right.
 * FORM: a focused extension of the existing calculation editor; no new visual identity.
 */
import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculationFunctions } from "@/lib/calculations/functions/registry";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { FieldMetadata, resolveFieldProfile } from "@/components/FieldMetadata";

export type CalculationDraft = { name: string; expression: string };
type Props = {
  draft: CalculationDraft;
  onChange: (draft: CalculationDraft) => void;
  fields: string[];
  calculatedFields: string[];
  editing: boolean;
  nameLocked: boolean;
  checking: boolean;
  canApply: boolean;
  dirty: boolean;
  status: ReactNode;
  preview: ReactNode;
  trace: ReactNode;
  impact: string;
  onApply: () => void;
  onDiscard: () => void;
  onClose: () => void;
};

export function CalculationForm({
  draft,
  onChange,
  fields,
  calculatedFields,
  editing,
  nameLocked,
  checking,
  canApply,
  dirty,
  status,
  preview,
  trace,
  impact,
  onApply,
  onDiscard,
  onClose,
}: Props) {
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const input = useRef<HTMLTextAreaElement>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(editing ? "chain" : "fields");
  const insert = (
    text: string,
    selectStart = text.length,
    selectEnd = selectStart
  ) => {
    const start = input.current?.selectionStart ?? draft.expression.length;
    const end = input.current?.selectionEnd ?? start;
    onChange({
      ...draft,
      expression:
        draft.expression.slice(0, start) + text + draft.expression.slice(end),
    });
    requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.setSelectionRange(start + selectStart, start + selectEnd);
    });
  };
  const matches = fields.filter((field) =>
    field.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <form
      className="eda-calc-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (canApply) onApply();
      }}
      onKeyDown={(event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
          event.preventDefault();
          if (canApply) onApply();
        }
      }}
    >
      <div className="eda-calc-editor-grid">
        <div className="eda-calc-main">
          <div
            className={
              nameLocked
                ? "eda-calc-name eda-calc-name-locked"
                : "eda-calc-name"
            }
          >
            <Label htmlFor="calculation-name">Field name</Label>
            <Input
              id="calculation-name"
              value={draft.name}
              readOnly={nameLocked}
              onChange={(event) =>
                onChange({ ...draft, name: event.target.value })
              }
              placeholder="e.g. Net sales"
            />
            {nameLocked && (
              <p className="eda-calc-help">
                This name is used by other calculations or views. Its formula
                can still change.
              </p>
            )}
          </div>
          <div className="eda-calc-section-heading">
            <Label htmlFor="calculation-expression">Formula</Label>
            <span>One result per source row · UTC dates</span>
          </div>
          <textarea
            ref={input}
            id="calculation-expression"
            value={draft.expression}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            placeholder={'e.g. ["Revenue"] - ["Cost"]'}
            onChange={(event) =>
              onChange({ ...draft, expression: event.target.value })
            }
            aria-describedby="calculation-syntax calculation-validation"
          />
          <div className="eda-calc-formula-tools">
            <p id="calculation-syntax" className="eda-calc-help">
              Use ["Field name"] for a field and "text" for a literal.
            </p>
            <button
              type="button"
              className="eda-calc-text-button"
              onClick={() => setTab("functions")}
            >
              Function help
            </button>
          </div>
          <div
            id="calculation-validation"
            className="eda-calc-validation"
            aria-live="polite"
            aria-busy={checking}
          >
            {status}
          </div>
          {preview}
        </div>
        <aside className="eda-calc-aside" aria-label="Calculation tools">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full">
              <TabsTrigger value="chain">Chain</TabsTrigger>
              <TabsTrigger value="fields">Fields</TabsTrigger>
              <TabsTrigger value="functions">Functions</TabsTrigger>
            </TabsList>
            <TabsContent value="chain">{trace}</TabsContent>
            <TabsContent value="fields">
              <p className="eda-calc-help mb-3">
                Insert at the cursor, or replace selected text.
              </p>
              <Input
                aria-label="Find a field"
                placeholder="Find a field…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {[true, false].map((calculated) => {
                const group = matches.filter(
                  (field) => calculatedFields.includes(field) === calculated
                );
                return (
                  group.length > 0 && (
                    <section
                      className="eda-calc-field-group"
                      key={String(calculated)}
                    >
                      <h3>
                        {calculated ? "Calculated fields" : "Source fields"}
                        <span>{group.length}</span>
                      </h3>
                      {group.map((field) => (
                        <button
                          key={field}
                          type="button"
                          onClick={() =>
                            insert("[" + JSON.stringify(field) + "]")
                          }
                        >
                          <span
                            className={
                              calculated
                                ? "eda-calc-symbol"
                                : "text-muted-foreground"
                            }
                          >
                            {calculated ? "ƒx" : "·"}
                          </span>
                          <FieldMetadata
                            profile={resolveFieldProfile(
                              field,
                              fieldProfiles,
                              getColumnData
                            )}
                            label={field}
                            compact
                            className="min-w-0 flex-1"
                          />
                          <span
                            className="ml-auto text-muted-foreground"
                            aria-hidden="true"
                          >
                            +
                          </span>
                        </button>
                      ))}
                    </section>
                  )
                );
              })}
              {!matches.length && (
                <p className="eda-calc-help mt-4">
                  No fields match “{search}”.
                </p>
              )}
            </TabsContent>
            <TabsContent value="functions">
              <p className="eda-calc-help mb-3">
                Select a function to insert it. Replace the selected argument
                with a field or value.
              </p>
              <div className="eda-calc-function-list">
                {Object.values(calculationFunctions).map((fn) => (
                  <button
                    key={fn.syntax}
                    type="button"
                    onClick={() => {
                      const text = fn.syntax.replace(", …", "");
                      const start = text.indexOf("(") + 1;
                      const end = text.indexOf(",", start);
                      insert(text, start, end === -1 ? text.length - 1 : end);
                    }}
                  >
                    <code>{fn.syntax}</code>
                    <span>{fn.description}</span>
                  </button>
                ))}
              </div>
              <details className="eda-calc-syntax-help">
                <summary>Operators and rules</summary>
                <p>Arithmetic: + − * / ^</p>
                <p>Compare: == != &gt; &gt;= &lt; &lt;=</p>
                <p>Logic: &amp;&amp; (and), || (or), ! (not)</p>
                <code>if x &gt; 0 then x else 0</code>
                <p>Guard missing values with x == null.</p>
                <p>Date components: year, month, day, quarter, week (ISO).</p>
              </details>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
      <footer className="eda-calc-editor-footer">
        <div className="min-w-0">
          <p>{impact}</p>
          <p className="eda-calc-help">
            {dirty
              ? "Draft only. Apply to update the analysis. Closing keeps your draft in this session."
              : "Active filters stay in place when you apply a change."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {dirty && (
            <Button type="button" variant="ghost" onClick={onDiscard}>
              Discard draft
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button type="submit" disabled={!canApply}>
            {editing ? "Apply changes" : "Create calculation"}
            <span className="eda-calc-shortcut" aria-hidden="true">
              ⌘/Ctrl ↵
            </span>
          </Button>
        </div>
      </footer>
    </form>
  );
}
