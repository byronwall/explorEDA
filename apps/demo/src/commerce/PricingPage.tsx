import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/tooltip";
import { inlineLinkClass, labelClass } from "../docs/components/chrome";
import {
  PADDLE,
  PRICES,
  QUOTE_SEATS,
  SALES_EMAIL,
  formatPrice,
} from "./config";
import { openCheckout } from "./paddle";
import { RequestForm } from "./RequestForm";
import { LicenseQuiz } from "./LicenseQuiz";

const cardClass = "flex flex-col rounded-xl border border-border bg-card p-6";

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-sm">
      <Check
        className="mt-0.5 size-4 shrink-0 text-primary"
        aria-hidden="true"
      />
      <span>{children}</span>
    </li>
  );
}

function SeatPicker({
  seats,
  onChange,
}: {
  seats: number;
  onChange: (seats: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <ActionTooltip content="One seat per developer who writes code that imports explorEDA">
        <span className="text-sm text-muted-foreground">Developers</span>
      </ActionTooltip>
      <Button
        variant="outline"
        size="icon"
        aria-label="One fewer developer"
        disabled={seats <= 1}
        onClick={() => onChange(seats - 1)}
      >
        <Minus />
      </Button>
      <input
        aria-label="Number of developers"
        type="number"
        min={1}
        value={seats}
        onChange={(event) =>
          onChange(Math.max(1, Math.floor(Number(event.target.value) || 1)))
        }
        className="w-16 rounded-md border border-input bg-background px-2 py-1.5 text-center text-sm"
      />
      <Button
        variant="outline"
        size="icon"
        aria-label="One more developer"
        onClick={() => onChange(seats + 1)}
      >
        <Plus />
      </Button>
    </div>
  );
}

export function PricingPage() {
  const [seats, setSeats] = useState(1);
  const [oem, setOem] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const quote = seats >= QUOTE_SEATS;
  const total = seats * PRICES.commercial + (oem ? PRICES.oem : 0);
  const canCheckout =
    Boolean(PADDLE) && !quote && (!oem || Boolean(PADDLE?.prices.oem));

  return (
    <div className="pb-16">
      <header className="max-w-3xl pt-10">
        <h1 className="text-4xl font-bold tracking-[-0.02em]">Pricing</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Free to evaluate, for non-commercial work, and for small teams.
          Companies using explorEDA in their products and internal tools buy a
          license per developer. Keys are checked offline, and every version
          released during your year stays licensed for good.
        </p>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <section className={cardClass} aria-labelledby="plan-free">
          <h2 id="plan-free" className="text-lg font-semibold">
            Free
          </h2>
          <p className="mt-1 text-3xl font-bold">$0</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Evaluation, non-commercial use, and organizations under $1M a year
            with fewer than 10 people.
          </p>
          <ul className="mt-5 space-y-2">
            <Feature>Every feature, no limits</Feature>
            <Feature>Production use if you qualify</Feature>
            <Feature>
              A small unlicensed notice, removable with a free community key
            </Feature>
          </ul>
          <div className="mt-auto pt-6">
            <Button variant="outline" asChild>
              <Link to="/license#community">Get a community key</Link>
            </Button>
          </div>
        </section>

        <section
          className={`${cardClass} border-primary/60 ring-1 ring-primary/30`}
          aria-labelledby="plan-commercial"
        >
          <h2 id="plan-commercial" className="text-lg font-semibold">
            Commercial
          </h2>
          <p className="mt-1 text-3xl font-bold">
            {formatPrice(PRICES.commercial)}
            <span className="text-base font-normal text-muted-foreground">
              {" "}
              per developer / year
            </span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            For companies building internal tools and SaaS products with
            explorEDA. Unlimited apps and end users.
          </p>
          <ul className="mt-5 space-y-2">
            <Feature>
              License key and certificate by email, within a minute
            </Feature>
            <Feature>
              12 months of updates; covered versions are yours for good
            </Feature>
            <Feature>Email support with a 2-business-day first reply</Feature>
            <Feature>30-day refund, no questions</Feature>
          </ul>
          <div className="mt-auto space-y-4 pt-6">
            <SeatPicker seats={seats} onChange={setSeats} />
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={oem}
                onChange={(event) => setOem(event.target.checked)}
                className="mt-1"
              />
              <span>
                Add redistribution for one product (+{formatPrice(PRICES.oem)}
                /year)
                <span className="block text-muted-foreground">
                  Needed if customers install your product themselves, or if it
                  lets other developers build with explorEDA.
                </span>
              </span>
            </label>
            <p className="text-sm">
              <span className="font-semibold">{formatPrice(total)}</span>
              <span className="text-muted-foreground">
                {" "}
                per year, plus tax where it applies
              </span>
            </p>
            {quote ? (
              <Button asChild>
                <a href="#quote">Request a quote for {seats} developers</a>
              </Button>
            ) : canCheckout ? (
              <Button
                onClick={() => {
                  setCheckoutError(null);
                  openCheckout([
                    { product: "commercial", quantity: seats },
                    ...(oem ? [{ product: "oem" as const, quantity: 1 }] : []),
                  ]).catch(() =>
                    setCheckoutError(
                      `Checkout didn't open. Try again, or write to ${SALES_EMAIL}.`
                    )
                  );
                }}
              >
                Buy now
              </Button>
            ) : (
              <Button asChild>
                <a href="#quote">Request an invoice</a>
              </Button>
            )}
            {checkoutError && (
              <p role="alert" className="text-sm text-destructive">
                {checkoutError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {canCheckout
                ? "Card or PayPal through Paddle, our reseller, which handles tax and invoices. Add your company name and tax ID at checkout."
                : "We'll send an invoice payable by card or bank transfer. Paddle, our reseller, handles tax."}
            </p>
          </div>
        </section>

        <section className={cardClass} aria-labelledby="plan-enterprise">
          <h2 id="plan-enterprise" className="text-lg font-semibold">
            Enterprise
          </h2>
          <p className="mt-1 text-3xl font-bold">Quote</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {QUOTE_SEATS} or more developers, purchase orders, bank transfer, or
            your own paper.
          </p>
          <ul className="mt-5 space-y-2">
            <Feature>Invoice with net terms; we fill in vendor forms</Feature>
            <Feature>Security questionnaires answered</Feature>
            <Feature>1-business-day support response</Feature>
            <Feature>Redistribution for several products</Feature>
          </ul>
          <div className="mt-auto pt-6">
            <Button variant="outline" asChild>
              <a href="#quote">Request a quote</a>
            </Button>
          </div>
        </section>
      </div>

      <section
        className="mt-16 grid gap-10 lg:grid-cols-2"
        aria-labelledby="need"
      >
        <div>
          <h2 id="need" className="text-2xl font-semibold">
            Do you need a license?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Three questions, based on the{" "}
            <Link className={inlineLinkClass} to="/legal/license">
              explorEDA License
            </Link>
            .
          </p>
          <div className="mt-6">
            <LicenseQuiz />
          </div>
        </div>
        <div id="quote" className="scroll-mt-6">
          <h2 className="text-2xl font-semibold">Request a quote or invoice</h2>
          <p className="mt-2 text-muted-foreground">
            We reply within one business day. When you're ready, you get an
            invoice payable by bank transfer or card, and the license is issued
            as soon as it's paid.
          </p>
          <div className="mt-6">
            <RequestForm
              path="/api/quote"
              submitLabel="Request a quote"
              success="Thanks. We'll reply within one business day."
              fields={[
                {
                  name: "email",
                  label: "Work email",
                  type: "email",
                  required: true,
                },
                { name: "name", label: "Your name" },
                { name: "company", label: "Company", required: true },
                {
                  name: "seats",
                  label: "Developers",
                  type: "number",
                  required: true,
                  defaultValue: String(Math.max(seats, 1)),
                },
                {
                  name: "redistribution",
                  label: "We need redistribution rights",
                  type: "checkbox",
                },
                { name: "message", label: "Anything else", type: "textarea" },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="mt-16 max-w-3xl" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-semibold">
          Questions buyers ask
        </h2>
        <dl className="mt-6 space-y-6">
          {FAQ.map(([question, answer]) => (
            <div key={question}>
              <dt className="font-medium">{question}</dt>
              <dd className="mt-1 text-muted-foreground">{answer}</dd>
            </div>
          ))}
        </dl>
        <p className={`${labelClass} mt-10`}>Read the terms</p>
        <p className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link className={inlineLinkClass} to="/legal/commercial-license">
            Commercial License Agreement
          </Link>
          <Link className={inlineLinkClass} to="/legal/terms">
            Terms of sale
          </Link>
          <Link className={inlineLinkClass} to="/legal/refunds">
            Refunds
          </Link>
          <Link className={inlineLinkClass} to="/security">
            Security
          </Link>
          <Link className={inlineLinkClass} to="/support">
            Support
          </Link>
        </p>
      </section>
    </div>
  );
}

const FAQ: Array<[string, React.ReactNode]> = [
  [
    "Who counts as a developer?",
    "Anyone who writes, changes, or builds code that imports explorEDA, employee or contractor. People who only use the app you build don't count. Reassign a seat when someone leaves the project.",
  ],
  [
    "What happens if we don't renew?",
    "Nothing breaks. Every version released during your paid year stays licensed for good. To install versions released later, renew or buy again.",
  ],
  [
    "Does the component call home?",
    "No. The key is checked in the browser with a public key built into the package. explorEDA makes no network requests and sends no telemetry.",
  ],
  [
    "Is the license key a secret?",
    "No. It names your company and is meant to ship in your client code. Sharing it outside your organization is against the license.",
  ],
  [
    "How do we prove we're licensed?",
    "Each license has a certificate page naming your company, seats, scope, and update period. The workspace's License tab and the npx exploreda license check command show the same details from the key.",
  ],
  [
    "Can we pay by invoice or purchase order?",
    "Yes. Request a quote; you'll get an invoice payable by bank transfer or card. Paddle, our reseller, is the merchant of record and issues tax-compliant invoices.",
  ],
  [
    "Can we try it in production first?",
    "Yes. A 30-day trial key works in development and production without the notice.",
  ],
];
