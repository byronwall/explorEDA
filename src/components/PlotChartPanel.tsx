import { ChartSettings } from "@/types/ChartTypes";
import { RowChart } from "./charts/RowChart";
import { BarChart } from "./charts/BarChart";
import { ScatterPlot } from "./charts/ScatterPlot";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Settings2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface PlotChartPanelProps {
  settings: ChartSettings;
  onDelete: () => void;
}

export function PlotChartPanel({ settings, onDelete }: PlotChartPanelProps) {
  const renderChart = () => {
    switch (settings.type) {
      case "row":
        return <RowChart settings={settings} />;
      case "bar":
        return <BarChart settings={settings} />;
      case "scatter":
        return <ScatterPlot settings={settings} />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-medium">
          {settings.title || "Untitled Chart"}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              {/* TODO: Add chart settings UI */}
              <div className="space-y-4">
                <h4 className="font-medium leading-none">Chart Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Settings content coming soon...
                </p>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}
