import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { AggregateAggregation } from "@/lib/aggregates";
import { Plus, Table2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  barChartDefinition,
  type BarChartSettings,
} from "@/components/charts/BarChart/definition";
import {
  dataTableDefinition,
  type DataTableSettings,
} from "@/components/charts/DataTable/definition";

export function GroupedSummaryManager() {
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const calculations = useDataLayer((state) => state.calculations);
  const data = useDataLayer((state) => state.data);
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles);
  const aggregates = useDataLayer((state) => state.aggregates);
  const addAggregate = useDataLayer((state) => state.addAggregate);
  const updateAggregate = useDataLayer((state) => state.updateAggregate);
  const removeAggregate = useDataLayer((state) => state.removeAggregate);
  const addChart = useDataLayer((state) => state.addChart);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Grouped summary");
  const [groupField, setGroupField] = useState("");
  const [measureField, setMeasureField] = useState("");
  const [aggregation, setAggregation] = useState<AggregateAggregation>("count");
  const [error, setError] = useState<string>();
  const fields = useMemo(() => {
    void calculations;
    void data;
    void fieldProfiles;
    return getColumnNames();
  }, [getColumnNames, calculations, data, fieldProfiles]);
  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({});

  const create = () => {
    setError(undefined);
    try {
      const aggregate = addAggregate({
        name: name.trim() || "Grouped summary",
        groupField: groupField || fields[0] || "",
        aggregation,
        ...(aggregation === "count"
          ? {}
          : { measureField: measureField || fields[0] || "" }),
      });
      const field = aggregate.measureField ?? aggregate.groupField;
      const bar = barChartDefinition.createDefaultSettings(
        { x: 0, y: 0, w: 6, h: 5 },
        field
      );
      addChart({
        ...bar,
        title: aggregate.name,
        aggregateId: aggregate.id,
        xAxisLabel: "",
        yAxisLabel: "",
      } as Omit<BarChartSettings, "id">);
      const table = dataTableDefinition.createDefaultSettings(
        { x: 6, y: 0, w: 6, h: 5 },
        field
      );
      const tableFields = Array.from(
        new Set(
          [aggregate.groupField, aggregate.measureField].filter(
            (field): field is string => Boolean(field)
          )
        )
      );
      addChart({
        ...table,
        title: `${aggregate.name} table`,
        aggregateId: aggregate.id,
        columns: tableFields.map((field) => ({ id: field, field })),
      } as Omit<DataTableSettings, "id">);
      setOpen(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not create grouped summary"
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setError(undefined);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Table2 className="mr-2 h-4 w-4" />
          Grouped summaries
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Grouped summaries</DialogTitle>
          <DialogDescription>
            Define a grouped result from the current source and calculated
            fields.
          </DialogDescription>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <label htmlFor="aggregate-name">Name</label>
            <input
              id="aggregate-name"
              className="h-8 rounded border bg-background px-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <label htmlFor="aggregate-group">Group by</label>
            <select
              id="aggregate-group"
              className="h-8 rounded border bg-background px-2"
              value={groupField || fields[0] || ""}
              onChange={(event) => setGroupField(event.target.value)}
            >
              {fields.map((field) => (
                <option key={field}>{field}</option>
              ))}
            </select>
            <label htmlFor="aggregate-operation">Measure</label>
            <select
              id="aggregate-operation"
              className="h-8 rounded border bg-background px-2"
              value={aggregation}
              onChange={(event) =>
                setAggregation(event.target.value as AggregateAggregation)
              }
            >
              <option value="count">Count rows</option>
              <option value="sum">Sum</option>
              <option value="average">Average</option>
            </select>
            {aggregation !== "count" && (
              <>
                <label htmlFor="aggregate-measure">Measure field</label>
                <select
                  id="aggregate-measure"
                  className="h-8 rounded border bg-background px-2"
                  value={measureField || fields[0] || ""}
                  onChange={(event) => setMeasureField(event.target.value)}
                >
                  {fields.map((field) => (
                    <option key={field}>{field}</option>
                  ))}
                </select>
              </>
            )}
          </div>
          <Button size="sm" onClick={create}>
            <Plus className="mr-2 h-4 w-4" />
            Create and add views
          </Button>
          {aggregates.length > 0 && (
            <div className="border-t pt-2">
              <p className="mb-1 text-xs font-medium">Saved summaries</p>
              {aggregates.map((aggregate) => (
                <div
                  key={aggregate.id}
                  className="grid grid-cols-[1fr_1fr] items-center gap-1 py-1"
                >
                  <input
                    aria-label={`${aggregate.name} name`}
                    className="h-7 min-w-0 rounded border bg-background px-1"
                    value={nameDrafts[aggregate.id] ?? aggregate.name}
                    onChange={(event) =>
                      setNameDrafts((current) => ({
                        ...current,
                        [aggregate.id]: event.target.value,
                      }))
                    }
                    onBlur={() => {
                      const draft = nameDrafts[aggregate.id]?.trim();
                      if (!draft) {
                        return;
                      }
                      setError(undefined);
                      try {
                        updateAggregate(aggregate.id, { name: draft });
                      } catch (error) {
                        setError(
                          error instanceof Error
                            ? error.message
                            : "Could not update grouped summary"
                        );
                      }
                    }}
                  />
                  <select
                    aria-label={`${aggregate.name} group field`}
                    className="h-7 rounded border bg-background px-1"
                    value={aggregate.groupField}
                    onChange={(event) => {
                      setError(undefined);
                      try {
                        updateAggregate(aggregate.id, {
                          groupField: event.target.value,
                        });
                      } catch (error) {
                        setError(
                          error instanceof Error
                            ? error.message
                            : "Could not update grouped summary"
                        );
                      }
                    }}
                  >
                    {fields.map((field) => (
                      <option key={field}>{field}</option>
                    ))}
                  </select>
                  <select
                    aria-label={`${aggregate.name} aggregation`}
                    className="h-7 rounded border bg-background px-1"
                    value={aggregate.aggregation}
                    onChange={(event) => {
                      setError(undefined);
                      try {
                        updateAggregate(aggregate.id, {
                          aggregation: event.target
                            .value as AggregateAggregation,
                          ...(event.target.value !== "count" &&
                          !aggregate.measureField
                            ? { measureField: fields[0] }
                            : {}),
                        });
                      } catch (error) {
                        setError(
                          error instanceof Error
                            ? error.message
                            : "Could not update grouped summary"
                        );
                      }
                    }}
                  >
                    <option value="count">Count</option>
                    <option value="sum">Sum</option>
                    <option value="average">Average</option>
                  </select>
                  {aggregate.aggregation !== "count" && (
                    <select
                      aria-label={`${aggregate.name} measure field`}
                      className="h-7 rounded border bg-background px-1"
                      value={aggregate.measureField ?? fields[0] ?? ""}
                      onChange={(event) => {
                        setError(undefined);
                        try {
                          updateAggregate(aggregate.id, {
                            measureField: event.target.value,
                          });
                        } catch (error) {
                          setError(
                            error instanceof Error
                              ? error.message
                              : "Could not update grouped summary"
                          );
                        }
                      }}
                    >
                      {fields.map((field) => (
                        <option key={field}>{field}</option>
                      ))}
                    </select>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    tooltip="Delete grouped summary"
                    aria-label={`Delete ${aggregate.name}`}
                    onClick={() => {
                      setError(undefined);
                      try {
                        removeAggregate(aggregate.id);
                      } catch (error) {
                        setError(
                          error instanceof Error
                            ? error.message
                            : "Could not delete grouped summary"
                        );
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
