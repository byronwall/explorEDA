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
      <h2 id="why-heading" className="text-xl font-semibold">
        Why a workspace, not only charts
      </h2>
      <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
        Linked filtering alone is common. explorEDA also provides the parts
        around the charts: configuration, record inspection, formulas, and
        restorable settings.
      </p>
      <ul className="mt-4 grid gap-3 md:grid-cols-3">
        {reasons.map((reason) => (
          <li
            key={reason.title}
            className="rounded-md border border-border p-4"
          >
            <h3 className="text-sm font-semibold">{reason.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{reason.body}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-muted-foreground">
        To try the formula workflow, open{" "}
        <span className="font-medium text-foreground">
          From orders to contribution
        </span>{" "}
        below.
      </p>
    </section>
  );
}
