import type {
  CustomerRecord,
  LicensePlan,
  LicenseRecord,
  LicenseScope,
  LicenseStatusValue,
} from "./domain";

type Row = Record<string, unknown>;

export interface RequestRecord {
  token: string;
  kind: "trial" | "community" | "quote";
  email: string;
  name?: string;
  company?: string;
  detail?: string;
  createdAt: string;
  verifiedAt?: string;
  licenseId?: string;
}

function optional(value: unknown): string | undefined {
  return value === null || value === undefined ? undefined : String(value);
}

function toLicense(row: Row): LicenseRecord {
  return {
    id: String(row.id),
    customerId: String(row.customer_id),
    licensee: String(row.licensee),
    plan: row.plan as LicensePlan,
    scope: row.scope as LicenseScope,
    seats: Number(row.seats),
    status: row.status as LicenseStatusValue,
    issued: String(row.issued),
    updatesUntil: String(row.updates_until),
    expires: optional(row.expires),
    subscriptionId: optional(row.subscription_id),
    transactionId: optional(row.transaction_id),
    termsVersion: String(row.terms_version),
    publicToken: String(row.public_token),
  };
}

function toCustomer(row: Row): CustomerRecord {
  return {
    id: String(row.id),
    email: String(row.email),
    name: optional(row.name),
    company: optional(row.company),
    providerCustomerId: optional(row.provider_customer_id),
  };
}

function toRequest(row: Row): RequestRecord {
  return {
    token: String(row.token),
    kind: row.kind as RequestRecord["kind"],
    email: String(row.email),
    name: optional(row.name),
    company: optional(row.company),
    detail: optional(row.detail),
    createdAt: String(row.created_at),
    verifiedAt: optional(row.verified_at),
    licenseId: optional(row.license_id),
  };
}

/** License records in D1 (SQLite). Every query lives here. */
export class Store {
  constructor(
    private readonly db: D1Database,
    private readonly now: () => Date
  ) {}

  private stamp() {
    return this.now().toISOString();
  }

  // Payment events -------------------------------------------------------

  /**
   * Claims an event for processing. Returns false when it was already
   * processed, so a repeated delivery does nothing.
   */
  async claimEvent(
    eventId: string,
    provider: string,
    type: string
  ): Promise<boolean> {
    const existing = await this.db
      .prepare("SELECT status FROM payment_events WHERE event_id = ?")
      .bind(eventId)
      .first<{ status: string }>();
    if (existing?.status === "done" || existing?.status === "ignored") {
      return false;
    }
    await this.db
      .prepare(
        `INSERT INTO payment_events (event_id, provider, type, status, received_at, updated_at)
         VALUES (?, ?, ?, 'processing', ?, ?)
         ON CONFLICT(event_id) DO UPDATE SET status = 'processing', updated_at = excluded.updated_at`
      )
      .bind(eventId, provider, type, this.stamp(), this.stamp())
      .run();
    return true;
  }

  async finishEvent(
    eventId: string,
    status: "done" | "failed" | "ignored",
    error?: string
  ) {
    await this.db
      .prepare(
        "UPDATE payment_events SET status = ?, error = ?, updated_at = ? WHERE event_id = ?"
      )
      .bind(status, error ?? null, this.stamp(), eventId)
      .run();
  }

  async failedEvents(): Promise<
    Array<{ eventId: string; type: string; error?: string; updatedAt: string }>
  > {
    const { results } = await this.db
      .prepare(
        "SELECT event_id, type, error, updated_at FROM payment_events WHERE status IN ('failed', 'processing') ORDER BY updated_at DESC LIMIT 50"
      )
      .all<Row>();
    return results.map((row) => ({
      eventId: String(row.event_id),
      type: String(row.type),
      error: optional(row.error),
      updatedAt: String(row.updated_at),
    }));
  }

  // Customers ------------------------------------------------------------

  async upsertCustomer(input: {
    id: string;
    email: string;
    name?: string;
    company?: string;
    providerCustomerId?: string;
  }): Promise<CustomerRecord> {
    const email = input.email.trim().toLowerCase();
    await this.db
      .prepare(
        `INSERT INTO customers (id, email, name, company, provider_customer_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(email) DO UPDATE SET
           name = COALESCE(excluded.name, customers.name),
           company = COALESCE(excluded.company, customers.company),
           provider_customer_id = COALESCE(excluded.provider_customer_id, customers.provider_customer_id)`
      )
      .bind(
        input.id,
        email,
        input.name ?? null,
        input.company ?? null,
        input.providerCustomerId ?? null,
        this.stamp()
      )
      .run();
    const row = await this.db
      .prepare("SELECT * FROM customers WHERE email = ?")
      .bind(email)
      .first<Row>();
    return toCustomer(row!);
  }

  async customer(id: string): Promise<CustomerRecord | undefined> {
    const row = await this.db
      .prepare("SELECT * FROM customers WHERE id = ?")
      .bind(id)
      .first<Row>();
    return row ? toCustomer(row) : undefined;
  }

  async customerByEmail(email: string): Promise<CustomerRecord | undefined> {
    const row = await this.db
      .prepare("SELECT * FROM customers WHERE email = ?")
      .bind(email.trim().toLowerCase())
      .first<Row>();
    return row ? toCustomer(row) : undefined;
  }

  // Licenses -------------------------------------------------------------

  async insertLicense(license: LicenseRecord): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO licenses (id, customer_id, licensee, plan, scope, seats, status, issued,
           updates_until, expires, subscription_id, transaction_id, terms_version, public_token,
           created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        license.id,
        license.customerId,
        license.licensee,
        license.plan,
        license.scope,
        license.seats,
        license.status,
        license.issued,
        license.updatesUntil,
        license.expires ?? null,
        license.subscriptionId ?? null,
        license.transactionId ?? null,
        license.termsVersion,
        license.publicToken,
        this.stamp(),
        this.stamp()
      )
      .run();
  }

  async updateLicense(
    id: string,
    changes: Partial<
      Pick<
        LicenseRecord,
        "seats" | "status" | "updatesUntil" | "licensee" | "transactionId"
      >
    >
  ): Promise<void> {
    const columns: Record<string, string> = {
      seats: "seats",
      status: "status",
      updatesUntil: "updates_until",
      licensee: "licensee",
      transactionId: "transaction_id",
    };
    const entries = Object.entries(changes).filter(
      ([, value]) => value !== undefined
    );
    if (entries.length === 0) return;
    const assignments = entries
      .map(([key]) => `${columns[key]} = ?`)
      .join(", ");
    await this.db
      .prepare(
        `UPDATE licenses SET ${assignments}, updated_at = ? WHERE id = ?`
      )
      .bind(...entries.map(([, value]) => value), this.stamp(), id)
      .run();
  }

  async license(id: string): Promise<LicenseRecord | undefined> {
    const row = await this.db
      .prepare("SELECT * FROM licenses WHERE id = ?")
      .bind(id)
      .first<Row>();
    return row ? toLicense(row) : undefined;
  }

  async licenseByPublicToken(
    token: string
  ): Promise<LicenseRecord | undefined> {
    const row = await this.db
      .prepare("SELECT * FROM licenses WHERE public_token = ?")
      .bind(token)
      .first<Row>();
    return row ? toLicense(row) : undefined;
  }

  async licensesBySubscription(
    subscriptionId: string
  ): Promise<LicenseRecord[]> {
    const { results } = await this.db
      .prepare("SELECT * FROM licenses WHERE subscription_id = ? ORDER BY id")
      .bind(subscriptionId)
      .all<Row>();
    return results.map(toLicense);
  }

  async licensesByTransaction(transactionId: string): Promise<LicenseRecord[]> {
    const { results } = await this.db
      .prepare("SELECT * FROM licenses WHERE transaction_id = ? ORDER BY id")
      .bind(transactionId)
      .all<Row>();
    return results.map(toLicense);
  }

  async licensesByCustomer(customerId: string): Promise<LicenseRecord[]> {
    const { results } = await this.db
      .prepare(
        "SELECT * FROM licenses WHERE customer_id = ? ORDER BY created_at DESC"
      )
      .bind(customerId)
      .all<Row>();
    return results.map(toLicense);
  }

  async allLicenses(): Promise<Array<LicenseRecord & { email: string }>> {
    const { results } = await this.db
      .prepare(
        `SELECT licenses.*, customers.email AS email FROM licenses
         JOIN customers ON customers.id = licenses.customer_id
         ORDER BY licenses.created_at DESC`
      )
      .all<Row>();
    return results.map((row) => ({
      ...toLicense(row),
      email: String(row.email),
    }));
  }

  // Keys -----------------------------------------------------------------

  async insertKey(licenseId: string, kid: string, token: string) {
    await this.db
      .prepare(
        "INSERT INTO license_keys (license_id, kid, token, created_at) VALUES (?, ?, ?, ?)"
      )
      .bind(licenseId, kid, token, this.stamp())
      .run();
  }

  async latestKey(licenseId: string): Promise<string | undefined> {
    const row = await this.db
      .prepare(
        "SELECT token FROM license_keys WHERE license_id = ? ORDER BY id DESC LIMIT 1"
      )
      .bind(licenseId)
      .first<{ token: string }>();
    return row?.token;
  }

  // Requests -------------------------------------------------------------

  async insertRequest(request: RequestRecord) {
    await this.db
      .prepare(
        `INSERT INTO requests (token, kind, email, name, company, detail, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        request.token,
        request.kind,
        request.email.trim().toLowerCase(),
        request.name ?? null,
        request.company ?? null,
        request.detail ?? null,
        request.createdAt
      )
      .run();
  }

  async request(token: string): Promise<RequestRecord | undefined> {
    const row = await this.db
      .prepare("SELECT * FROM requests WHERE token = ?")
      .bind(token)
      .first<Row>();
    return row ? toRequest(row) : undefined;
  }

  async completeRequest(token: string, licenseId?: string) {
    await this.db
      .prepare(
        "UPDATE requests SET verified_at = ?, license_id = ? WHERE token = ?"
      )
      .bind(this.stamp(), licenseId ?? null, token)
      .run();
  }

  /** Verified requests of a kind since a date, by exact email or by domain. */
  async countVerified(
    kind: RequestRecord["kind"],
    since: string,
    match: { email: string } | { domain: string }
  ): Promise<number> {
    const [clause, value] =
      "email" in match
        ? ["email = ?", match.email.trim().toLowerCase()]
        : ["email LIKE ?", `%@${match.domain.toLowerCase()}`];
    const row = await this.db
      .prepare(
        `SELECT COUNT(*) AS count FROM requests
         WHERE kind = ? AND verified_at IS NOT NULL AND verified_at >= ? AND ${clause}`
      )
      .bind(kind, since, value)
      .first<{ count: number }>();
    return Number(row?.count ?? 0);
  }

  // Portal ---------------------------------------------------------------

  async insertPortalToken(
    token: string,
    customerId: string,
    expiresAt: string
  ) {
    await this.db
      .prepare(
        "INSERT INTO portal_tokens (token, customer_id, expires_at) VALUES (?, ?, ?)"
      )
      .bind(token, customerId, expiresAt)
      .run();
  }

  async portalCustomer(token: string): Promise<CustomerRecord | undefined> {
    const row = await this.db
      .prepare(
        `SELECT customers.* FROM portal_tokens
         JOIN customers ON customers.id = portal_tokens.customer_id
         WHERE portal_tokens.token = ? AND portal_tokens.expires_at > ?`
      )
      .bind(token, this.stamp())
      .first<Row>();
    return row ? toCustomer(row) : undefined;
  }
}
