-- License records. Payments, card data, and tax stay with the merchant of record.
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  company TEXT,
  provider_customer_id TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE licenses (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  licensee TEXT NOT NULL,
  plan TEXT NOT NULL,
  scope TEXT NOT NULL,
  seats INTEGER NOT NULL,
  status TEXT NOT NULL,
  issued TEXT NOT NULL,
  updates_until TEXT NOT NULL,
  expires TEXT,
  subscription_id TEXT,
  transaction_id TEXT,
  terms_version TEXT NOT NULL,
  public_token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX licenses_customer ON licenses(customer_id);
CREATE INDEX licenses_subscription ON licenses(subscription_id);
CREATE INDEX licenses_transaction ON licenses(transaction_id);

CREATE TABLE license_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  license_id TEXT NOT NULL REFERENCES licenses(id),
  kid TEXT NOT NULL,
  token TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX license_keys_license ON license_keys(license_id);

-- One row per provider event, so a repeated delivery has no effect.
CREATE TABLE payment_events (
  event_id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  error TEXT,
  received_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Trial, community-key, and quote requests from the site.
CREATE TABLE requests (
  token TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  company TEXT,
  detail TEXT,
  created_at TEXT NOT NULL,
  verified_at TEXT,
  license_id TEXT
);
CREATE INDEX requests_email ON requests(email, kind);

CREATE TABLE portal_tokens (
  token TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  expires_at TEXT NOT NULL
);
