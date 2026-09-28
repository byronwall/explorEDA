import "./styles.css";

import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import Placeholder from "@tiptap/extension-placeholder";
import TextStyle from "@tiptap/extension-text-style";
import {
  BubbleMenu,
  EditorContent,
  FloatingMenu,
  useEditor,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Code, Italic, Strikethrough } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { modifierKey } from "@/components/KeyboardShortcutsDialog";
import { ActionTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { BaseChartProps } from "@/types/ChartTypes";
import {
  filterNoteBlocks,
  getSlashQuery,
  NOTE_BLOCKS,
  type NoteBlock,
  type SlashQuery,
} from "./blocks";
import { MarkdownSettings } from "./definition";

const extensions = [
  // Color and TextStyle keep colored text from older notes intact.
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle,
  StarterKit.configure({
    bulletList: { keepMarks: true, keepAttributes: false },
    orderedList: { keepMarks: true, keepAttributes: false },
  }),
  Placeholder.configure({
    placeholder: ({ editor, node }) => {
      if (node.type.name === "heading") return "Heading";
      return editor.isEmpty
        ? "Write a note, or type / for headings, lists, and more"
        : "Type / for blocks";
    },
  }),
];

/** Keep floating menus usable inside the expanded chart dialog. */
const appendToDialogOrBody = (reference: Element) =>
  reference.closest('[role="dialog"]') ?? document.body;

export function Markdown({
  settings,
  width,
  height,
}: BaseChartProps<MarkdownSettings>) {
  const updateChart = useDataLayer((s) => s.updateChart);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const slashMenu = useSlashMenu();

  const editor = useEditor({
    extensions,
    content: settings.content,
    editorProps: {
      attributes: {
        class: "eda-note-content",
        "aria-label": "Note text",
      },
      handleKeyDown: (_view, event) => slashMenu.handleKeyDown(event),
    },
    onUpdate: ({ editor }) => {
      updateChart(settingsRef.current.id, {
        ...settingsRef.current,
        content: editor.getHTML(),
      });
    },
  });
  slashMenu.bind(editor);

  return (
    <div
      style={{ width, height }}
      className="eda-note flex flex-col overflow-auto"
      onMouseDown={(event) => {
        // Clicking the blank space below the text puts the caret at the end.
        if (editor && event.target === event.currentTarget) {
          event.preventDefault();
          editor.chain().focus("end").run();
        }
      }}
    >
      <EditorContent editor={editor} className="flex-1 px-3 py-2" />
      {editor && <SelectionToolbar editor={editor} />}
      {editor && (
        <FloatingMenu
          editor={editor}
          pluginKey="noteSlashMenu"
          shouldShow={slashMenu.shouldShow}
          tippyOptions={{
            placement: "bottom-start",
            offset: [0, 6],
            appendTo: appendToDialogOrBody,
            onCreate: (instance) => slashMenu.setTippy(instance),
          }}
        >
          <SlashMenuList
            blocks={slashMenu.blocks}
            activeIndex={slashMenu.activeIndex}
            onHover={slashMenu.setActiveIndex}
            onPick={slashMenu.pick}
          />
        </FloatingMenu>
      )}
    </div>
  );
}

/** State for the "/" block menu, read by editor callbacks through refs. */
function useSlashMenu() {
  const editorRef = useRef<Editor | null>(null);
  const tippyRef = useRef<{ hide: () => void } | null>(null);
  const dismissedAtRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const query = editorRef.current
    ? getSlashQuery(editorRef.current.state)
    : null;
  const blocks = query ? filterNoteBlocks(query.query) : [];

  const stateRef = useRef({ query, blocks, activeIndex });
  stateRef.current = { query, blocks, activeIndex };

  const queryText = query?.query;
  useEffect(() => setActiveIndex(0), [queryText]);

  const isOpen = (current: SlashQuery | null) =>
    !!current &&
    dismissedAtRef.current !== current.from &&
    filterNoteBlocks(current.query).length > 0;

  const pick = (block: NoteBlock) => {
    const editor = editorRef.current;
    const current = stateRef.current.query;
    if (!editor || !current) return;
    block
      .apply(
        editor
          .chain()
          .focus()
          .deleteRange({ from: current.from, to: current.to })
      )
      .run();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const {
      query: current,
      blocks: options,
      activeIndex: index,
    } = stateRef.current;
    if (!isOpen(current) || options.length === 0) return false;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index + step + options.length) % options.length);
      return true;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      const block = options[Math.min(index, options.length - 1)];
      if (block) pick(block);
      return true;
    }
    if (event.key === "Escape") {
      dismissedAtRef.current = current!.from;
      tippyRef.current?.hide();
      return true;
    }
    return false;
  };

  return {
    blocks,
    activeIndex: Math.min(activeIndex, Math.max(blocks.length - 1, 0)),
    setActiveIndex,
    pick,
    handleKeyDown,
    bind: (editor: Editor | null) => {
      editorRef.current = editor;
    },
    setTippy: (instance: { hide: () => void }) => {
      tippyRef.current = instance;
    },
    shouldShow: ({ state }: { state: Editor["state"] }) => {
      const current = getSlashQuery(state);
      if (!current) dismissedAtRef.current = null;
      return isOpen(current);
    },
  };
}

function SlashMenuList({
  blocks,
  activeIndex,
  onHover,
  onPick,
}: {
  blocks: NoteBlock[];
  activeIndex: number;
  onHover: (index: number) => void;
  onPick: (block: NoteBlock) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const list = listRef.current;
    // Only scroll once the menu has moved into its floating layer.
    if (!list?.closest("[data-tippy-root]")) return;
    list
      .querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label="Insert block"
      className="eda-note-menu max-h-80 w-56 overflow-y-auto p-1"
    >
      {blocks.map((block, index) => {
        const Icon = block.icon;
        return (
          <div
            key={block.id}
            role="option"
            aria-selected={index === activeIndex}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1 text-sm",
              index === activeIndex && "bg-accent text-accent-foreground"
            )}
            onMouseEnter={() => onHover(index)}
            onMouseDown={(event) => {
              event.preventDefault();
              onPick(block);
            }}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-background">
              <Icon className="size-4" aria-hidden />
            </span>
            <span className="flex-1 truncate">{block.label}</span>
            {block.shortcut && (
              <kbd className="font-mono text-xs text-muted-foreground">
                {block.shortcut}
              </kbd>
            )}
          </div>
        );
      })}
    </div>
  );
}

const MARKS = [
  {
    id: "bold",
    label: "Bold",
    keys: `${modifierKey}+B`,
    icon: Bold,
    toggle: (editor: Editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    id: "italic",
    label: "Italic",
    keys: `${modifierKey}+I`,
    icon: Italic,
    toggle: (editor: Editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    id: "strike",
    label: "Strikethrough",
    keys: `${modifierKey}+Shift+S`,
    icon: Strikethrough,
    toggle: (editor: Editor) => editor.chain().focus().toggleStrike().run(),
  },
  {
    id: "code",
    label: "Inline code",
    keys: `${modifierKey}+E`,
    icon: Code,
    toggle: (editor: Editor) => editor.chain().focus().toggleCode().run(),
  },
];

const TURN_INTO = NOTE_BLOCKS.filter((block) => block.id !== "divider");

/** Formatting that appears beside a text selection. */
function SelectionToolbar({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="noteSelectionToolbar"
      shouldShow={({ editor, state }) =>
        editor.isEditable &&
        !state.selection.empty &&
        !editor.isActive("codeBlock") &&
        state.doc.textBetween(state.selection.from, state.selection.to).trim()
          .length > 0
      }
      tippyOptions={{
        placement: "top-start",
        maxWidth: "none",
        popperOptions: {
          modifiers: [
            { name: "preventOverflow", options: { padding: 8, altAxis: true } },
          ],
        },
        appendTo: appendToDialogOrBody,
      }}
    >
      <div
        role="toolbar"
        aria-label="Format selection"
        className="eda-note-menu flex w-max max-w-[calc(100vw-2rem)] flex-wrap items-center p-1"
      >
        {MARKS.map((mark) => (
          <ToolbarButton
            key={mark.id}
            label={mark.label}
            hint={mark.keys}
            active={editor.isActive(mark.id)}
            onPress={() => mark.toggle(editor)}
          >
            <mark.icon className="size-4" aria-hidden />
          </ToolbarButton>
        ))}
        <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />
        {TURN_INTO.map((block) => (
          <ToolbarButton
            key={block.id}
            label={`Turn into ${block.label.toLowerCase()}`}
            hint={block.shortcut ? `Type ${block.shortcut} at line start` : ""}
            active={block.id !== "text" && !!block.isActive?.(editor)}
            onPress={() => block.apply(editor.chain().focus()).run()}
          >
            <block.icon className="size-4" aria-hidden />
          </ToolbarButton>
        ))}
      </div>
    </BubbleMenu>
  );
}

function ToolbarButton({
  label,
  hint,
  active,
  onPress,
  children,
}: {
  label: string;
  hint: string;
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <ActionTooltip
      side="bottom"
      content={
        <span className="flex items-center gap-2">
          {label}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </span>
      }
    >
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        className={cn(
          "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring",
          active && "bg-accent text-foreground"
        )}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onPress}
      >
        {children}
      </button>
    </ActionTooltip>
  );
}
