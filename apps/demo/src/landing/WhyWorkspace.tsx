import { FunctionSquare, Network, Save } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const reasons = [
  {
    icon: Network,
    title: "Linked views and their records",
    body: "A selection in one chart filters every other view and the record table, so users can check the rows behind a pattern.",
  },
  {
    icon: FunctionSquare,
    title: "Calculated fields users can inspect",
    body: "Formulas show their dependency chains, and the editor previews a draft before it is applied across views.",
  },
  {
    icon: Save,
    title: "Settings your app keeps",
    body: "Users arrange the analysis visually. Your app receives the settings as JSON and restores them later through savedData.",
  },
];

export function WhyWorkspace() {
  return (
    <section aria-labelledby="why-heading">
      <SectionHeading
        id="why-heading"
        eyebrow="Why explorEDA"
        heading="A workspace, not only charts"
      >
        Linked filtering alone is common. explorEDA also provides the parts
        around the charts: configuration, record inspection, formulas, and
        restorable settings.
      </SectionHeading>
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {reasons.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-sm text-muted-foreground">
        To try the formula workflow, open{" "}
        <span className="font-medium text-foreground">
          From orders to contribution
        </span>{" "}
        below.
      </p>
    </section>
  );
}
