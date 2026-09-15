import { examples } from "./demos/examples";
import { CardDescription, CardTitle } from "./components/ui/card";

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
            className="bg-card text-card-foreground flex h-48 flex-col gap-4 rounded-xl border px-5 py-5 text-left shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => onSelect(example.id)}
          >
            <div className="flex min-w-0 items-start gap-3">
              <Icon
                className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base leading-snug">
                  {example.title}
                </CardTitle>
                {example.recommended && (
                  <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    Recommended
                  </span>
                )}
              </div>
            </div>
            <CardDescription className="mt-auto leading-relaxed">
              {example.description}
            </CardDescription>
          </button>
        );
      })}
    </div>
  );
}
