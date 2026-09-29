import type { Editor } from "@tiptap/react";
import {
  Code2,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  type LucideIcon,
  Minus,
  Pilcrow,
  Quote,
} from "lucide-react";

type Chain = ReturnType<Editor["chain"]>;

export interface NoteBlock {
  id: string;
  label: string;
  /** Markdown shortcut typed at the start of a line. */
  shortcut?: string;
  keywords: string[];
  icon: LucideIcon;
  apply: (chain: Chain) => Chain;
  isActive?: (editor: Editor) => boolean;
}

export const NOTE_BLOCKS: NoteBlock[] = [
  {
    id: "text",
    label: "Text",
    keywords: ["paragraph", "plain", "body"],
    icon: Pilcrow,
    apply: (chain) => chain.setParagraph(),
    isActive: (editor) => editor.isActive("paragraph"),
  },
  {
    id: "h1",
    label: "Heading 1",
    shortcut: "#",
    keywords: ["title", "h1", "large"],
    icon: Heading1,
    apply: (chain) => chain.setHeading({ level: 1 }),
    isActive: (editor) => editor.isActive("heading", { level: 1 }),
  },
  {
    id: "h2",
    label: "Heading 2",
    shortcut: "##",
    keywords: ["subtitle", "h2", "section"],
    icon: Heading2,
    apply: (chain) => chain.setHeading({ level: 2 }),
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
  },
  {
    id: "h3",
    label: "Heading 3",
    shortcut: "###",
    keywords: ["h3", "small"],
    icon: Heading3,
    apply: (chain) => chain.setHeading({ level: 3 }),
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
  },
  {
    id: "bullet",
    label: "Bulleted list",
    shortcut: "-",
    keywords: ["unordered", "ul", "bullets"],
    icon: List,
    apply: (chain) => chain.toggleBulletList(),
    isActive: (editor) => editor.isActive("bulletList"),
  },
  {
    id: "numbered",
    label: "Numbered list",
    shortcut: "1.",
    keywords: ["ordered", "ol", "numbers"],
    icon: ListOrdered,
    apply: (chain) => chain.toggleOrderedList(),
    isActive: (editor) => editor.isActive("orderedList"),
  },
  {
    id: "quote",
    label: "Quote",
    shortcut: ">",
    keywords: ["blockquote", "citation"],
    icon: Quote,
    apply: (chain) => chain.toggleBlockquote(),
    isActive: (editor) => editor.isActive("blockquote"),
  },
  {
    id: "code",
    label: "Code block",
    shortcut: "```",
    keywords: ["pre", "snippet", "monospace"],
    icon: Code2,
    apply: (chain) => chain.toggleCodeBlock(),
    isActive: (editor) => editor.isActive("codeBlock"),
  },
  {
    id: "divider",
    label: "Divider",
    shortcut: "---",
    keywords: ["rule", "hr", "separator", "line"],
    icon: Minus,
    apply: (chain) => chain.setHorizontalRule(),
  },
];

export function filterNoteBlocks(query: string): NoteBlock[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return NOTE_BLOCKS;
  return NOTE_BLOCKS.filter(
    (block) =>
      block.label.toLowerCase().includes(needle) ||
      block.keywords.some((keyword) => keyword.startsWith(needle))
  );
}

export interface SlashQuery {
  query: string;
  from: number;
  to: number;
}

const SLASH_PATTERN = /(?:^|\s)\/([a-z0-9]*(?: [a-z0-9]*)?)$/i;

/** Finds a "/query" typed at the caret in a plain paragraph. */
export function getSlashQuery(state: Editor["state"]): SlashQuery | null {
  const { selection } = state;
  if (!selection.empty) return null;
  const { $from } = selection;
  if ($from.parent.type.name !== "paragraph") return null;
  const textBefore = $from.parent.textBetween(
    0,
    $from.parentOffset,
    undefined,
    "￼"
  );
  const match = SLASH_PATTERN.exec(textBefore);
  if (!match) return null;
  const query = match[1] ?? "";
  return { query, from: $from.pos - query.length - 1, to: $from.pos };
}
