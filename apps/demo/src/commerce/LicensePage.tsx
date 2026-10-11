import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getLicenseStatus,
  RELEASE_DATE,
  describePlan,
  type LicenseStatus,
} from "exploreda/license";
import { Button } from "@/components/ui/button";
import { CodePanel } from "../landing/CodePanel";
import { inlineLinkClass } from "../docs/components/chrome";
import { RequestForm } from "./RequestForm";

const sectionClass = "scroll-mt-6 border-t border-border pt-10";

const PROP_EXAMPLE = `import { ExplorEda } from "exploreda";

<ExplorEda
  data={rows}
  licenseKey={import.meta.env.VITE_EXPLOREDA_LICENSE_KEY}
/>`;

const GLOBAL_EXAMPLE = `import { setLicenseKey } from "exploreda/license";

// Once, before the first workspace renders.
setLicenseKey(process.env.NEXT_PUBLIC_EXPLOREDA_LICENSE_KEY);`;

const CI_EXAMPLE = `# Exits 0 when licensed, 2 when missing or out of date, 3 when not valid.
EXPLOREDA_LICENSE_KEY=EDA1.… npx exploreda license check`;

/** Checks a pasted key in this browser, the same way the package does. */
function KeyChecker() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<LicenseStatus>();
  return (
    <form
      className="grid gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setStatus(await getLicenseStatus(key));
      }}
    >
      <label htmlFor="check-key" className="text-sm font-medium">
        License key
      </label>
      <textarea
        id="check-key"
        value={key}
        onChange={(event) => {
          setKey(event.target.value);
          setStatus(undefined);
        }}
        rows={3}
        spellCheck={false}
        placeholder="EDA1.…"
        className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
      />
      <div>
        <Button type="submit" variant="outline" disabled={!key.trim()}>
          Check this key
        </Button>
      </div>
      {status && (
        <div
          role="status"
          className="rounded-lg border border-border p-4 text-sm"
        >
          <p className="font-medium">{status.message}</p>
          {status.license && (
            <dl className="mt-3 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-6 gap-y-1">
              <dt className="text-muted-foreground">Licensee</dt>
              <dd>{status.license.licensee}</dd>
              <dt className="text-muted-foreground">Plan</dt>
              <dd>{describePlan(status.license)}</dd>
              <dt className="text-muted-foreground">Updates through</dt>
              <dd>{status.license.updatesUntil}</dd>
              <dt className="text-muted-foreground">License ID</dt>
              <dd>{status.license.id}</dd>
            </dl>
          )}
          <p className="mt-3 text-muted-foreground">
            Checked against the version this site runs, released {RELEASE_DATE}.
            Nothing was sent anywhere.
          </p>
        </div>
      )}
    </form>
  );
}

export function LicensePage() {
  const [searchParams] = useSearchParams();
  const purchased = searchParams.get("purchased") === "1";

  return (
    <div className="max-w-3xl pb-16">
      <header className="pt-10">
        <h1 className="text-4xl font-bold tracking-[-0.02em]">
          License and keys
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Who needs a license, how to install your key, and how to check that
          you're covered.
        </p>
        {purchased && (
          <p
            role="status"
            className="mt-6 rounded-lg border border-primary/40 bg-primary/5 p-4"
          >
            <strong>Thank you.</strong> Your license key and certificate are on
            their way to the email you used at checkout, usually within a
            minute. Install it as shown below.
          </p>
        )}
      </header>

      <section className="mt-10 space-y-4" aria-labelledby="who">
        <h2 id="who" className="text-2xl font-semibold">
          Who needs a license
        </h2>
        <p className="text-muted-foreground">
          explorEDA is free for evaluation (up to 90 days), for non-commercial
          work, and for organizations with under $1M in yearly revenue and
          funding and fewer than 10 people. Everyone else using it commercially
          needs a commercial license, one seat per developer. Products that
          customers install themselves, or that let other developers build with
          explorEDA, also need the redistribution add-on.
        </p>
        <p className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link className={inlineLinkClass} to="/pricing">
            Pricing
          </Link>
          <Link className={inlineLinkClass} to="/legal/license">
            The explorEDA License
          </Link>
          <Link className={inlineLinkClass} to="/legal/commercial-license">
            Commercial License Agreement
          </Link>
        </p>
      </section>

      <section id="install" className={`${sectionClass} mt-12 space-y-4`}>
        <h2 className="text-2xl font-semibold">Install your key</h2>
        <p className="text-muted-foreground">
          Your purchase or trial email has a key that starts with{" "}
          <code>EDA1.</code> It names your company and is checked offline, so
          it's safe in client code. Pass it to each workspace:
        </p>
        <CodePanel files={[{ name: "Workspace.tsx", code: PROP_EXAMPLE }]} />
        <p className="text-muted-foreground">Or set it once for the page:</p>
        <CodePanel files={[{ name: "main.ts", code: GLOBAL_EXAMPLE }]} />
        <p className="text-muted-foreground">
          The unlicensed notice in the status bar disappears, the console names
          your company, and the License tab in workspace settings shows your
          plan. To fail a build that ships without a valid key:
        </p>
        <CodePanel files={[{ name: "CI", code: CI_EXAMPLE }]} />
      </section>

      <section id="check" className={`${sectionClass} mt-12 space-y-4`}>
        <h2 className="text-2xl font-semibold">Check a key</h2>
        <p className="text-muted-foreground">
          Paste a key to see who it's for and what it covers. The check runs in
          your browser.
        </p>
        <KeyChecker />
      </section>

      <section id="manage" className={`${sectionClass} mt-12 space-y-4`}>
        <h2 className="text-2xl font-semibold">Your licenses and billing</h2>
        <p className="text-muted-foreground">
          We'll email you a link to a page with your keys, certificates,
          invoices, and payment details.
        </p>
        <RequestForm
          path="/api/portal-link"
          submitLabel="Email me a link"
          success="If that email has licenses, a link is on its way. It works for 24 hours."
          fields={[
            {
              name: "email",
              label: "Email used to buy",
              type: "email",
              required: true,
            },
          ]}
        />
      </section>

      <section id="trial" className={`${sectionClass} mt-12 space-y-4`}>
        <h2 className="text-2xl font-semibold">30-day trial key</h2>
        <p className="text-muted-foreground">
          Try explorEDA in development and production without the notice. One
          trial per person.
        </p>
        <RequestForm
          path="/api/trial"
          submitLabel="Email me a trial key"
          success="Check your email for a confirmation link. The key arrives after you confirm."
          fields={[
            {
              name: "email",
              label: "Work email",
              type: "email",
              required: true,
            },
            { name: "name", label: "Your name" },
            { name: "company", label: "Company" },
          ]}
        />
      </section>

      <section id="community" className={`${sectionClass} mt-12 space-y-4`}>
        <h2 className="text-2xl font-semibold">Free community key</h2>
        <p className="text-muted-foreground">
          If your use is free under the explorEDA License, a community key
          removes the notice. It lasts a year; request another when it ends.
        </p>
        <RequestForm
          path="/api/community"
          submitLabel="Email me a community key"
          success="Check your email for a confirmation link. The key arrives after you confirm."
          fields={[
            { name: "email", label: "Email", type: "email", required: true },
            { name: "name", label: "Your name" },
            {
              name: "company",
              label: "Project or organization",
              hint: "Shown as the licensee.",
            },
            {
              name: "eligible",
              label:
                "My use is free under the explorEDA License: evaluation, non-commercial, or an organization under $1M a year with fewer than 10 people.",
              type: "checkbox",
              required: true,
            },
          ]}
        />
      </section>
    </div>
  );
}
