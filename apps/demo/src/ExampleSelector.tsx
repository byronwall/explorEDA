import { examples } from "./demos/examples";
import { CardDescription, CardHeader, CardTitle } from "./components/ui/card";

interface ExampleSelectorProps {
  onSelect: (exampleId: string) => void;
}

export function ExampleSelector({ onSelect }: ExampleSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {examples.map((example) => {
        const Icon = example.icon;
        return (
          <button
            type="button"
            key={example.id}
            className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm text-left cursor-pointer hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => onSelect(example.id)}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <CardTitle>{example.title}</CardTitle>
              </div>
            </CardHeader>
            <CardDescription>{example.description}</CardDescription>
          </button>
        );
      })}
    </div>
  );
}
