import { useCurrentEditor } from "@tiptap/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ChevronDown,
  ChevronUp,
  Bold,
  Italic,
  Strikethrough,
  Code,
  X,
  Trash2,
  PilcrowSquare,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  Quote,
  Minus,
  WrapText,
  Undo2,
  Redo2,
  Palette,
  Eye,
  Type,
  Monitor,
} from "lucide-react";

type DisplayMode = "icon" | "text" | "both";

export function MenuBar() {
  const { editor } = useCurrentEditor();
  const [showControls, setShowControls] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("icon");

  if (!editor) {
    return null;
  }

  const renderContent = (icon: React.ReactNode, text: string) => {
    if (displayMode === "icon") {
      return icon;
    }
    if (displayMode === "text") {
      return text;
    }
    return (
      <>
        {icon}
        <span className="ml-2">{text}</span>
      </>
    );
  };

  return (
    <div className="control-group">
      <div className="flex gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowControls(!showControls)}
          tooltip={
            showControls ? "Hide toolbar controls" : "Show toolbar controls"
          }
          aria-label={
            showControls ? "Hide toolbar controls" : "Show toolbar controls"
          }
        >
          {showControls ? (
            <>
              Hide Controls <ChevronUp className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Show Controls <ChevronDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
        {showControls && (
          <ToggleGroup
            type="single"
            value={displayMode}
            onValueChange={(value) =>
              value && setDisplayMode(value as DisplayMode)
            }
          >
            <ToggleGroupItem value="icon" aria-label="Show icons only">
              <Eye className="h-4 w-4" />
              <span className="ml-2">Icons Only</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="text" aria-label="Show text only">
              <Type className="h-4 w-4" />
              <span className="ml-2">Text Only</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="both" aria-label="Show both icons and text">
              <Monitor className="h-4 w-4" />
              <span className="ml-2">Icons & Text</span>
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      </div>
      {showControls && (
        <div className="button-group flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "is-active" : ""}
            tooltip="Toggle bold text"
            aria-label="Toggle bold text"
          >
            {renderContent(<Bold className="h-4 w-4" />, "Bold")}
          </Button>
          <Button
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "is-active" : ""}
            tooltip="Toggle italic text"
            aria-label="Toggle italic text"
          >
            {renderContent(<Italic className="h-4 w-4" />, "Italic")}
          </Button>
          <Button
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? "is-active" : ""}
            tooltip="Toggle strikethrough text"
            aria-label="Toggle strikethrough text"
          >
            {renderContent(<Strikethrough className="h-4 w-4" />, "Strike")}
          </Button>
          <Button
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className={editor.isActive("code") ? "is-active" : ""}
            tooltip="Toggle inline code"
            aria-label="Toggle inline code"
          >
            {renderContent(<Code className="h-4 w-4" />, "Code")}
          </Button>
          <Button
            size="sm"
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
            tooltip="Clear all text formatting"
            aria-label="Clear all text formatting"
          >
            {renderContent(<X className="h-4 w-4" />, "Clear marks")}
          </Button>
          <Button
            size="sm"
            onClick={() => editor.chain().focus().clearNodes().run()}
            tooltip="Clear all block formatting"
            aria-label="Clear all block formatting"
          >
            {renderContent(<Trash2 className="h-4 w-4" />, "Clear nodes")}
          </Button>
          <Button
            size="sm"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={editor.isActive("paragraph") ? "is-active" : ""}
            tooltip="Convert to paragraph"
            aria-label="Convert to paragraph"
          >
            {renderContent(<PilcrowSquare className="h-4 w-4" />, "Paragraph")}
          </Button>
          <Button
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={
              editor.isActive("heading", { level: 1 }) ? "is-active" : ""
            }
            tooltip="Toggle heading 1"
            aria-label="Toggle heading 1"
          >
            {renderContent(<Heading1 className="h-4 w-4" />, "H1")}
          </Button>
          <Button
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={
              editor.isActive("heading", { level: 2 }) ? "is-active" : ""
            }
            tooltip="Toggle heading 2"
            aria-label="Toggle heading 2"
          >
            {renderContent(<Heading2 className="h-4 w-4" />, "H2")}
          </Button>
          <Button
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={
              editor.isActive("heading", { level: 3 }) ? "is-active" : ""
            }
            tooltip="Toggle heading 3"
            aria-label="Toggle heading 3"
          >
            {renderContent(<Heading3 className="h-4 w-4" />, "H3")}
          </Button>
          <Button
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 4 }).run()
            }
            className={
              editor.isActive("heading", { level: 4 }) ? "is-active" : ""
            }
            tooltip="Toggle heading 4"
            aria-label="Toggle heading 4"
          >
            {renderContent(<Heading4 className="h-4 w-4" />, "H4")}
          </Button>
          <Button
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 5 }).run()
            }
            className={
              editor.isActive("heading", { level: 5 }) ? "is-active" : ""
            }
            tooltip="Toggle heading 5"
            aria-label="Toggle heading 5"
          >
            {renderContent(<Heading5 className="h-4 w-4" />, "H5")}
          </Button>
          <Button
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 6 }).run()
            }
            className={
              editor.isActive("heading", { level: 6 }) ? "is-active" : ""
            }
            tooltip="Toggle heading 6"
            aria-label="Toggle heading 6"
          >
            {renderContent(<Heading6 className="h-4 w-4" />, "H6")}
          </Button>
          <Button
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? "is-active" : ""}
            tooltip="Toggle bullet list"
            aria-label="Toggle bullet list"
          >
            {renderContent(<List className="h-4 w-4" />, "Bullet list")}
          </Button>
          <Button
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive("orderedList") ? "is-active" : ""}
            tooltip="Toggle ordered list"
            aria-label="Toggle ordered list"
          >
            {renderContent(<ListOrdered className="h-4 w-4" />, "Ordered list")}
          </Button>
          <Button
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive("codeBlock") ? "is-active" : ""}
            tooltip="Toggle code block"
            aria-label="Toggle code block"
          >
            {renderContent(<Code className="h-4 w-4" />, "Code block")}
          </Button>
          <Button
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive("blockquote") ? "is-active" : ""}
            tooltip="Toggle blockquote"
            aria-label="Toggle blockquote"
          >
            {renderContent(<Quote className="h-4 w-4" />, "Blockquote")}
          </Button>
          <Button
            size="sm"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            tooltip="Insert horizontal rule"
            aria-label="Insert horizontal rule"
          >
            {renderContent(<Minus className="h-4 w-4" />, "Horizontal rule")}
          </Button>
          <Button
            size="sm"
            onClick={() => editor.chain().focus().setHardBreak().run()}
            tooltip="Insert hard break"
            aria-label="Insert hard break"
          >
            {renderContent(<WrapText className="h-4 w-4" />, "Hard break")}
          </Button>
          <Button
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            tooltip="Undo last change"
            aria-label="Undo last change"
          >
            {renderContent(<Undo2 className="h-4 w-4" />, "Undo")}
          </Button>
          <Button
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            tooltip="Redo last change"
            aria-label="Redo last change"
          >
            {renderContent(<Redo2 className="h-4 w-4" />, "Redo")}
          </Button>
          <Button
            size="sm"
            onClick={() => editor.chain().focus().setColor("#958DF1").run()}
            className={
              editor.isActive("textStyle", { color: "#958DF1" })
                ? "is-active"
                : ""
            }
            tooltip="Set text color to purple"
            aria-label="Set text color to purple"
          >
            {renderContent(<Palette className="h-4 w-4" />, "Purple")}
          </Button>
        </div>
      )}
    </div>
  );
}
