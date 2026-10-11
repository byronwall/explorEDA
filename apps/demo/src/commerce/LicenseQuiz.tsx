import { useState } from "react";
import { Link } from "react-router-dom";
import { inlineLinkClass } from "../docs/components/chrome";
import { QUOTE_SEATS } from "./config";

type Answer = "yes" | "no" | undefined;

const QUESTIONS = [
  {
    id: "evaluating",
    text: "Are you only evaluating it, for up to 90 days, with no outside users?",
  },
  {
    id: "noncommercial",
    text: "Is it personal, academic, or non-profit work that nobody pays to use?",
  },
  {
    id: "small",
    text: "Did your organization have under $1M in revenue and funding last year, with fewer than 10 people?",
  },
] as const;

/** Walks through section 1 of the explorEDA License, one question at a time. */
export function LicenseQuiz() {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const firstYes = QUESTIONS.find((question) => answers[question.id] === "yes");
  const current = firstYes
    ? undefined
    : QUESTIONS.find((question) => answers[question.id] !== "no");

  return (
    <div className="space-y-4">
      {QUESTIONS.map((question) => {
        const answer = answers[question.id];
        const shown = answer !== undefined || question === current;
        if (!shown) return null;
        return (
          <fieldset
            key={question.id}
            className="rounded-lg border border-border p-4"
          >
            <legend className="px-1 text-sm font-medium">
              {question.text}
            </legend>
            <div className="mt-2 flex gap-4 text-sm">
              {(["yes", "no"] as const).map((value) => (
                <label key={value} className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name={question.id}
                    checked={answer === value}
                    onChange={() => {
                      // Changing an answer clears the ones after it.
                      const index = QUESTIONS.indexOf(question);
                      const next: Record<string, Answer> = {};
                      QUESTIONS.slice(0, index).forEach((item) => {
                        next[item.id] = answers[item.id];
                      });
                      next[question.id] = value;
                      setAnswers(next);
                    }}
                  />
                  {value === "yes" ? "Yes" : "No"}
                </label>
              ))}
            </div>
          </fieldset>
        );
      })}
      <div role="status" className="text-sm">
        {firstYes ? (
          <p className="rounded-lg bg-muted/50 p-4">
            <strong>You can use explorEDA free.</strong>{" "}
            {firstYes.id === "evaluating" ? (
              <>
                For a production trial without the notice,{" "}
                <Link className={inlineLinkClass} to="/license#trial">
                  get a 30-day trial key
                </Link>
                .
              </>
            ) : (
              <>
                To remove the notice,{" "}
                <Link className={inlineLinkClass} to="/license#community">
                  get a free community key
                </Link>
                .
              </>
            )}
          </p>
        ) : current === undefined ? (
          <p className="rounded-lg bg-muted/50 p-4">
            <strong>You need a commercial license</strong>, one seat per
            developer who works with explorEDA. Use the Commercial plan above,
            or request a quote for {QUOTE_SEATS} or more.
          </p>
        ) : null}
      </div>
    </div>
  );
}
