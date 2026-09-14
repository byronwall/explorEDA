import "./styles.css";

import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { BaseChartProps } from "@/types/ChartTypes";
import { MarkdownSettings } from "./definition";

import { useDataLayer } from "@/providers/DataLayerProvider";
import { MenuBar } from "./MenuBar";

export function Markdown({
  settings,
  width,
  height,
}: BaseChartProps<MarkdownSettings>) {
  const updateChart = useDataLayer((s) => s.updateChart);

  return (
    <div style={{ width, height }} className="flex flex-col overflow-auto p-1">
      <EditorProvider
        slotBefore={<MenuBar />}
        extensions={extensions}
        content={settings.content}
        onUpdate={(value) => {
          updateChart(settings.id, {
            ...settings,
            content: value.editor.getHTML(),
          });
        }}
      />
    </div>
  );
}

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle,
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
];
