import { SectionHeading } from "./SectionHeading";

const reasons = [
  {
    title: "Linked views and their records",
    body: "A selection in one chart filters every other view and the record table, so users can check the rows behind a pattern.",
  },
  {
    title: "Calculated fields users can inspect",
    body: "Formulas show their dependency chains, and the editor previews a draft before it is applied across views.",
  },
  {
    title: "Settings your app keeps",
    body: "Users arrange the analysis visually. Your app receives the settings as JSON and restores them later through savedData.",
  },
];

export function WhyWorkspace() {
  return (
    <section aria-labelledby="why-heading">
      <SectionHeading id="why-heading" heading="A workspace, not only charts">
        Linked filtering alone is common. explorEDA also provides the parts
        around the charts: configuration, record inspection, formulas, and
        restorable settings.
      </SectionHeading>
      <dl className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-3">
        {reasons.map(({ title, body }) => (
          <div key={title} className="border-t border-foreground/80 pt-4">
            <dt className="font-semibold">{title}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {body}
            </dd>
          </div>
        ))}
      </dl>
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
