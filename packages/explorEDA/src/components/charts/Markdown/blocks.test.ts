import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { afterEach, describe, expect, it } from "vitest";

import { filterNoteBlocks, getSlashQuery, NOTE_BLOCKS } from "./blocks";

let editor: Editor | null = null;

function editorWithCaretAtEnd(content: string) {
  editor = new Editor({ extensions: [StarterKit], content });
  editor.commands.focus("end");
  return editor;
}

afterEach(() => {
  editor?.destroy();
  editor = null;
});

describe("getSlashQuery", () => {
  it("reads the query after a slash at the start of a line", () => {
    const { state } = editorWithCaretAtEnd("<p>/head</p>");
    expect(getSlashQuery(state)).toEqual({ query: "head", from: 1, to: 6 });
  });

  it("reads a slash typed after other words", () => {
    const { state } = editorWithCaretAtEnd("<p>Sales by /li</p>");
    expect(getSlashQuery(state)?.query).toBe("li");
  });

  it("ignores slashes inside words, such as dates or paths", () => {
    expect(getSlashQuery(editorWithCaretAtEnd("<p>9/28</p>").state)).toBeNull();
    editor?.destroy();
    expect(
      getSlashQuery(editorWithCaretAtEnd("<p>and/or</p>").state)
    ).toBeNull();
  });

  it("ignores headings and code blocks", () => {
    expect(getSlashQuery(editorWithCaretAtEnd("<h1>/h</h1>").state)).toBeNull();
    editor?.destroy();
    expect(
      getSlashQuery(editorWithCaretAtEnd("<pre><code>/x</code></pre>").state)
    ).toBeNull();
  });

  it("turns the slash text into the chosen block", () => {
    const current = editorWithCaretAtEnd("<p>/h2</p>");
    const query = getSlashQuery(current.state)!;
    const heading = NOTE_BLOCKS.find((block) => block.id === "h2")!;
    heading
      .apply(current.chain().deleteRange({ from: query.from, to: query.to }))
      .run();
    expect(current.getHTML()).toBe("<h2></h2>");
  });
});

describe("filterNoteBlocks", () => {
  it("lists every block for an empty query", () => {
    expect(filterNoteBlocks("")).toHaveLength(NOTE_BLOCKS.length);
  });

  it("matches labels and keywords", () => {
    expect(filterNoteBlocks("head").map((block) => block.id)).toEqual([
      "h1",
      "h2",
      "h3",
    ]);
    expect(filterNoteBlocks("hr").map((block) => block.id)).toEqual([
      "divider",
    ]);
    expect(filterNoteBlocks("zzz")).toEqual([]);
  });
});
