# Markdown Editor

- Create a new chart type called `markdown`
- It offers a very simple config that can store the saved text
- Render the minimal tiptap editor
- There is no filtering associated with this chart type
- There are no settings to render either - the text is edited in the rendered editor (not in the settings panel)

## Tip tap editor

Reference code is below.

```tsx
import { Content } from "@tiptap/core";
import { useState } from "react";
import { MinimalTiptapEditor } from "./components/minimal-tiptap";

export const App = () => {
  const [value, setValue] = useState<Content>("");

  return (
    <MinimalTiptapEditor
      value={value}
      onChange={setValue}
      className="w-full"
      editorContentClassName="p-5"
      output="html"
      placeholder="Enter your description..."
      autofocus={true}
      editable={true}
      editorClassName="focus:outline-none"
    />
  );
};
```
