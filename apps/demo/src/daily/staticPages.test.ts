import { describe, expect, it } from "vitest";
import { dailyHtml } from "../../dailyCorpus.mjs";

describe("static daily articles", () => {
  it("exposes article text and source links without JavaScript or raw chart syntax", () => {
    const html = dailyHtml(
      '<head><title>Default</title></head><div id="root"></div>',
      {
        slug: "test",
        title: "A <chart>",
        summary: 'A "comparison"',
        kind: "notebook",
        textPath: "projects/co2/story.eda.md",
      },
      "# A chart\n\nA finding.\n\n```eda\nline x=year y=value\n```\n\n[Fields](fields.json)"
    );
    expect(html).toContain("<title>A &lt;chart&gt; · explorEDA</title>");
    expect(html).toContain('content="A &quot;comparison&quot;"');
    expect(html).toContain("<h1>A chart</h1>");
    expect(html).toContain("<p>A finding.</p>");
    expect(html).toContain('href="/daily-viz/projects/co2/fields.json"');
    expect(html).not.toContain("line x=year");
    expect(html).toContain(
      'rel="canonical" href="https://exploreda.dev/daily/test"'
    );
  });
});
