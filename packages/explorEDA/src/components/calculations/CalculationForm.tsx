import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import { Dispatch, SetStateAction, useState } from "react";

export interface CalculationFormProps {
  resultColumnName: string;
  setResultColumnName: Dispatch<SetStateAction<string>>;
  expression: string;
  setExpression: Dispatch<SetStateAction<string>>;
  availableFields: string[];

  onSubmit: () => void;
  onCancel: () => void;
  submitButtonText: string;
}

export function CalculationForm({
  resultColumnName,
  setResultColumnName,
  expression,
  setExpression,
  availableFields,
  onSubmit,
  onCancel,
  submitButtonText,
}: CalculationFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error" | null;
  }>({
    text: "",
    type: null,
  });

  const handleValidate = () => {
    try {
      parseExpression(expression);
      setError(null);
      setStatusMessage({ text: "Expression is valid!", type: "success" });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatusMessage({ text: "Invalid expression", type: "error" });
    }
  };

  const handleInsertField = (field: string) => {
    setExpression((prev) => prev + field);
  };

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-[200px_1fr] gap-4">
          <div className="space-y-2 ">
            <Label htmlFor="result-column" className="block mb-2">
              Result Column Name
            </Label>
            <Input
              id="result-column"
              value={resultColumnName}
              onChange={(e) => setResultColumnName(e.target.value)}
              placeholder="calculated_field"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expression">Expression</Label>
            <div className="flex gap-2">
              <Input
                id="expression"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="Enter your expression..."
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleValidate}
                variant="secondary"
              >
                Validate
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {statusMessage.text && (
              <p
                className={`text-sm ${
                  statusMessage.type === "success"
                    ? "text-green-500"
                    : statusMessage.type === "error"
                      ? "text-destructive"
                      : ""
                }`}
              >
                {statusMessage.text}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Available Fields</h3>
            <div className="flex flex-wrap gap-2">
              {availableFields.map((field) => (
                <Button
                  key={field}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleInsertField(field)}
                >
                  {field}
                </Button>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{submitButtonText}</Button>
        </div>
      </div>
    </form>
  );
}
