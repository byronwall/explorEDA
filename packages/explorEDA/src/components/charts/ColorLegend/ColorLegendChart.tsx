import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useColorScales } from "@/hooks/useColorScales";
import { BaseChartProps } from "@/types/ChartTypes";
import { ColorLegendSettings } from "./definition";
import { ColorScale } from "./ColorScale";

export function ColorLegendChart({
  settings,
  width,
  height,
}: BaseChartProps<ColorLegendSettings>) {
  const { colorScales, getOrCreateScaleForField, getColorForValue } =
    useColorScales();

  if (settings.fields.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full text-muted-foreground">
        Select a field to see a legend
      </div>
    );
  }

  return (
    <div
      className="flex flex-col p-4 gap-4 overflow-y-auto"
      style={{ width, height }}
    >
      <ScrollArea className="flex-1">
        <div className="grid gap-4 grid-cols-1">
          {settings.fields.map((field) => {
            // Get or create a color scale for this field
            const scaleId = getOrCreateScaleForField(field);
            const scale = colorScales.find((s) => s.id === scaleId);

            if (!scale) {
              return null;
            }

            return (
              <Card key={field} className="p-4">
                <div className="font-medium mb-2">{field}</div>
                <ColorScale
                  scale={scale}
                  wrap={settings.wrap}
                  numericalBreakpoints={settings.numericalBreakpoints}
                  getColorForValue={getColorForValue}
                />
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
