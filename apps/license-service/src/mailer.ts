export interface Email {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

/** Sends email. Resend in staging and production; memory in tests. */
export interface Mailer {
  send(email: Email): Promise<void>;
}

export class ResendMailer implements Mailer {
  constructor(
    private readonly apiKey: string,
    private readonly from: string
  ) {}

  async send(email: Email): Promise<void> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to: [email.to],
        subject: email.subject,
        text: email.text,
        html: email.html,
        reply_to: email.replyTo,
      }),
    });
    if (!response.ok) {
      throw new Error(
        `Email to ${email.to} failed: ${response.status} ${await response.text()}`
      );
    }
  }
}

/** Keeps emails in memory, and prints them when asked; for tests and local runs. */
export class MemoryMailer implements Mailer {
  readonly sent: Email[] = [];
  constructor(private readonly print = false) {}

  async send(email: Email): Promise<void> {
    this.sent.push(email);
    if (this.print) {
      console.log(
        `\n--- email to ${email.to}: ${email.subject}\n${email.text}\n---\n`
      );
    }
  }
}
