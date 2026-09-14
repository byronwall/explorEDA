import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { Edit, Eye, PlusCircle, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CalculationForm } from "./CalculationForm";
import { CalculationPreview } from "./CalculationPreview";

export type CalcBuilder = {
  name: string;
  resultColumnName: string;
  expressionString: string;
};

export function CalculationManager() {
  const calculations = useDataLayer((state) => state.calculations);
  const addCalculation = useDataLayer((state) => state.addCalculation);
  const removeCalculation = useDataLayer((state) => state.removeCalculation);
  const updateCalculation = useDataLayer((state) => state.updateCalculation);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [currentCalculation, setCurrentCalculation] = useState<string | null>(
    null
  );
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");

  const [newCalcColumn, setNewCalcColumn] = useState("");
  const [newExpression, setNewExpression] = useState("");

  const availableFields = getColumnNames();

  const handleAddCalculation = async () => {
    if (!newCalcColumn.trim()) {
      toast.error("Please enter a result column name");
      return;
    }

    if (!newExpression.trim()) {
      toast.error("Please enter an expression");
      return;
    }

    try {
      await addCalculation({
        resultColumnName: newCalcColumn,
        expression: parseExpression(newExpression),
      });

      toast.success("Calculation added successfully");
      setIsFormDialogOpen(false);
      resetNewCalculationForm();
    } catch (error) {
      toast.error(
        `Failed to add calculation: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const handleRemoveCalculation = (resultColumnName: string) => {
    removeCalculation(resultColumnName);
    toast.success("Calculation removed");
  };

  const handleEditCalculation = (resultColumnName: string) => {
    const calculation = calculations.find(
      (calc) => calc.resultColumnName === resultColumnName
    );
    if (calculation) {
      setCurrentCalculation(resultColumnName);
      setNewCalcColumn(calculation.resultColumnName);
      setNewExpression(calculation.expression.rawInput);
      setDialogMode("edit");
      setIsFormDialogOpen(true);
    }
  };

  const handlePreviewCalculation = (resultColumnName: string) => {
    const calculation = calculations.find(
      (calc) => calc.resultColumnName === resultColumnName
    );
    if (calculation) {
      setCurrentCalculation(resultColumnName);
      setIsPreviewDialogOpen(true);
    }
  };

  const handleUpdateCalculation = async () => {
    if (!currentCalculation) {
      return;
    }

    if (!newCalcColumn.trim()) {
      toast.error("Please enter a result column name");
      return;
    }

    if (!newExpression.trim()) {
      toast.error("Please enter an expression");
      return;
    }

    try {
      updateCalculation(currentCalculation, {
        resultColumnName: newCalcColumn,
        expression: parseExpression(newExpression),
      });

      toast.success("Calculation updated successfully");
      setIsFormDialogOpen(false);
    } catch (error) {
      toast.error(
        `Failed to update calculation: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const resetNewCalculationForm = () => {
    setNewCalcColumn("");
    setNewExpression("");
  };

  const openAddDialog = () => {
    resetNewCalculationForm();
    setDialogMode("add");
    setCurrentCalculation(null);
    setIsFormDialogOpen(true);
  };

  const handleFormSubmit = () => {
    if (dialogMode === "add") {
      handleAddCalculation();
    } else {
      handleUpdateCalculation();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Calculations</h2>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={openAddDialog}
        >
          <PlusCircle className="h-4 w-4" />
          Add Calculation
        </Button>
      </div>

      {calculations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No calculations defined. Add one to get started.
        </div>
      ) : (
        <div className="border rounded-md">
          <Table className="border-collapse">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px] border border-border">
                  Actions
                </TableHead>

                <TableHead className="w-[200px] text-center border border-border">
                  Result Column
                </TableHead>
                <TableHead className="w-full border border-border">
                  Expression
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculations.map((calc) => (
                <TableRow key={calc.resultColumnName}>
                  <TableCell className="w-[120px] border border-border">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handlePreviewCalculation(calc.resultColumnName)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleEditCalculation(calc.resultColumnName)
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleRemoveCalculation(calc.resultColumnName)
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>

                  <TableCell className="w-[200px] text-center border border-border">
                    {calc.resultColumnName}
                  </TableCell>
                  <TableCell className="font-mono text-sm w-full border border-border">
                    {calc.expression.rawInput}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Combined Add/Edit Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add"
                ? "Add New Calculation"
                : "Edit Calculation"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Create a new calculation to transform your data"
                : "Update your calculation"}
            </DialogDescription>
          </DialogHeader>
          <CalculationForm
            resultColumnName={newCalcColumn}
            setResultColumnName={setNewCalcColumn}
            expression={newExpression}
            setExpression={setNewExpression}
            availableFields={availableFields}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormDialogOpen(false)}
            submitButtonText={
              dialogMode === "add" ? "Add Calculation" : "Update Calculation"
            }
          />
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Calculation Preview</DialogTitle>
            <DialogDescription>Preview calculation results</DialogDescription>
          </DialogHeader>
          {currentCalculation && (
            <div className="py-4">
              {calculations.find(
                (calc) => calc.resultColumnName === currentCalculation
              )?.expression && (
                <CalculationPreview
                  calculation={
                    calculations.find(
                      (calc) => calc.resultColumnName === currentCalculation
                    )!
                  }
                  previewRows={10}
                />
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsPreviewDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
